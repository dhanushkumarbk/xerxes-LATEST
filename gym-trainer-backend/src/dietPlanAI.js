const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const fetch =
  typeof global.fetch === 'function'
    ? (...args) => global.fetch(...args)
    : (...args) => import('node-fetch').then(mod => mod.default(...args));

// ------- CONFIG -------
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;

// Check if Azure OpenAI is configured
const isAzureOpenAIConfigured = AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_API_KEY && 
  AZURE_OPENAI_ENDPOINT !== 'undefined' && AZURE_OPENAI_API_KEY !== 'undefined';

// ------- HELPERS -------
function getMealNames(userData) {
  if (Array.isArray(userData.meal_names) && userData.meal_names.length === Number(userData.meal_frequency))
    return userData.meal_names;
  const freq = Number(userData.meal_frequency);
  switch (freq) {
    case 1: return ['Dinner'];
    case 2: return ['Lunch', 'Dinner'];
    case 3: return ['Breakfast', 'Lunch', 'Dinner'];
    case 4: return ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
    case 5: return ['Breakfast', 'Mid-morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];
    default: return Array(freq).fill().map((_, i) => `Meal ${i + 1}`);
  }
}

function stringifyUserDataForPrompt(userData) {
  const entries = Object.entries(userData).filter(([_, val]) =>
    val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)
  );
  return entries.map(([key, val]) => {
    const displayKey = key.replace(/_/g, ' ');
    if (Array.isArray(val)) return `- ${displayKey}: ${val.join(', ')}`;
    return `- ${displayKey}: ${val}`;
  }).join('\n');
}

// ------- FALLBACK DIET PLAN GENERATION -------
function generateFallbackDietPlan(userData) {
  const mealNames = getMealNames(userData);
  const cuisine = userData.cuisine_preference || 'Indian';
  const goal = userData.goal || 'General Health';
  
  let days = [];
  for (let day = 1; day <= 7; day++) {
    let dayPlan = `## Day ${day}\n| Meal | Menu |\n|------|------|\n`;
    
    mealNames.forEach(meal => {
      let menu = '';
      if (meal.toLowerCase().includes('breakfast')) {
        menu = `${cuisine} breakfast with whole grains, protein, and healthy fats`;
      } else if (meal.toLowerCase().includes('lunch')) {
        menu = `${cuisine} lunch with balanced protein, carbs, and vegetables`;
      } else if (meal.toLowerCase().includes('dinner')) {
        menu = `${cuisine} dinner with lean protein and vegetables`;
      } else if (meal.toLowerCase().includes('snack')) {
        menu = `Healthy ${cuisine} snack with nuts, fruits, or yogurt`;
      } else {
        menu = `${cuisine} meal optimized for ${goal}`;
      }
      
      dayPlan += `| ${meal} | ${menu} |\n`;
    });
    
    days.push(dayPlan);
  }
  
  return days.join('\n\n');
}

// ------- AI GENERATION -------
async function generateDietPlanText(userData) {
  // Check if Azure OpenAI is properly configured
  if (!isAzureOpenAIConfigured) {
    console.log('Azure OpenAI not configured, using fallback diet plan generation');
    return generateFallbackDietPlan(userData);
  }

  const mealNames = getMealNames(userData);
  const mealRowsSample = mealNames.map(name => `| ${name} | ... |`).join('\n');
  const prompt = `
Generate a detailed, personalized 7-day Indian diet plan for the following user:

${stringifyUserDataForPrompt(userData)}

IMPORTANT:
- Generate exactly ${userData.meal_frequency} meals per day, no more, no less.
- Meals per day ONLY: ${mealNames.join(', ')} for each day.
- Output ONLY as Markdown tables, ONE table per day, each as:
## Day 1
| Meal | Menu |
|------|------|
${mealRowsSample}
...
## Day 7
| Meal | Menu |
|------|------|
${mealRowsSample}
- Each table = 2 columns ("Meal", "Menu"), and ${userData.meal_frequency} rows.
- No snacks/extras. Menus must comply with allergies, dietary preferences/medical/goal.
- No explanations, summaries, or extra text anywhere.
`;

  try {
    const response = await fetch(AZURE_OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a certified Indian nutritionist.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI error:', response.status, errorText);
      console.log('Falling back to generated diet plan');
      return generateFallbackDietPlan(userData);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    console.log('Falling back to generated diet plan');
    return generateFallbackDietPlan(userData);
  }
}

// ------- PARSER -------
function parseMarkdownTables(text, mealCount, mealNames) {
  const days = [];
  const dayRegex = /##+\s*Day\s*(\d+)\s*\n([\s\S]*?)(?=(##+\s*Day\s*\d+|$))/gi;
  let match;
  while ((match = dayRegex.exec(text)) !== null) {
    const dayNum = Number(match[1]);
    const markdownSection = match[2];
    const lines = markdownSection.split('\n').filter(line => line.trim().startsWith('|'));
    if (lines.length < 3) continue;
    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    if (headers.length !== 2 || typeof headers[0] !== 'string' || typeof headers[1] !== 'string' || headers[0].toLowerCase() !== 'meal' || headers[1].toLowerCase() !== 'menu') continue;
    const rows = lines.slice(2).map(line => {
      const cells = line.split('|').map(c => c.trim());
      return [cells[1] || '', cells[2] || ''];
    });
    if (rows.length !== mealCount) continue;
    // Debug logging for undefined issues
    if (rows.some((r, i) => typeof r[0] !== 'string' || typeof mealNames[i] !== 'string')) {
      console.error('DietPlanAI: Invalid row or mealName:', {rows, mealNames});
    }
    let mealNamesValid = rows.every((r, i) => typeof r[0] === 'string' && typeof mealNames[i] === 'string' && r[0].toLowerCase() === mealNames[i].toLowerCase());
    if (!mealNamesValid) continue;
    days.push({ day: dayNum, headers, rows });
  }
  return days;
}

// ------- FOOTER -------
function addFooter(doc) {
  const bottomY = doc.page.height - doc.page.margins.bottom - 20;
  doc.save();
  doc.fontSize(9).fillColor('#888');
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} | For personal health guidance only.`,
    doc.page.margins.left,
    bottomY,
    { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right }
  );
  doc.restore();
}

// ------- BRAND BACKGROUND -------
function drawBrandedBackground(doc, imagePath) {
  doc.save();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFF8F2');
  doc.restore();
  if (fs.existsSync(imagePath)) {
    doc.save();
    doc.opacity(0.60);
    doc.image(imagePath, doc.page.width / 2 - 250, doc.page.height / 2 - 250, { width: 500, height: 500 });
    doc.opacity(1);
    doc.restore();
  }
}

// ------- TABLE RENDERER -------
function renderMealTable(doc, headers, rows) {
  const leftMargin = doc.page.margins.left;
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidths = [150, tableWidth - 150];

  const drawHeader = (y) => {
    doc.save();
    doc.rect(leftMargin, y, tableWidth, 38).fill('#FF9800');
    doc.font('Helvetica-Bold').fontSize(15).fillColor('white');
    doc.text(headers[0], leftMargin + 10, y + 12, { width: colWidths[0] - 20, align: 'center' });
    doc.text(headers[1], leftMargin + colWidths[0] + 10, y + 12, { width: colWidths[1] - 20, align: 'left' });
    doc.restore();
    return y + 38;
  };

  let y = drawHeader(doc.y);

  for (const row of rows) {
    const meal = row[0];
    const menu = row[1].length > 300 ? row[1].slice(0, 300) + '...' : row[1];
    const menuHeight = doc.heightOfString(menu, { width: colWidths[1] - 20 });
    const rowHeight = Math.max(38, menuHeight + 20);

    // Check if the row fits
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 40) {
      addFooter(doc);
      doc.addPage();
      drawBrandedBackground(doc, path.join(__dirname, 'brand-bg.png'));
      y = drawHeader(doc.page.margins.top);
    }

    // Draw the row
    doc.save().lineWidth(1.1).strokeColor('#FF9800');
    doc.rect(leftMargin, y, colWidths[0], rowHeight).stroke();
    doc.rect(leftMargin + colWidths[0], y, colWidths[1], rowHeight).stroke();
    doc.restore();

    doc.font('Helvetica').fontSize(12).fillColor('#222');
    doc.text(meal, leftMargin + 10, y + 10, { width: colWidths[0] - 20, align: 'center' });
    doc.text(menu, leftMargin + colWidths[0] + 10, y + 10, { width: colWidths[1] - 20, align: 'left' });

    y += rowHeight;
  }
  doc.y = y + 12;
}

// ------- MAIN PDF GENERATION -------
async function generateDietPlanPDF(dietText, filename, userData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    const stream = fs.createWriteStream(filename);
    doc.pipe(stream);

    const bgImagePath = path.join(__dirname, 'brand-bg.png');
    drawBrandedBackground(doc, bgImagePath);

    doc.on('pageAdded', () => {
      drawBrandedBackground(doc, bgImagePath);
    });

    // --- Logo ---
    const logoPath = path.join(__dirname, 'logo.png');
    const logoWidth = 140;
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - logoWidth / 2, doc.page.margins.top, { width: logoWidth });
      doc.y = doc.page.margins.top + logoWidth + 40;
    } else {
      doc.y = doc.page.margins.top + 40;
    }

    // --- Title ---
    const titleText = 'Your Personalized Diet Plan';
    const barWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.save();
    doc.rect(doc.page.margins.left, doc.y, barWidth, 48).fill('#FF9800');
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(26).fillColor('white');
    doc.text(titleText, doc.page.margins.left, doc.y + 11, { width: barWidth, align: 'center' });
    doc.y += 62;

    // --- User Info ---
    if (userData) {
      const boxHeight = 105;
      const boxTop = doc.y;
      doc.save();
      doc.roundedRect(doc.page.margins.left, boxTop, barWidth, boxHeight, 8).fillAndStroke('#FFF3E0', '#FF9800');
      doc.restore();
      doc.font('Helvetica-Bold').fillColor('#222').fontSize(13);
      doc.text(`Name: ${userData.full_name || 'N/A'}`, doc.page.margins.left + 12, boxTop + 10);
      doc.font('Helvetica').fontSize(12).fillColor('#222');
      doc.text(`Gender: ${userData.gender || 'N/A'}`, doc.page.margins.left + 250, boxTop + 10);
      doc.text(`Age: ${userData.age || 'N/A'}`, doc.page.margins.left + 12, boxTop + 30);
      doc.text(`Height: ${userData.height_cm || 'N/A'} cm`, doc.page.margins.left + 70, boxTop + 30);
      doc.text(`Weight: ${userData.weight_kg || 'N/A'} kg`, doc.page.margins.left + 150, boxTop + 30);
      let bmi = 'N/A';
      if (userData.height_cm && userData.weight_kg) {
        const h = Number(userData.height_cm) / 100;
        if (h > 0) bmi = (Number(userData.weight_kg) / (h * h)).toFixed(1);
      }
      doc.text(`BMI: ${bmi}`, doc.page.margins.left + 250, boxTop + 30);
      doc.font('Helvetica-Bold').fillColor('#FF9800').fontSize(13);
      doc.text(`Main Goal: ${userData.goal || 'N/A'}`, doc.page.margins.left + 12, boxTop + 52);
      doc.font('Helvetica').fontSize(12).fillColor('#222');
      doc.text(`Workout: ${userData.workout_duration_minutes || 'N/A'} min/session, ${userData.workout_frequency || 'N/A'}x/week`, doc.page.margins.left + 250, boxTop + 52);
      doc.text(`Cuisine Preference: ${userData.cuisine_preference || 'N/A'}`, doc.page.margins.left + 12, boxTop + 72);
      doc.text(`Food Allergies: ${userData.food_allergies || 'None'}`, doc.page.margins.left + 200, boxTop + 72);
      doc.y = boxTop + boxHeight + 20;
    }

    // --- Diet Plan ---
    const mealCountWanted = Number(userData.meal_frequency) || 3;
    const mealNames = getMealNames(userData);
    const days = parseMarkdownTables(dietText, mealCountWanted, mealNames);

    days.forEach((day, index) => {
      if (doc.y > doc.page.height - doc.page.margins.bottom - 80) {
        addFooter(doc);
        doc.addPage();
      }
      doc.save();
      doc.rect(doc.page.margins.left, doc.y, barWidth, 32).fill('#FF9800');
      doc.font('Helvetica-Bold').fontSize(16).fillColor('white');
      doc.text(`Day ${day.day} Meal Plan`, doc.page.margins.left + 14, doc.y + 8);
      doc.restore();
      doc.y += 36;

      renderMealTable(doc, day.headers, day.rows);

      // Add a small gap before next day
      if (index < days.length - 1) doc.y += 10;
    });

    // Add final footer
    addFooter(doc);
    doc.end();
    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
}

module.exports = {
  generateDietPlanText,
  generateDietPlanPDF,
};
