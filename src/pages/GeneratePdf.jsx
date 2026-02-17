import { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateInvoicePdf } from '../utils/generatePdf';

const defaultItems = [
  { description: 'Murgh Korma', quantity: '8', vatPercent: '7', unitPrice: '17,90' },
  { description: 'Murgh Mango', quantity: '8', vatPercent: '7', unitPrice: '17,90' },
  { description: 'Shahi Paneer', quantity: '7', vatPercent: '7', unitPrice: '16,90' },
];

function parseDecimal(str) {
  if (typeof str !== 'string') return 0;
  const n = parseFloat(str.replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

export default function GeneratePdf() {
  const [senderName, setSenderName] = useState('Jasmin & Ph GmbH');
  const [senderBusinessName, setSenderBusinessName] = useState('Daawat Indisches Restaurant');
  const [senderStreet, setSenderStreet] = useState('Belgradstraße 105');
  const [senderPostalCode, setSenderPostalCode] = useState('80804');
  const [senderCity, setSenderCity] = useState('München');
  const [senderTaxId, setSenderTaxId] = useState('143/152/01609');
  const [senderWeb, setSenderWeb] = useState('www.daawatrestaurant.de');
  const [senderTel, setSenderTel] = useState('089 3083936');
  const [senderEmail, setSenderEmail] = useState('daawat@web.de');
  const [senderIban, setSenderIban] = useState('DE79 7004 0041 0380 0828 00');
  const [senderBic, setSenderBic] = useState('COBADEFFXXX');
  const [senderBank, setSenderBank] = useState('Commerzbank');

  const [recipientName, setRecipientName] = useState('Media-Saturn Marketing GmbH');
  const [recipientStreet, setRecipientStreet] = useState('Maria-Probst-Straße 9');
  const [recipientPostalCode, setRecipientPostalCode] = useState('80939');
  const [recipientCity, setRecipientCity] = useState('München');

  const [invoiceNumber, setInvoiceNumber] = useState('4');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10).split('-').reverse().join('.');
  });
  const [introText, setIntroText] = useState(
    'vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen! Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:'
  );
  const [discountPercent, setDiscountPercent] = useState('15');
  const [items, setItems] = useState(defaultItems);

  const addItem = () => {
    setItems((prev) => [...prev, { description: '', quantity: '1', vatPercent: '7', unitPrice: '0' }]);
  };
  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };
  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleGeneratePdf = () => {
    try {
      const data = {
        senderName,
        senderBusinessName,
        senderStreet,
        senderPostalCode,
        senderCity,
        senderTaxId,
        senderWeb,
        senderTel,
        senderEmail,
        senderIban,
        senderBic,
        senderBank,
        recipientName,
        recipientStreet,
        recipientPostalCode,
        recipientCity,
        invoiceNumber,
        invoiceDate,
        introText,
        discountPercent,
        items: items.map((it) => ({
          ...it,
          unitPrice: String(parseDecimal(it.unitPrice)),
        })),
      };
      generateInvoicePdf(data);
    } catch (err) {
      console.error('PDF generation failed:', err);
      const msg = err?.message || String(err);
      alert('PDF konnte nicht erstellt werden: ' + msg + '\n\nDetails in der Konsole (F12).');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <nav style={{ marginBottom: '1rem' }}>
          <Link to="/">← Zurück</Link>
        </nav>
        <h1>PDF Rechnung Generator</h1>
        <p>Füllen Sie das Formular aus und klicken Sie auf „PDF erzeugen“, um die Rechnung als PDF herunterzuladen.</p>
      </header>

      <main className="form-container">
        <section className="card">
          <h2>Ihre Angaben (Absender)</h2>
          <div className="grid-2">
            <label>
              Firmenname / Name
              <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="z.B. Jasmin & Ph GmbH" />
            </label>
            <label>
              Geschäftsbezeichnung (optional)
              <input value={senderBusinessName} onChange={(e) => setSenderBusinessName(e.target.value)} placeholder="z.B. Daawat Indisches Restaurant" />
            </label>
            <label>
              Straße & Hausnummer
              <input value={senderStreet} onChange={(e) => setSenderStreet(e.target.value)} placeholder="Belgradstraße 105" />
            </label>
            <label>
              PLZ
              <input value={senderPostalCode} onChange={(e) => setSenderPostalCode(e.target.value)} placeholder="80804" />
            </label>
            <label>
              Ort
              <input value={senderCity} onChange={(e) => setSenderCity(e.target.value)} placeholder="München" />
            </label>
            <label>
              Steuernummer (optional)
              <input value={senderTaxId} onChange={(e) => setSenderTaxId(e.target.value)} placeholder="143/152/01609" />
            </label>
            <label>
              Web (optional)
              <input value={senderWeb} onChange={(e) => setSenderWeb(e.target.value)} placeholder="www.example.de" />
            </label>
          </div>
          <div className="grid-2">
            <label>
              Telefon
              <input value={senderTel} onChange={(e) => setSenderTel(e.target.value)} placeholder="089 3083936" />
            </label>
            <label>
              E-Mail
              <input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="info@example.de" />
            </label>
          </div>
          <h3>Zahlungsinformationen</h3>
          <div className="grid-2">
            <label>
              IBAN
              <input value={senderIban} onChange={(e) => setSenderIban(e.target.value)} placeholder="DE79 7004 0041 ..." />
            </label>
            <label>
              BIC
              <input value={senderBic} onChange={(e) => setSenderBic(e.target.value)} placeholder="COBADEFFXXX" />
            </label>
            <label>
              Bank
              <input value={senderBank} onChange={(e) => setSenderBank(e.target.value)} placeholder="Commerzbank" />
            </label>
          </div>
        </section>

        <section className="card">
          <h2>Rechnungsempfänger</h2>
          <div className="grid-2">
            <label>
              Firma / Name
              <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Media-Saturn Marketing GmbH" />
            </label>
            <label>
              Straße & Hausnummer
              <input value={recipientStreet} onChange={(e) => setRecipientStreet(e.target.value)} placeholder="Maria-Probst-Straße 9" />
            </label>
            <label>
              PLZ
              <input value={recipientPostalCode} onChange={(e) => setRecipientPostalCode(e.target.value)} placeholder="80939" />
            </label>
            <label>
              Ort
              <input value={recipientCity} onChange={(e) => setRecipientCity(e.target.value)} placeholder="München" />
            </label>
          </div>
        </section>

        <section className="card">
          <h2>Rechnung (Box links)</h2>
          <div className="grid-2">
            <label>
              Rechnungsnummer
              <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="4" />
            </label>
            <label>
              Rechnungsdatum
              <input value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} placeholder="09.09.2025" />
            </label>
          </div>
          <label className="full">
            Einleitungstext
            <textarea value={introText} onChange={(e) => setIntroText(e.target.value)} rows={3} placeholder="vielen Dank für Ihren Auftrag..." />
          </label>
        </section>

        <section className="card">
          <h2>Positionen</h2>
          <p className="hint">Bezeichnung, Menge, MwSt. % und Einzelpreis (Komma oder Punkt als Dezimaltrenner).</p>
          <div className="table-wrap">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Bezeichnung</th>
                  <th>Menge</th>
                  <th>MwSt. %</th>
                  <th>Einzelpreis</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="z.B. Murgh Korma" />
                    </td>
                    <td>
                      <input type="number" min="0" step="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" min="0" step="0.01" value={item.vatPercent} onChange={(e) => updateItem(i, 'vatPercent', e.target.value)} />
                    </td>
                    <td>
                      <input value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} placeholder="17,90" />
                    </td>
                    <td>
                      <button type="button" className="btn-remove" onClick={() => removeItem(i)} title="Zeile entfernen">−</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn-secondary" onClick={addItem}>+ Position hinzufügen</button>
          <label className="discount">
            Rabatt in %
            <input type="number" min="0" max="100" step="0.01" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
          </label>
        </section>

        <div className="actions">
          <button type="button" className="btn-primary" onClick={handleGeneratePdf}>
            PDF erzeugen
          </button>
        </div>
      </main>
    </div>
  );
}
