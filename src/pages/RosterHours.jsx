import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRosterData } from '../utils/rosterStorage';
import './RosterHours.css';

function parseTime(t) {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToHours(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getStartOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export default function RosterHours() {
  const [period, setPeriod] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { employees, shifts } = useMemo(() => getRosterData(), []);

  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    if (period === 'week') {
      const start = getStartOfWeek(now);
      const end = getEndOfWeek(now);
      return { fromDate: start, toDate: end };
    }
    if (period === 'month') {
      const start = getStartOfMonth(now);
      const end = getEndOfMonth(now);
      return { fromDate: start, toDate: end };
    }
    if (period === 'custom' && customFrom && customTo) {
      return {
        fromDate: new Date(customFrom + 'T00:00:00'),
        toDate: new Date(customTo + 'T23:59:59'),
      };
    }
    return { fromDate: null, toDate: null };
  }, [period, customFrom, customTo]);

  const totalsPerEmployee = useMemo(() => {
    const map = {};
    employees.forEach((e) => {
      map[e.id] = { name: e.name, minutes: 0 };
    });
    shifts.forEach((s) => {
      const shiftDate = new Date(s.date + 'T12:00:00');
      if (fromDate && toDate && (shiftDate < fromDate || shiftDate > toDate)) return;
      if (!map[s.employeeId]) return;
      const startMin = parseTime(s.start);
      const endMin = parseTime(s.end);
      let duration = endMin - startMin;
      if (duration < 0) duration += 24 * 60;
      map[s.employeeId].minutes += duration;
    });
    return Object.entries(map).map(([id, { name, minutes }]) => ({ id, name, minutes }));
  }, [employees, shifts, fromDate, toDate]);

  const periodLabel =
    period === 'all'
      ? 'Gesamt (alle Schichten)'
      : period === 'week'
        ? `Diese Woche (${fromDate?.toLocaleDateString('de-DE')} – ${toDate?.toLocaleDateString('de-DE')})`
        : period === 'month'
          ? `Dieser Monat (${fromDate?.toLocaleDateString('de-DE')} – ${toDate?.toLocaleDateString('de-DE')})`
          : period === 'custom' && customFrom && customTo
            ? `${customFrom} – ${customTo}`
            : 'Zeitraum wählen';

  return (
    <div className="roster-hours-page">
      <header className="roster-hours-header">
        <nav className="roster-hours-nav">
          <Link to="/">← Zurück</Link>
          <span className="roster-nav-sep"> · </span>
          <Link to="/roster">Dienstplan</Link>
          <span className="roster-nav-sep"> · </span>
          <Link to="/roster/employee-work">Arbeitsübersicht</Link>
        </nav>
        <h1>Stunden pro Person</h1>
        <p>Gesamtstunden pro Mitarbeiter für den gewählten Zeitraum.</p>
      </header>

      <section className="roster-hours-controls card">
        <label className="roster-hours-period-label">Zeitraum</label>
        <div className="roster-hours-period-options">
          <label className="roster-hours-radio">
            <input
              type="radio"
              name="period"
              checked={period === 'all'}
              onChange={() => setPeriod('all')}
            />
            <span>Gesamt</span>
          </label>
          <label className="roster-hours-radio">
            <input
              type="radio"
              name="period"
              checked={period === 'week'}
              onChange={() => setPeriod('week')}
            />
            <span>Diese Woche</span>
          </label>
          <label className="roster-hours-radio">
            <input
              type="radio"
              name="period"
              checked={period === 'month'}
              onChange={() => setPeriod('month')}
            />
            <span>Dieser Monat</span>
          </label>
          <label className="roster-hours-radio">
            <input
              type="radio"
              name="period"
              checked={period === 'custom'}
              onChange={() => setPeriod('custom')}
            />
            <span>Eigener Zeitraum</span>
          </label>
        </div>
        {period === 'custom' && (
          <div className="roster-hours-custom">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              placeholder="Von"
            />
            <span>bis</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              placeholder="Bis"
            />
          </div>
        )}
      </section>

      <section className="roster-hours-table-wrap card">
        <h2>{periodLabel}</h2>
        {totalsPerEmployee.length === 0 ? (
          <p className="roster-hours-empty">
            Keine Mitarbeiter oder Schichten vorhanden. Bitte zuerst im <Link to="/roster">Dienstplan</Link> anlegen.
          </p>
        ) : (
          <table className="roster-hours-table">
            <thead>
              <tr>
                <th>Mitarbeiter</th>
                <th>Gesamtstunden</th>
              </tr>
            </thead>
            <tbody>
              {totalsPerEmployee
                .filter((r) => r.minutes > 0 || period === 'all')
                .sort((a, b) => b.minutes - a.minutes)
                .map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td className="roster-hours-total">{minutesToHours(r.minutes)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
