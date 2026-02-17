import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate roster PDF: employees x days table with shifts.
 * @param {Object} options
 * @param {Array<{id: string, name: string}>} options.employees
 * @param {Array<{employeeId: string, date: string, start: string, end: string}>} options.shifts
 * @param {Array<string>} options.dates - ['YYYY-MM-DD', ...]
 * @param {string} options.title - e.g. "Roster Week 12.02. - 18.02.2026"
 * @param {string} options.periodLabel - e.g. "Weekly" or "Monthly"
 */
export function generateRosterPdf({ employees, shifts, dates, title, periodLabel }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title || 'Roster', margin, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(periodLabel || '', margin, 20);

  const formatDate = (d) => {
    const date = new Date(d + 'T12:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const weekDay = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][date.getDay()];
    return `${weekDay} ${day}.${month}.`;
  };

  const getShiftsFor = (employeeId, date) =>
    shifts.filter((s) => s.employeeId === employeeId && s.date === date);

  const head = ['Mitarbeiter', ...dates.map(formatDate)];
  const colWidths = [40];
  const dateColWidth = Math.max(20, (pageWidth - margin * 2 - 40) / dates.length);
  dates.forEach(() => colWidths.push(dateColWidth));

  const body = employees.map((emp) => {
    const row = [emp.name];
    dates.forEach((date) => {
      const dayShifts = getShiftsFor(emp.id, date);
      const text = dayShifts.length
        ? dayShifts.map((s) => `${s.start} - ${s.end}`).join(', ')
        : '–';
      row.push(text);
    });
    return row;
  });

  autoTable(doc, {
    startY: 24,
    head: [head],
    body: body.length ? body : [['–', ...dates.map(() => '–')]],
    margin: { left: margin },
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255] },
    columnStyles: Object.fromEntries(
      colWidths.map((w, i) => [i, { cellWidth: w }])
    ),
  });

  doc.save(`Roster_${dates[0]}_${dates[dates.length - 1]}.pdf`);
}
