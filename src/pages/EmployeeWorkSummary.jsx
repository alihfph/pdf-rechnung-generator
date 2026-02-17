import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getRosterData } from '../utils/rosterStorage';
import { generateEmployeeWorkPdf } from '../utils/generateEmployeeWorkPdf';
import './EmployeeWorkSummary.css';

function parseTime(t) {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function shiftDurationMinutes(start, end) {
  const startMin = parseTime(start);
  const endMin = parseTime(end);
  let duration = endMin - startMin;
  if (duration < 0) duration += 24 * 60;
  return duration;
}

function formatTime12h(t) {
  const [h, m] = (t || '00:00').split(':').map(Number);
  const hour = h || 0;
  const minute = m || 0;
  if (hour === 0 && minute === 0) return '12:00am';
  if (hour === 12 && minute === 0) return '12:00pm';
  if (hour < 12) return `${hour}:${String(minute).padStart(2, '0')}am`;
  return `${hour - 12}:${String(minute).padStart(2, '0')}pm`;
}

function formatDateDDMMYYYY(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function dayNameShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
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

export default function EmployeeWorkSummary() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [period, setPeriod] = useState('week');
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

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId) || null,
    [employees, selectedEmployeeId]
  );

  const shiftRows = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return shifts
      .filter((s) => {
        if (s.employeeId !== selectedEmployeeId) return false;
        const shiftDate = new Date(s.date + 'T12:00:00');
        if (fromDate && toDate && (shiftDate < fromDate || shiftDate > toDate)) return false;
        return true;
      })
      .map((s) => {
        const minutes = shiftDurationMinutes(s.start, s.end);
        const hours = Math.round((minutes / 60) * 10) / 10;
        return {
          id: s.id,
          day: dayNameShort(s.date),
          date: formatDateDDMMYYYY(s.date),
          dateSort: s.date,
          start: formatTime12h(s.start),
          finish: formatTime12h(s.end),
          hours,
          minutes,
        };
      })
      .sort((a, b) => a.dateSort.localeCompare(b.dateSort));
  }, [shifts, selectedEmployeeId, fromDate, toDate]);

  const totalHours = useMemo(() => {
    const totalMin = shiftRows.reduce((sum, r) => sum + r.minutes, 0);
    return Math.round((totalMin / 60) * 10) / 10;
  }, [shiftRows]);

  const periodLabel =
    period === 'week'
      ? `This week (${fromDate?.toLocaleDateString('de-DE')} – ${toDate?.toLocaleDateString('de-DE')})`
      : period === 'month'
        ? `This month (${fromDate?.toLocaleDateString('de-DE')} – ${toDate?.toLocaleDateString('de-DE')})`
        : period === 'custom' && customFrom && customTo
          ? `${customFrom} – ${customTo}`
          : 'Select time frame';

  const handleDownloadPdf = () => {
    if (!selectedEmployee) return;
    generateEmployeeWorkPdf({
      employeeName: selectedEmployee.name,
      periodLabel,
      shiftRows: shiftRows.map((r) => ({ day: r.day, date: r.date, start: r.start, finish: r.finish, hours: r.hours })),
      totalHours,
    });
  };

  return (
    <div className="employee-work-page">
      <header className="employee-work-header">
        <nav className="employee-work-nav">
          <Link to="/">← Zurück</Link>
          <span className="roster-nav-sep"> · </span>
          <Link to="/roster">Dienstplan</Link>
          <span className="roster-nav-sep"> · </span>
          <Link to="/roster/hours">Stunden pro Person</Link>
        </nav>
        <h1>Arbeitsübersicht pro Mitarbeiter</h1>
        <p>Mitarbeiter und Zeitraum wählen – Schichten und Gesamtstunden anzeigen.</p>
      </header>

      <section className="employee-work-controls card">
        <div className="employee-work-controls-row">
          <label className="employee-work-select-label">
            Mitarbeiter
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="employee-work-select"
            >
              <option value="">– Bitte wählen –</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <div className="employee-work-period">
            <span className="employee-work-period-label">Zeitraum</span>
            <div className="employee-work-period-options">
              <label className="employee-work-radio">
                <input
                  type="radio"
                  name="period"
                  checked={period === 'week'}
                  onChange={() => setPeriod('week')}
                />
                <span>Diese Woche</span>
              </label>
              <label className="employee-work-radio">
                <input
                  type="radio"
                  name="period"
                  checked={period === 'month'}
                  onChange={() => setPeriod('month')}
                />
                <span>Dieser Monat</span>
              </label>
              <label className="employee-work-radio">
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
              <div className="employee-work-custom-dates">
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span>bis</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedEmployee && (
        <section className="employee-work-summary card">
          <div className="employee-work-summary-head">
            <div className="employee-work-summary-title-row">
              <div>
                <h2 className="employee-work-name">{selectedEmployee.name}</h2>
                <p className="employee-work-stats">
                  {shiftRows.length} shifts / {totalHours} hours
                </p>
              </div>
              <button
                type="button"
                className="btn-primary employee-work-download-btn"
                onClick={handleDownloadPdf}
              >
                Als PDF herunterladen
              </button>
            </div>
          </div>

          {shiftRows.length === 0 ? (
            <p className="employee-work-empty">Keine Schichten im gewählten Zeitraum.</p>
          ) : (
            <>
              <table className="employee-work-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Date</th>
                    <th>Start</th>
                    <th>Finish</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {shiftRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.day}</td>
                      <td>{row.date}</td>
                      <td>{row.start}</td>
                      <td>{row.finish}</td>
                      <td>{row.hours}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="employee-work-total-label">
                      Total
                    </td>
                    <td className="employee-work-total-value">{totalHours}</td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </section>
      )}

      {!selectedEmployeeId && employees.length > 0 && (
        <p className="employee-work-hint">Bitte einen Mitarbeiter auswählen.</p>
      )}
      {employees.length === 0 && (
        <p className="employee-work-hint">
          Keine Mitarbeiter vorhanden. Bitte zuerst im <Link to="/roster">Dienstplan</Link> anlegen.
        </p>
      )}
    </div>
  );
}
