import { supabase } from '../lib/supabase';
import { getRosterData, setRosterData } from './rosterStorage';
import { getApiUrl, getStoredToken, apiFetch } from '../lib/api';

/**
 * Load roster from backend (if API URL + token), then Supabase, else localStorage.
 * @param {string | null} [token] - JWT for backend; if not passed, uses getStoredToken().
 */
export async function loadRoster(token) {
  const apiToken = token !== undefined ? token : getStoredToken();
  if (getApiUrl() && apiToken) {
    try {
      const data = await apiFetch('/roster');
      const normalized = {
        employees: Array.isArray(data.employees) ? data.employees : [],
        shifts: Array.isArray(data.shifts) ? data.shifts : [],
      };
      setRosterData(normalized);
      return normalized;
    } catch (e) {
      console.warn('Load from backend failed', e);
    }
  }

  if (!supabase) return getRosterData();

  try {
    const [empRes, shiftRes] = await Promise.all([
      supabase.from('roster_employees').select('id, name').order('name'),
      supabase.from('roster_shifts').select('id, employee_id, date, start, end'),
    ]);

    if (empRes.error) throw empRes.error;
    if (shiftRes.error) throw shiftRes.error;

    const employees = (empRes.data || []).map((r) => ({ id: r.id, name: r.name }));
    const shifts = (shiftRes.data || []).map((r) => ({
      id: r.id,
      employeeId: r.employee_id,
      date: r.date,
      start: r.start,
      end: r.end,
    }));

    const data = { employees, shifts };
    setRosterData(data);
    return data;
  } catch (e) {
    console.warn('Load from Supabase failed, using localStorage', e);
    return getRosterData();
  }
}

/**
 * Save roster to backend (if API URL + token), then Supabase, and always to localStorage.
 * @param {string | null} [token] - JWT for backend; if not passed, uses getStoredToken().
 */
export async function saveRoster(employees, shifts, token) {
  const data = { employees: employees || [], shifts: shifts || [] };
  setRosterData(data);

  const apiToken = token !== undefined ? token : getStoredToken();
  if (getApiUrl() && apiToken) {
    try {
      await apiFetch('/roster', { method: 'POST', body: JSON.stringify(data) });
      return { ok: true, from: 'backend' };
    } catch (e) {
      console.warn('Save to backend failed', e);
    }
  }

  if (!supabase) return { ok: true, from: 'local' };

  try {
    const employeeIds = data.employees.map((e) => e.id);

    // Remove existing shifts for our employees, then insert current ones
    if (employeeIds.length) {
      await supabase.from('roster_shifts').delete().in('employee_id', employeeIds);
    }
    if (data.shifts.length) {
      const shiftRows = data.shifts.map((s) => ({
        id: s.id,
        employee_id: s.employeeId,
        date: s.date,
        start: s.start,
        end: s.end,
      }));
      const { error: sErr } = await supabase.from('roster_shifts').insert(shiftRows);
      if (sErr) throw sErr;
    }

    // Upsert employees (so new/updated are saved)
    const empRows = data.employees.map((e) => ({ id: e.id, name: e.name }));
    if (empRows.length) {
      const { error: eErr } = await supabase.from('roster_employees').upsert(empRows, { onConflict: 'id' });
      if (eErr) throw eErr;
    }

    // Remove employees that are no longer in our list
    const { data: existing } = await supabase.from('roster_employees').select('id');
    const existingIds = (existing || []).map((r) => r.id);
    const toRemove = existingIds.filter((id) => !employeeIds.includes(id));
    if (toRemove.length) {
      await supabase.from('roster_shifts').delete().in('employee_id', toRemove);
      await supabase.from('roster_employees').delete().in('id', toRemove);
    }

    return { ok: true, from: 'supabase' };
  } catch (e) {
    console.warn('Save to Supabase failed', e);
    return { ok: false, error: e };
  }
}
