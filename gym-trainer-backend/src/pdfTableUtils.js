// Utility to render a clean table using PDFKit for meal plans
module.exports = function renderMealTable(doc, headers, rows, options = {}) {
  const startX = options.x || doc.x;
  let y = options.y || doc.y;
  const colWidths = options.colWidths || [120, 350];
  const rowPad = 4;
  const headerHeight = 24;
  const rowFont = options.rowFont || 'Helvetica';
  const headerFont = options.headerFont || 'Helvetica-Bold';

  // Draw header
  doc.font(headerFont).fontSize(13);
  doc.rect(startX, y, colWidths[0], headerHeight).fillAndStroke('#F0F0F0', '#000');
  doc.rect(startX + colWidths[0], y, colWidths[1], headerHeight).fillAndStroke('#F0F0F0', '#000');
  doc.fillColor('#333').text(headers[0], startX + 8, y + 6, { width: colWidths[0] - 16 });
  doc.text(headers[1], startX + colWidths[0] + 8, y + 6, { width: colWidths[1] - 16 });
  y += headerHeight;

  // Draw rows
  doc.font(rowFont).fontSize(12).fillColor('black');
  for (const row of rows) {
    // Clean up cell content: replace <br> with \n, strip HTML, trim
    let meal = (row[0] || '').replace(/<br\s*\/?/gi, '\n').replace(/<[^>]+>/g, '').trim();
    let menu = (row[1] || '').replace(/<br\s*\/?/gi, '\n').replace(/<[^>]+>/g, '').trim();
    // Calculate height needed for wrapped text
    const mealHeight = doc.heightOfString(meal, { width: colWidths[0] - 16 });
    const menuHeight = doc.heightOfString(menu, { width: colWidths[1] - 16 });
    const rowHeight = Math.max(22, mealHeight, menuHeight) + rowPad;
    // Draw cells
    doc.rect(startX, y, colWidths[0], rowHeight).stroke();
    doc.rect(startX + colWidths[0], y, colWidths[1], rowHeight).stroke();
    doc.text(meal, startX + 8, y + rowPad/2, { width: colWidths[0] - 16 });
    doc.text(menu, startX + colWidths[0] + 8, y + rowPad/2, { width: colWidths[1] - 16 });
    y += rowHeight;
    if (y > doc.page.height - 80) { doc.addPage(); y = doc.y; }
  }
  doc.moveDown(1.5);
  return y;
};
