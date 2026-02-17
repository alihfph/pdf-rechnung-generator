import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate invoice PDF matching the Media-Saturn style Rechnung layout.
 * Body: RECHNUNG, sender line, recipient, intro, table, totals, closing, invoice nr/date.
 * Footer: 3 columns - Company (left) | Kontakt (middle) | Zahlungsinformationen (right).
 */
export function generateInvoicePdf(data) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  let y = 22;

  // ---- Top right: Rechnungsnr. & Rechnungsdatum in gray box ----
  const boxWidth = 52;
  const boxHeight = 20;
  const boxX = pageWidth - margin - boxWidth;
  const boxY = 34; // ~130px from top of page
  doc.setFillColor(220, 220, 220);
  doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Rechnungsnr.: ' + (data.invoiceNumber || ''), boxX + boxWidth - 4, boxY + 8, { align: 'right' });
  doc.text('Rechnungsdatum: ' + (data.invoiceDate || ''), boxX + boxWidth - 4, boxY + 14, { align: 'right' });

  // ---- Title: RECHNUNG ----
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RECHNUNG', pageWidth / 2, y, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 10;

  // ---- Sender line (one line) ----
  const senderLine = [data.senderName, data.senderStreet, data.senderPostalCode + ' ' + (data.senderCity || '')]
    .filter(Boolean)
    .join(' - ');
  doc.setFontSize(6);
  doc.text(senderLine, margin, y);
  doc.setFontSize(10);
  y += 7;

  // ---- Recipient block (full width, no box) ----
  const recipientLines = [
    data.recipientName || '',
    data.recipientStreet || '',
    (data.recipientPostalCode || '') + ' ' + (data.recipientCity || ''),
  ].filter(Boolean);
  recipientLines.forEach((line, i) => {
    doc.text(String(line), margin, y + i * 5.5);
  });
  y += recipientLines.length * 5.5 + 8;

  // ---- Greeting & intro ----
  doc.text('Sehr geehrte Damen und Herren,', margin, y);
  y += 6;
  const intro = data.introText || 'vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen! Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:';
  const introLines = doc.splitTextToSize(String(intro), pageWidth - 2 * margin);
  introLines.forEach((line, i) => {
    doc.text(line, margin, y + i * 5);
  });
  y += introLines.length * 5 + 8;

  // ---- Items table ----
  const tableColumns = ['Bezeichnung', 'Menge', 'MwSt. %', 'Einzelpreis', 'Gesamt'];
  const tableRows = (data.items || []).map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const vat = parseFloat(item.vatPercent) || 0;
    const unitPrice = parseFloat(String(item.unitPrice).replace(',', '.')) || 0;
    const total = Math.round(qty * unitPrice * 100) / 100;
    return [
      item.description || '',
      String(qty),
      vat + ' %',
      formatEuro(unitPrice),
      formatEuro(total),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [tableColumns],
    body: tableRows.length ? tableRows : [['–', '–', '–', '–', '–']],
    margin: { left: margin },
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 18 },
      2: { cellWidth: 22 },
      3: { cellWidth: 28 },
      4: { cellWidth: 28 },
    },
  });
  y = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : y) + 6;

  // ---- Totals ----
  const subtotal = (data.items || []).reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const up = parseFloat(String(item.unitPrice).replace(',', '.')) || 0;
    return sum + Math.round(qty * up * 100) / 100;
  }, 0);
  const discountPercent = parseFloat(data.discountPercent) || 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const totalGross = Math.round((subtotal - discountAmount) * 100) / 100;
  const vatRate = (data.items && data.items[0]) ? (parseFloat(data.items[0].vatPercent) || 7) : 7;
  const vatAmount = Math.round(totalGross * (vatRate / (100 + vatRate)) * 100) / 100;
  const netAmount = Math.round((totalGross - vatAmount) * 100) / 100;

  const rightCol = pageWidth - margin;
  doc.setFontSize(10);
  doc.text('Zwischensumme', margin, y);
  doc.text(formatEuro(subtotal), rightCol, y, { align: 'right' });
  y += 6;
  if (discountPercent > 0) {
    doc.text('Rabatt (- ' + discountPercent + '%)', margin, y);
    doc.text('- ' + formatEuro(discountAmount), rightCol, y, { align: 'right' });
    y += 6;
  }
  doc.setFont('helvetica', 'bold');
  doc.text('Gesamtbetrag', margin, y);
  doc.text(formatEuro(totalGross), rightCol, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  y += 6;
  doc.text('enthält MwSt. (' + vatRate + '%)', margin, y);
  doc.text(formatEuro(vatAmount), rightCol, y, { align: 'right' });
  y += 6;
  doc.text('Nettobetrag', margin, y);
  doc.text(formatEuro(netAmount), rightCol, y, { align: 'right' });
  y += 12;

  doc.text('Mit freundlichen Grüßen', margin, y);
  y += 6;
  doc.text(data.senderBusinessName || data.senderName || '', margin, y);

  // ---- Footer on page 1 only: fixed at bottom of first page ----
  const pageCount = doc.getNumberOfPages();
  doc.setPage(1);
  const footerY = pageHeight - 38;
  const colGap = 15.75; // ~45px between columns
  const col1X = margin;
  const col2X = 65 + colGap;
  const col3X = 120 + colGap;
  const lineH = 5.5;

  doc.setFontSize(10);
  const footerCol1Lines = [
    data.senderName || '',
    data.senderBusinessName ? data.senderBusinessName : '',
    (data.senderStreet || '').trim(),
    (data.senderPostalCode || '') + ' ' + (data.senderCity || ''),
    data.senderTaxId ? 'Steuernummer : ' + data.senderTaxId : '',
  ].filter(Boolean);
  footerCol1Lines.forEach((line, i) => {
    doc.text(String(line), col1X, footerY + i * lineH);
  });

  doc.setFontSize(9);
  doc.text('Kontakt:', col2X, footerY);
  doc.text(data.senderTel ? 'Tel.: ' + data.senderTel : '', col2X, footerY + lineH);
  doc.text(data.senderEmail ? 'E-Mail: ' + data.senderEmail : '', col2X, footerY + 2 * lineH);
  doc.text(data.senderWeb ? 'Web: ' + data.senderWeb : '', col2X, footerY + 3 * lineH);

  doc.text('Zahlungsinformationen:', col3X, footerY);
  doc.text(data.senderIban ? 'IBAN: ' + data.senderIban : '', col3X, footerY + lineH);
  doc.text(data.senderBic ? 'BIC: ' + data.senderBic : '', col3X, footerY + 2 * lineH);
  doc.text(data.senderBank || '', col3X, footerY + 3 * lineH);

  if (pageCount > 1) {
    doc.setPage(pageCount);
  }

  doc.save((data.invoiceNumber || 'Rechnung') + '.pdf');
}

function formatEuro(value) {
  return typeof value === 'number' ? value.toFixed(2).replace('.', ',') + ' €' : '0,00 €';
}
