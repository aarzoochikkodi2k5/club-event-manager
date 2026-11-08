// "2026-12-10T00:00:00.000Z" -> "10 Dec 2026"
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });

// "2026-12-10T00:00:00.000Z" -> "2026-12-10" (what <input type="date"> needs)
export const toInputDate = (d) => new Date(d).toISOString().slice(0, 10);