// Single source of truth for every personal detail on the site.
// Change it here and it updates the navbar, hero, contact and footer at once.
//
// Anything marked TODO is a placeholder. Empty strings are fine: the parts of
// the page that need a value (phone row, WhatsApp button, social icons) hide
// themselves until one is filled in.

export const site = {
  name: 'Tahmid Hasan Tasfi',
  short: 'Tasfi',
  wordmark: 'TASFI', // giant hero lettering
  initials: 'T. H. Tasfi',
  role: 'Software developer',
  roleDetail: 'Full-stack web, backend APIs and business systems',
  now: 'Tech Apprentice, IDLC Finance PLC',
  location: 'Dhaka, Bangladesh',
  timezone: 'Asia/Dhaka',
  url: '', // TODO: your domain once it is live (also add it to index.html)

  email: 'tahmid7113@gmail.com',
  phone: '', // TODO: e.g. '+880 1XXX XXXXXX'
  // WhatsApp in international format, no + or spaces (wa.me requirement)
  whatsapp: '', // TODO: e.g. '8801XXXXXXXXX'

  socials: {
    github: 'https://github.com/Tasfi18',
    linkedin: '', // TODO: 'https://www.linkedin.com/in/<username>'
    fiverr: 'https://www.fiverr.com/tahmid_hasan_18',
  },
};

export default site;
