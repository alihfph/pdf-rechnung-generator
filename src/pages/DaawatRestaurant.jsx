import { Link } from 'react-router-dom';
import './DaawatRestaurant.css';

const DAAWAT_URL = 'https://www.daawat-restaurant.de/';

export default function DaawatRestaurant() {
  return (
    <div className="daawat">
      <nav className="daawat-nav">
        <div className="daawat-nav-inner">
          <Link to="/" className="daawat-logo">DAAWAT</Link>
          <ul className="daawat-nav-links">
            <li><a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Menü</a></li>
            <li><a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Essen Lieferservice</a></li>
            <li><a href="#angebote">Angebote</a></li>
            <li><a href="#kontakt">Kontakt</a></li>
            <li><a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Tischreservierung</a></li>
            <li><a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Menü & Bestellen</a></li>
          </ul>
        </div>
      </nav>

      <header className="daawat-hero">
        <h1>DAAWAT – Indisches und Tandoori Grillspezialitäten Restaurant</h1>
        <p className="daawat-tagline">Indisches, Tandoori & Curry Essen München</p>
        <p className="daawat-sub">Wir bieten Abholung und Lieferung an</p>
        <div className="daawat-hero-btns">
          <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer" className="daawat-btn daawat-btn-primary">Tischreservierung</a>
          <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer" className="daawat-btn daawat-btn-secondary">Menü & Bestellen</a>
        </div>
      </header>

      <main className="daawat-main">
        <section id="angebote" className="daawat-section">
          <h2>Angebote</h2>
          <div className="daawat-offer">
            <span className="daawat-offer-badge">15 % Rabatt auf Bestellung</span>
          </div>
        </section>

        <section className="daawat-section">
          <h2>Essen Gerichte</h2>
          <p>Entdecken Sie unsere indischen und Tandoori Grillspezialitäten – von klassischen Curries bis zu frisch aus dem Tandoor.</p>
        </section>

        <section className="daawat-section">
          <h2>Restaurant</h2>
          <p>Genießen Sie drinnen oder draußen – wir freuen uns auf Ihren Besuch.</p>
        </section>

        <section className="daawat-section" id="ueber">
          <h2>Über DAAWAT – Indisches und Tandoori Grillspezialitäten Restaurant</h2>
          <p>
            Wir von DAAWAT bieten Gerichte von hervorragender Qualität und laden Sie herzlich ein, unsere köstliche Küche kennenzulernen.
          </p>
          <p>
            Der Schlüssel zu unserem Erfolg ist einfach: Wir bieten hochwertige Gerichte, die stets den Gaumen erfreuen. Wir sind stolz darauf, unseren Kunden schmackhafte und authentische Gerichte zu servieren.
          </p>
          <p>
            Genießen Sie wahre Gaumenfreuden. Wählen Sie dazu ein Getränk aus. Und vor allem: Entspannen Sie sich! Wir bedanken uns herzlich bei Ihnen für Ihre fortwährende Unterstützung.
          </p>
        </section>

        <section className="daawat-section">
          <h2>Öffnungszeiten</h2>
          <div className="daawat-hours">
            <div className="daawat-hours-block">
              <strong>Restaurant</strong>
              <p>Montag – Samstag: 11:30 – 14:30, 17:30 – 23:00</p>
              <p>Sonntag: 12:30 – 23:00</p>
            </div>
            <div className="daawat-hours-block">
              <strong>Abholservice</strong>
              <p>Montag – Samstag: 11:45 – 14:30, 17:45 – 23:00</p>
              <p>Sonntag: 12:45 – 23:00</p>
            </div>
            <div className="daawat-hours-block">
              <strong>Lieferservice</strong>
              <p>Montag – Samstag: 12:00 – 14:30, 18:00 – 23:00</p>
              <p>Sonntag: 13:00 – 23:00</p>
            </div>
          </div>
        </section>

        <section className="daawat-section">
          <h2>Essenslieferung in München</h2>
          <p>
            Suchst du nach einem Essens-Lieferservice in der Nähe München? Nicht jeder hat die Zeit und die Lust, leckeres Essen zuzubereiten.
          </p>
          <p>
            Wenn du wie ein König bedient werden möchtest, dann ist der Lieferservice von DAAWAT die beste Wahl. Wähle einfach „Lieferung“ beim Kassen-Bildschirm aus. Wir hoffen, dass du mit unserem Lieferservice zufrieden bist.
          </p>
        </section>

        <section className="daawat-section">
          <h2>Liefergebühr</h2>
          <div className="daawat-zones">
            <p><strong>Zone 1–7:</strong> Mindestbestellwert 19,90 €, Gebühr 0,00 €</p>
            <p><strong>Zone 9, 11:</strong> Mindestbestellwert 49,00 €, Gebühr 0,00 €</p>
          </div>
        </section>

        <section id="kontakt" className="daawat-section daawat-contact">
          <h2>Kontakt</h2>
          <div className="daawat-contact-grid">
            <div>
              <strong>Adresse</strong>
              <p>Belgradstraße 105<br />80804 München, Germany</p>
            </div>
            <div>
              <strong>Telefon</strong>
              <p><a href="tel:+49893083936">+49 89 3083936</a></p>
            </div>
            <div>
              <strong>E-Mail</strong>
              <p><a href="mailto:daawat@web.de">daawat@web.de</a></p>
            </div>
          </div>
          <div className="daawat-links">
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Menü</a>
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Angebote</a>
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Tischreservierung</a>
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Im Voraus bestellen</a>
            <a href="#kontakt">Kontakt</a>
          </div>
        </section>

        <section className="daawat-section daawat-impressum">
          <h2>Impressum</h2>
          <p><strong>Daawat Indisches Restaurant</strong></p>
          <p>JASMIN & PH GmbH</p>
          <p>Belgradstraße 105</p>
          <p>80804 München</p>
          <p>Vertretungsberechtigt: Harpreet Kaur Dhillon</p>
          <p>Kontakt Telefon: 089 3083936</p>
          <p>E-Mail: daawat@web.de</p>
          <p>Registergericht: Amtsgericht München</p>
          <p>Registernummer: HRB 245968</p>
          <p>Umsatzsteuer-ID: DE311905425</p>
          <p className="daawat-impressum-note">
            Verbraucherstreitbeilegung/Universalschlichtungsstelle: Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
          <p>Quelle: e-recht24.de</p>
        </section>
      </main>

      <footer className="daawat-footer">
        <div className="daawat-footer-inner">
          <Link to="/">PDF Rechnung Generator</Link>
          <span> · </span>
          <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">www.daawat-restaurant.de</a>
        </div>
      </footer>
    </div>
  );
}
