import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate PDF for "Arbeitsübersicht pro Mitarbeiter": employee name, X shifts / Y hours, table (Day, Date, Start, Finish, Hours), total.
 * @param {Object} options
 * @param {string} options.employeeName
 * @param {string} options.periodLabel - e.g. "This week (16.2.2026 – 22.2.2026)"
 * @param {Array<{day: string, date: string, start: string, finish: string, hours: number}>} options.shiftRows
 * @param {number} options.totalHours
 */
export function generateEmployeeWorkPdf({ employeeName, periodLabel, shiftRows, totalHours }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 18;
  let y = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(employeeName || 'Mitarbeiter', margin, y);
  y += 8;

  const shiftCount = shiftRows.length;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${shiftCount} shifts / ${totalHours} hours`, margin, y);
  y += 4;

  if (periodLabel) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(periodLabel, margin, y);
    doc.setTextColor(0, 0, 0);
    y += 6;
  } else {
    y += 4;
  }

  const tableColumns = ['Day', 'Date', 'Start', 'Finish', 'Hours'];
  const tableBody = shiftRows.map((r) => [
    r.day || '',
    r.date || '',
    r.start || '',
    r.finish || '',
    String(r.hours ?? 0),
  ]);

  autoTable(doc, {
    startY: y,
    head: [tableColumns],
    body: tableBody.length ? tableBody : [['–', '–', '–', '–', '–']],
    margin: { left: margin },
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 28 },
      2: { cellWidth: 32 },
      3: { cellWidth: 32 },
      4: { cellWidth: 22 },
    },
  });

  y = (doc.lastAutoTable?.finalY ?? y) + 4;

  const colEnd4 = margin + 22 + 28 + 32 + 32;
  const colEnd5 = colEnd4 + 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Total', colEnd4, y, { align: 'right' });
  doc.text(String(totalHours), colEnd5, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  const safeName = (employeeName || 'Arbeitsuebersicht').replace(/[^a-zA-Z0-9äöüÄÖÜß\- ]/g, '_').slice(0, 40);
  doc.save(`Arbeitsuebersicht_${safeName}.pdf`);
}
