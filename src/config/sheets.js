// The order of the sheets in the set. The navbar, the footer and every
// sheet header read it, so a new section only needs adding here.

export const SHEETS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'service', label: 'Services' },
  { id: 'project', label: 'Work' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'play', label: 'Play' },
  { id: 'contact', label: 'Contact' },
];

export const sheetNumber = (id) =>
  String(SHEETS.findIndex((s) => s.id === id) + 1).padStart(2, '0');

