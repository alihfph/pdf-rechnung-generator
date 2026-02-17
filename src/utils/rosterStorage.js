const ROSTER_STORAGE_KEY = 'roster-data';

export function getRosterData() {
  try {
    const raw = localStorage.getItem(ROSTER_STORAGE_KEY);
    if (!raw) return { employees: [], shifts: [] };
    const data = JSON.parse(raw);
    return {
      employees: Array.isArray(data.employees) ? data.employees : [],
      shifts: Array.isArray(data.shifts) ? data.shifts : [],
    };
  } catch {
    return { employees: [], shifts: [] };
  }
}

export function setRosterData({ employees, shifts }) {
  try {
    localStorage.setItem(
      ROSTER_STORAGE_KEY,
      JSON.stringify({ employees: employees || [], shifts: shifts || [] })
    );
  } catch (e) {
    console.warn('Could not save roster to localStorage', e);
  }
}
