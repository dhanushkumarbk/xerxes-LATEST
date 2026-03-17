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

// ------- HELPERS -------
function stringifyUserDataForPrompt(userData) {
  const entries = Object.entries(userData).filter(([_, val]) =>
    val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)
  );
  return entries
    .map(([key, val]) => {
      const displayKey = key.replace(/_/g, ' ');
      if (Array.isArray(val)) return `- ${displayKey}: ${val.join(', ')}`;
      return `- ${displayKey}: ${val}`;
    })
    .join('\n');
}

// ------- FALLBACK WORKOUT PLAN -------
function generateFallbackWorkoutPlan(userData) {
  const goal = userData.primary_goal || userData.goal || 'Muscle Gain';
  const experience = userData.experience_level || 'Beginner';
  const equipment = userData.equipment || 'Basic Equipment';
  
  return `## Day 1
| Day | Workout | Sets/Reps or Duration |
|-----|---------|-----------------------|
| 1   | Push-ups | 3 x 12 |
| 1   | Squats | 3 x 15 |
| 1   | Plank | 3 x 30 seconds |
| 1   | Lunges | 3 x 10 each leg |
| 1   | Mountain Climbers | 3 x 20 |

## Day 2
| Day | Workout | Sets/Reps or Duration |
|-----|---------|-----------------------|
| 2   | Pull-ups | 3 x 8 |
| 2   | Deadlifts | 3 x 10 |
| 2   | Burpees | 3 x 15 |
| 2   | Russian Twists | 3 x 20 |
| 2   | Jump Rope | 3 x 2 minutes |

## Day 3
| Day | Workout | Sets/Reps or Duration |
|-----|---------|-----------------------|
| 3   | Bench Press | 3 x 12 |
| 3   | Overhead Press | 3 x 10 |
| 3   | Dips | 3 x 12 |
| 3   | Lateral Raises | 3 x 15 |
| 3   | Tricep Dips | 3 x 15 |

## Day 4
| Day | Workout | Sets/Reps or Duration |
|-----|---------|-----------------------|
| 4   | Rest Day | Active Recovery |
| 4   | Light Walking | 30 minutes |
| 4   | Stretching | 15 minutes |
| 4   | Yoga | 20 minutes |
| 4   | Meditation | 10 minutes |

## Day 5
| Day | Workout | Sets/Reps or Duration |
|-----|---------|-----------------------|
| 5   | Deadlifts | 4 x 8 |
| 5   | Barbell Rows | 3 x 12 |
| 5   | Lat Pulldowns | 3 x 15 |
| 5   | Face Pulls | 3 x 15 |
| 5   | Bicep Curls | 3 x 12 |

## Day 6
| Day | Workout | Sets/Reps or Duration |
|-----|---------|-----------------------|
| 6   | Squats | 4 x 10 |
| 6   | Leg Press | 3 x 15 |
| 6   | Leg Extensions | 3 x 15 |
| 6   | Leg Curls | 3 x 15 |
| 6   | Calf Raises | 3 x 20 |

## Day 7
| Day | Workout | Sets/Reps or Duration |
|-----|---------|-----------------------|
| 7   | Cardio | 30 minutes |
| 7   | HIIT Training | 20 minutes |
| 7   | Core Work | 15 minutes |
| 7   | Cool Down | 10 minutes |
| 7   | Stretching | 10 minutes |`;
}

// ------- AI GENERATION -------
async function generateWorkoutPlanText(userData) {
  const prompt = `
Generate a strict 7-day personalized workout plan for the following user:

${stringifyUserDataForPrompt(userData)}

IMPORTANT:
- Create exactly 7 sections, each titled "## Day X".
- For each day, output a Markdown table in this format:
| Day | Workout | Sets/Reps or Duration |
|-----|---------|-----------------------|
| X   | [Workout Name] | [3 x 12 or 20 min] |
| X   | [Workout Name] | [3 x 12 or 20 min] |
| X   | [Workout Name] | [3 x 12 or 20 min] |
| X   | [Workout Name] | [3 x 12 or 20 min] |
| X   | [Workout Name] | [3 x 12 or 20 min] |

- Each day must have 5 rows only.
- Tailor workouts to the user's goals, experience, equipment, and preferences.
- No extra commentary or text outside the tables.
  `;

  try {
    // Check if Azure OpenAI is configured
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY) {
      console.log('[WORKOUT PLAN] Azure OpenAI not configured, using fallback plan');
      return generateFallbackWorkoutPlan(userData);
    }

    const response = await fetch(AZURE_OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a certified fitness trainer.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI error: ${response.status} ${errorText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[WORKOUT PLAN] Azure OpenAI failed, using fallback plan:', error.message);
    return generateFallbackWorkoutPlan(userData);
  }
}

// ------- PARSER -------
function parseMarkdownWorkoutTables(text) {
  const days = [];
  const dayRegex = /##+\s*Day\s*(\d+)\s*\n([\s\S]*?)(?=(##+\s*Day\s*\d+|$))/gi;
  let match;
  while ((match = dayRegex.exec(text)) !== null) {
    const dayNum = Number(match[1]);
    const markdownSection = match[2];
    const lines = markdownSection.split('\n').filter(line => line.trim().startsWith('|'));
    if (lines.length < 3) continue;
    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    if (headers.length !== 3 || headers[0].toLowerCase() !== 'day') continue;
    const rows = lines.slice(2).map(line => {
      const cells = line.split('|').map(c => c.trim());
      return [cells[1] || '', cells[2] || '', cells[3] || ''];
    });
    if (rows.length !== 5) continue; // Ensure 5 workouts per day
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
    `Generated on ${new Date().toLocaleDateString()} | For fitness guidance only.`,
    doc.page.margins.left,
    bottomY,
    { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right }
  );
  doc.restore();
}

// ------- BRAND BACKGROUND -------
function drawBrandedBackground(doc, imagePath) {
  doc.save();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#F9FAFB');
  doc.restore();
  if (fs.existsSync(imagePath)) {
    doc.save();
    doc.opacity(0.2);
    doc.image(imagePath, doc.page.width / 2 - 150, doc.page.height / 2 - 150, { width: 300, height: 300 });
    doc.opacity(1);
    doc.restore();
  }
}

// ------- TABLE RENDERER -------
function renderWorkoutTable(doc, headers, rows) {
  const leftMargin = doc.page.margins.left;
  const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidths = [50, 200, tableWidth - 250];

  const drawHeader = (y) => {
    doc.save();
    doc.rect(leftMargin, y, tableWidth, 36).fill('#FFD700');
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#111');
    doc.text(headers[0], leftMargin + 5, y + 10, { width: colWidths[0] - 10, align: 'center' });
    doc.text(headers[1], leftMargin + colWidths[0] + 5, y + 10, { width: colWidths[1] - 10, align: 'center' });
    doc.text(headers[2], leftMargin + colWidths[0] + colWidths[1] + 5, y + 10, { width: colWidths[2] - 10, align: 'center' });
    doc.restore();
    return y + 36;
  };

  let y = drawHeader(doc.y);

  for (const row of rows) {
    const rowHeight = 32;

    // Check if page has space
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 40) {
      addFooter(doc);
      doc.addPage();
      drawBrandedBackground(doc, path.join(__dirname, 'logo.png'));
      y = drawHeader(doc.page.margins.top);
    }

    // Draw the row
    doc.save().lineWidth(1).strokeColor('#FFD700');
    doc.rect(leftMargin, y, colWidths[0], rowHeight).stroke();
    doc.rect(leftMargin + colWidths[0], y, colWidths[1], rowHeight).stroke();
    doc.rect(leftMargin + colWidths[0] + colWidths[1], y, colWidths[2], rowHeight).stroke();
    doc.restore();

    doc.font('Helvetica').fontSize(11).fillColor('#222');
    doc.text(row[0], leftMargin + 5, y + 10, { width: colWidths[0] - 10, align: 'center' });
    doc.text(row[1], leftMargin + colWidths[0] + 5, y + 10, { width: colWidths[1] - 10, align: 'left' });
    doc.text(row[2], leftMargin + colWidths[0] + colWidths[1] + 5, y + 10, { width: colWidths[2] - 10, align: 'left' });

    y += rowHeight;
  }
  doc.y = y + 12;
}

// ------- MAIN PDF GENERATION -------
async function generateWorkoutPlanPDF(workoutText, filename, userData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: 'A4' });
    const stream = fs.createWriteStream(filename);
    doc.pipe(stream);

    const bgImagePath = path.join(__dirname, 'logo.png');
    drawBrandedBackground(doc, bgImagePath);

    doc.on('pageAdded', () => {
      drawBrandedBackground(doc, bgImagePath);
    });

    // --- Logo ---
    const logoPath = path.join(__dirname, 'logo.png');
    const logoWidth = 120;
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - logoWidth / 2, doc.page.margins.top, { width: logoWidth });
      doc.y = doc.page.margins.top + logoWidth + 30;
    } else {
      doc.y = doc.page.margins.top + 30;
    }

    // --- Title ---
    const titleText = 'Your Personalized Workout Plan';
    const barWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    doc.save();
    doc.rect(doc.page.margins.left, doc.y, barWidth, 42).fill('#FFD700');
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#111');
    doc.text(titleText, doc.page.margins.left, doc.y + 8, { width: barWidth, align: 'center' });
    doc.y += 54;

    // --- User Info ---
    if (userData) {
      const boxHeight = 100;
      const boxTop = doc.y;
      doc.save();
      doc.roundedRect(doc.page.margins.left, boxTop, barWidth, boxHeight, 8)
        .fillAndStroke('#FFFDE7', '#FFD700');
      doc.restore();
      doc.font('Helvetica-Bold').fillColor('#111').fontSize(13);
      doc.text(`Name: ${userData.full_name || 'N/A'}`, doc.page.margins.left + 12, boxTop + 10);
      doc.font('Helvetica').fontSize(12).fillColor('#222');
      doc.text(`Gender: ${userData.gender || 'N/A'}`, doc.page.margins.left + 250, boxTop + 10);
      doc.text(`Age: ${userData.age || 'N/A'}`, doc.page.margins.left + 12, boxTop + 30);
      doc.text(`Height: ${userData.height_cm || 'N/A'} cm`, doc.page.margins.left + 80, boxTop + 30);
      doc.text(`Weight: ${userData.weight_kg || 'N/A'} kg`, doc.page.margins.left + 180, boxTop + 30);
      doc.text(`Goal: ${userData.primary_goal || 'N/A'}`, doc.page.margins.left + 12, boxTop + 50);
      doc.text(`Experience: ${userData.experience_level || 'N/A'}`, doc.page.margins.left + 200, boxTop + 50);
      doc.text(`Days/Week: ${userData.days_per_week || 'N/A'}`, doc.page.margins.left + 12, boxTop + 70);
      doc.text(`Duration: ${userData.workout_duration || 'N/A'} min`, doc.page.margins.left + 200, boxTop + 70);
      doc.y = boxTop + boxHeight + 20;
    }

    // --- Workout Plan ---
    const days = parseMarkdownWorkoutTables(workoutText);

    days.forEach((day, index) => {
      if (doc.y > doc.page.height - doc.page.margins.bottom - 80) {
        addFooter(doc);
        doc.addPage();
      }
      doc.save();
      doc.rect(doc.page.margins.left, doc.y, barWidth, 32).fill('#FFD700');
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#111');
      doc.text(`Day ${day.day} Workout Plan`, doc.page.margins.left + 14, doc.y + 8);
      doc.restore();
      doc.y += 36;

      renderWorkoutTable(doc, day.headers, day.rows);

      if (index < days.length - 1) doc.y += 10;
    });

    addFooter(doc);
    doc.end();
    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
}

module.exports = {
  generateWorkoutPlanText,
  generateWorkoutPlanPDF,
};
