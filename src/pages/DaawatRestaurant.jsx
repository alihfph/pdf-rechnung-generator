import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './DaawatRestaurant.css';

const DAAWAT_URL = 'https://www.daawat-restaurant.de/';

const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1920&q=80',
  'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1920&q=80',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920&q=80',
  'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=1920&q=80',
];

const CHAR_DELAY_MS = 35;
const AUTHOR_DELAY_MS = 400;

function WhatsAppReview({ paragraphs, author }) {
  const fullText = paragraphs.join('\n\n');
  const [displayedLength, setDisplayedLength] = useState(0);
  const [showAuthor, setShowAuthor] = useState(false);

  useEffect(() => {
    if (displayedLength >= fullText.length) {
      const t = setTimeout(() => setShowAuthor(true), AUTHOR_DELAY_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDisplayedLength((n) => n + 1), CHAR_DELAY_MS);
    return () => clearTimeout(t);
  }, [displayedLength, fullText.length]);

  const visibleText = fullText.slice(0, displayedLength);
  const showCaret = displayedLength < fullText.length;

  return (
    <div className="daawat-wa">
      <div className="daawat-wa-bubble">
        <p className="daawat-wa-text">
          {visibleText}
          {showCaret && <span className="daawat-wa-caret" />}
        </p>
        {showAuthor && (
          <cite className="daawat-wa-author">— {author}</cite>
        )}
      </div>
    </div>
  );
}

export default function DaawatRestaurant() {
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="daawat" id="top">
      <nav className="daawat-nav">
        <div className="daawat-nav-inner">
          <Link to="/" className="daawat-logo">DAAWAT</Link>
          <ul className="daawat-nav-links">
            <li><a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Menü</a></li>
            <li><a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Lieferservice</a></li>
            <li><a href="#angebote">Angebote</a></li>
            <li><a href="#oeffnungszeiten">Öffnungszeiten</a></li>
            <li><a href="#kontakt">Kontakt</a></li>
            <li><a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Reservierung</a></li>
          </ul>
        </div>
      </nav>

      <header className="daawat-hero">
        <div className="daawat-hero-bg" aria-hidden="true">
          {HERO_SLIDES.map((src, i) => (
            <div
              key={i}
              className="daawat-hero-bg-slide"
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
        <div className="daawat-hero-inner">
          <p className="daawat-hero-label">Indisches & Tandoori Restaurant</p>
          <h1 className="daawat-hero-title">DAAWAT</h1>
          <p className="daawat-hero-tagline">Authentische Curries & Grillspezialitäten in München</p>
          <p className="daawat-hero-sub">Abholung · Lieferung · Tischreservierung</p>
          <div className="daawat-hero-btns">
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer" className="daawat-btn daawat-btn-primary">Tisch reservieren</a>
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer" className="daawat-btn daawat-btn-secondary">Menü & Bestellen</a>
          </div>
        </div>
        <div className="daawat-hero-scroll" aria-hidden="true">
          <span className="daawat-hero-scroll-line" />
        </div>
      </header>

      <main className="daawat-main">
        <section id="angebote" className="daawat-section daawat-section--highlight">
          <span className="daawat-section-label">Angebot</span>
          <h2 className="daawat-section-title">15 % Rabatt auf Ihre Bestellung</h2>
          <p className="daawat-section-desc">Gültig für Abholung und Lieferung – einfach beim Bestellen angeben.</p>
          <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer" className="daawat-btn daawat-btn-primary daawat-section-cta">Jetzt bestellen</a>
        </section>

        <section className="daawat-section">
          <span className="daawat-section-label">Küche</span>
          <h2 className="daawat-section-title">Essen & Gerichte</h2>
          <WhatsAppReview
            paragraphs={[
              'Von klassischen Curries bis frisch aus dem Tandoor – hier gibt es echte indische und Tandoori-Grillspezialitäten. Wir kommen immer wieder, die Qualität stimmt einfach.',
            ]}
            author="Maria K., München"
          />
        </section>

        <section className="daawat-section">
          <span className="daawat-section-label">Besuch</span>
          <h2 className="daawat-section-title">Restaurant</h2>
          <WhatsAppReview
            paragraphs={[
              'Ob drinnen oder draußen – immer ein schöner Abend in der Belgradstraße. Freundlicher Service und angenehme Atmosphäre. Sehr empfehlenswert.',
            ]}
            author="Thomas & Sandra, Stammgäste"
          />
        </section>

        <section className="daawat-section">
          <span className="daawat-section-label">Über uns</span>
          <h2 className="daawat-section-title">DAAWAT – Indisches & Tandoori Restaurant</h2>
          <WhatsAppReview
            paragraphs={[
              'Das DAAWAT bietet Gerichte von wirklich hervorragender Qualität. Hochwertige Zutaten und authentische Rezepte – das merkt man bei jedem Bissen. Einfach Gaumenfreuden pur.',
              'Ein Getränk dazu, entspannt sitzen bleiben – so mag man es. Danke an das Team für die tolle Küche und den Service.',
            ]}
            author="Peter L., München"
          />
        </section>

        <section id="oeffnungszeiten" className="daawat-section">
          <span className="daawat-section-label">Zeiten</span>
          <h2 className="daawat-section-title">Öffnungszeiten</h2>
          <div className="daawat-hours">
            <div className="daawat-hours-card">
              <strong className="daawat-hours-name">Restaurant</strong>
              <p>Mo – Sa: 11:30 – 14:30, 17:30 – 23:00</p>
              <p>So: 12:30 – 23:00</p>
            </div>
            <div className="daawat-hours-card">
              <strong className="daawat-hours-name">Abholservice</strong>
              <p>Mo – Sa: 11:45 – 14:30, 17:45 – 23:00</p>
              <p>So: 12:45 – 23:00</p>
            </div>
            <div className="daawat-hours-card">
              <strong className="daawat-hours-name">Lieferservice</strong>
              <p>Mo – Sa: 12:00 – 14:30, 18:00 – 23:00</p>
              <p>So: 13:00 – 23:00</p>
            </div>
          </div>
        </section>

        <section className="daawat-section">
          <span className="daawat-section-label">Lieferung</span>
          <h2 className="daawat-section-title">Essenslieferung in München</h2>
          <p className="daawat-section-desc">
            Sie suchen einen Lieferservice für indisches Essen in München? Bei DAAWAT bestellen Sie einfach „Lieferung“ – 
            wir liefern Ihnen unsere Gerichte bequem nach Hause.
          </p>
        </section>

        <section id="kontakt" className="daawat-section daawat-contact">
          <span className="daawat-section-label">Kontakt</span>
          <h2 className="daawat-section-title">So erreichen Sie uns</h2>
          <div className="daawat-contact-grid">
            <div className="daawat-contact-item">
              <strong>Adresse</strong>
              <p>Belgradstraße 105<br />80804 München</p>
            </div>
            <div className="daawat-contact-item">
              <strong>Telefon</strong>
              <p><a href="tel:+49893083936">+49 89 3083936</a></p>
            </div>
            <div className="daawat-contact-item">
              <strong>E-Mail</strong>
              <p><a href="mailto:daawat@web.de">daawat@web.de</a></p>
            </div>
          </div>
          <div className="daawat-links">
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Menü</a>
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Angebote</a>
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Reservierung</a>
            <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">Bestellen</a>
          </div>
        </section>

        <section className="daawat-section daawat-impressum">
          <span className="daawat-section-label">Rechtliches</span>
          <h2 className="daawat-section-title">Impressum</h2>
          <div className="daawat-impressum-card">
            <div className="daawat-impressum-header">
              <span className="daawat-impressum-name">Daawat Indisches Restaurant</span>
              <span className="daawat-impressum-company">JASMIN & PH GmbH</span>
            </div>
            <div className="daawat-impressum-grid">
              <div className="daawat-impressum-item">
                <span className="daawat-impressum-label">Adresse</span>
                <p>Belgradstraße 105<br />80804 München</p>
              </div>
              <div className="daawat-impressum-item">
                <span className="daawat-impressum-label">Kontakt</span>
                <p>
                  <a href="tel:+49893083936">089 3083936</a><br />
                  <a href="mailto:daawat@web.de">daawat@web.de</a>
                </p>
              </div>
              <div className="daawat-impressum-item">
                <span className="daawat-impressum-label">Vertretung</span>
                <p>Harpreet Kaur Dhillon</p>
              </div>
              <div className="daawat-impressum-item">
                <span className="daawat-impressum-label">Register</span>
                <p>Amtsgericht München · HRB 245968</p>
              </div>
              <div className="daawat-impressum-item">
                <span className="daawat-impressum-label">USt-IdNr.</span>
                <p>DE311905425</p>
              </div>
            </div>
            <div className="daawat-impressum-note">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </div>
            <p className="daawat-impressum-source">Quelle: e-recht24.de</p>
          </div>
        </section>
      </main>

      <footer className="daawat-footer">
        <div className="daawat-footer-inner">
          <a href="#top" onClick={scrollToTop} className="daawat-footer-top">↑ Nach oben</a>
          <span className="daawat-footer-dot">·</span>
          <a href={DAAWAT_URL} target="_blank" rel="noopener noreferrer">daawat-restaurant.de</a>
        </div>
      </footer>
      <a href="#top" onClick={scrollToTop} className="daawat-back-to-top" aria-label="Nach oben">
        ↑
      </a>
    </div>
  );
}
