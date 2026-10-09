// Every piece of copy on the site that is not a contact detail lives here, so
// the components only decide how things look. Edit freely.

/* ------------------------------------------------------------------ About */

// The bio is split into runs so the key terms can be marked. `mark: true`
// draws a red-pencil underline under that run as it inks in.
export const bio = [
  { text: "I'm Tasfi, a software developer from Bangladesh. I build web applications and the APIs behind them, mostly with" },
  { text: 'C# and ASP.NET Core', mark: true },
  { text: 'on the server and' },
  { text: 'Next.js, React and TypeScript', mark: true },
  { text: 'in the browser. I finished my BSc in Computer Science and Engineering at Khulna University in 2025, where my thesis looked at how developers write' },
  { text: 'architectural change logs.', mark: true },
  { text: 'Since then I have built full-stack products at Mind Pixel BD, worked on machine learning at FlyRank AI, and joined the IT department at' },
  { text: 'IDLC Finance PLC', mark: true },
  { text: 'in Dhaka. I like structure that is easy to change, and changes that are easy to read.' },
];

// The facts beside the bio, set as a drawing's general notes.
export const facts = [
  { label: 'Now', value: 'Tech Apprentice, IT Department, IDLC Finance PLC' },
  { label: 'Studied', value: 'BSc in CSE, Khulna University, 2025' },
  { label: 'Before', value: 'Mind Pixel BD, FlyRank AI, Dohatec New Media' },
  { label: 'Also', value: 'Co-founder and director, LUMIQA Private Limited' },
];

// The stack, as a schedule of materials. Each row scrolls on its own.
// `duration` is seconds per loop; unequal speeds read as layers.
export const stackRows = [
  {
    label: 'Backend',
    items: ['C#', 'ASP.NET Core Web API', '.NET', 'Entity Framework Core', 'FluentValidation', 'Swagger', 'Node.js', 'REST APIs', 'JWT auth'],
    duration: 52,
  },
  {
    label: 'Frontend',
    items: ['Next.js', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML & CSS', 'WordPress themes'],
    duration: 44,
    reverse: true,
  },
  {
    label: 'Data',
    items: ['SQL Server', 'PostgreSQL', 'MongoDB', 'Python', 'Machine learning', 'NLP', 'Soft computing'],
    duration: 48,
  },
  {
    label: 'Tooling',
    items: ['Docker', 'Docker Compose', 'Git', 'GitHub', 'Postman', 'Unit testing', 'LaTeX'],
    duration: 40,
    reverse: true,
  },
];

/* --------------------------------------------------------------- Services */

export const services = [
  {
    title: 'Web application development',
    tools: 'Next.js, React, TypeScript, ASP.NET Core',
    description:
      'Complete web applications, from the database to the screen. I usually pair a Next.js and TypeScript front end with an ASP.NET Core API, and ship the whole thing in Docker.',
    capabilities: [
      'Next.js and React front ends in TypeScript',
      'Role-based sign-in with JWT',
      'Admin panels, forms and data tables',
      'Responsive layouts that work on phones',
      'Docker setups that run the same everywhere',
    ],
    cta: { label: 'See the work', href: '#project' },
  },
  {
    title: 'Backend and REST APIs',
    tools: 'ASP.NET Core, EF Core, SQL Server, PostgreSQL',
    description:
      'APIs with a clear shape: controllers, services and repositories kept apart, input validated at the edge, and every endpoint documented in Swagger.',
    capabilities: [
      'ASP.NET Core Web API on current .NET',
      'Entity Framework Core, code-first',
      'SQL Server, PostgreSQL or MongoDB',
      'Validation with FluentValidation',
      'Swagger docs and a Postman collection',
    ],
  },
  {
    title: 'Business systems',
    tools: 'POS, orders, receipts, inventory',
    description:
      'Software for shops, cafes and branches: taking orders at the counter, printing receipts, keeping stock and closing the day with a report.',
    capabilities: [
      'Point-of-sale and counter ordering',
      'Receipts and end-of-day reports',
      'Inventory and stock movement',
      'Multi-branch setups with one dashboard',
      'Payment records',
    ],
  },
  {
    title: 'Websites and CMS',
    tools: 'WordPress, custom themes, static sites',
    description:
      'Websites for institutions and small businesses that staff can keep up to date themselves, including moving an old static site onto a CMS.',
    capabilities: [
      'Custom WordPress themes',
      'Moving content off a static site',
      'Pages staff can edit without a developer',
      'Basic SEO and page speed',
    ],
  },
  {
    title: 'Machine learning and data',
    tools: 'Python, ML, NLP',
    description:
      'Applied machine learning from my internship at FlyRank AI, plus coursework in natural language processing and soft computing.',
    capabilities: [
      'Data cleaning and exploration',
      'Building and evaluating models',
      'Text processing and NLP basics',
      'Fuzzy and soft-computing methods',
    ],
  },
  {
    title: 'Architecture and documentation',
    tools: 'Diagrams, change logs, technical reports',
    description:
      'Writing down how a system is built and how it changes. My thesis studied architectural change logs, and I document my own projects the same way.',
    capabilities: [
      'Architecture and data model diagrams',
      'API and setup documentation',
      'Change logs and release notes',
      'Technical reports and decks',
      'Product roadmaps',
    ],
  },
];

/* ------------------------------------------------------------------- Work */

// `plate` picks which drawing the project gets (see components/Plates.jsx).
// Leave `repo` or `live` empty and the button is replaced by a link to Contact.
export const projects = [
  {
    plate: 'api',
    name: 'Customer Management System API',
    summary:
      'A REST API for managing customers, their phone numbers, addresses and documents. Built as a backend case study for IDLC Finance PLC, with a layered Controller, Service and Repository design and a 14-slide technical report.',
    notes: [
      '5 endpoints on api/customers, 4 tables',
      'GUID keys, unique email, NID and phone',
      'Runs with one Docker Compose command',
    ],
    year: '2026',
    role: 'Sole developer',
    stack: 'ASP.NET Core (.NET 10), EF Core 10, SQL Server 2022, FluentValidation, Swagger, Docker',
    repo: '', // TODO
    live: '',
  },
  {
    plate: 'roles',
    name: 'Assignment and Submission Manager',
    summary:
      'A role-based system where assignments are published, submitted and reviewed. Written as the take-home project for an Assistant Software Engineer role at OnnoRokom Projukti, with migrations, seed data and demo accounts for every role.',
    notes: [
      'Three roles with JWT authorization',
      'Next.js client, ASP.NET Core API',
      'Unit tests, seed data and setup guide',
    ],
    year: '2026',
    role: 'Sole developer',
    stack: 'Next.js, React, TypeScript, ASP.NET Core Web API, JWT, unit tests',
    repo: 'https://github.com/Tasfi18/assignment-submission-system',
    live: '',
  },
  {
    plate: 'thesis',
    name: 'Writing Software Architectural Change Logs',
    summary:
      'My BSc thesis at Khulna University, supervised by Dr. Amit Kumar Mondal. We read real change logs from two large Java projects, pulled out the parts that describe architectural change, and proposed a baseline sentence structure for writing them.',
    notes: [
      '46 change log files from Azure SDK for Java',
      '26 releases of Hibernate Search',
      '14 elements extracted and compared with FSECAM',
    ],
    year: '2025',
    role: 'Co-author',
    stack: 'Empirical study, manual extraction, statistical analysis',
    repo: '',
    live: '', // TODO: link to the paper when it is published
  },
  {
    plate: 'superapp',
    name: 'AI Super App Strategy',
    summary:
      'A product strategy for a financial services super app, written for IDLC Finance PLC. It splits the app into three layers, maps more than ten AI use cases, and plans the build in three phases over 24 months.',
    notes: [
      'Core finance, lifestyle and AI layers',
      'Platform and AI/ML architecture diagrams',
      'Roadmap, success metrics and risks',
    ],
    year: '2026',
    role: 'Product strategy',
    stack: '17-slide deck, architecture diagrams, roadmap',
    repo: '',
    live: '',
  },
];

/* -------------------------------------------------------------- Changelog */

// Newest first, the way a change log is read. Version numbers are the
// year and month of each entry (LUMIQA's is its registration).
export const changelog = [
  {
    version: '2026.10',
    period: '2026 to now',
    status: 'Current',
    title: 'Co-founder and Director',
    org: 'LUMIQA Private Limited',
    place: 'Khulna',
    added: [
      'Co-founded with three partners and registered with RJSC',
      'Preparing proposals for an institute website and a cafe counter system',
    ],
  },
  {
    version: '2026.09',
    period: 'Sep 2026 to now',
    status: 'Current',
    title: 'Tech Apprentice',
    org: 'IDLC Finance PLC',
    place: 'Gulshan, Dhaka. On-site.',
    added: [
      'Joined the Information Technology Department',
      'Case studies for IDLC: a customer API and a super app strategy',
    ],
  },
  {
    version: '2026.07',
    period: 'Jul to Sep 2026',
    status: 'Released',
    title: 'ML Engineering Intern',
    org: 'FlyRank AI',
    place: 'Remote',
    added: ['Machine learning engineering internship, fully remote'],
  },
  {
    version: '2026.01',
    period: 'Jan to Aug 2026',
    status: 'Released',
    title: 'Software Developer',
    org: 'Mind Pixel BD',
    place: 'Khulna',
    added: ['Full-stack web work, front end to database'],
  },
  {
    version: '2025.12',
    period: 'Dec 2025',
    status: 'Released',
    title: 'BSc in Computer Science and Engineering',
    org: 'Khulna University',
    place: 'Khulna',
    added: ['Thesis: An Exploratory Study of Writing Software Architectural Change Logs'],
  },
  {
    version: '2025.02',
    period: 'Feb 2025 to Jan 2026',
    status: 'Released',
    title: 'President',
    org: 'CLUSTER, Khulna University computer club',
    place: 'Khulna',
    added: ['Led the club for a full term'],
  },
  {
    version: '2025.01',
    period: 'Jan to Feb 2025',
    status: 'Released',
    title: 'Industrial Trainee',
    org: 'Dohatec New Media',
    place: 'Dhaka',
    added: ['Industrial training at a Dhaka software company'],
  },
];

/* ------------------------------------------------------------------- Play */

// The layers of the game, bottom to top. After the last one it starts over.
export const gameLayers = [
  'SQL Server',
  'EF Core',
  'Repository',
  'Service',
  'Controller',
  'REST API',
  'JWT auth',
  'Next.js',
  'UI',
  'Tests',
  'Docs',
  'Release',
];

// The card that opens the shelf. Keep a Changelog puts unreleased work at the
// top, so this is where availability goes.
export const unreleased = {
  title: 'Open to new work',
  body: 'Freelance projects, contract work and collaborations. Web apps, APIs and business systems in particular.',
};
