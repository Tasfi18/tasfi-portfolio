
/*
 * One drawing per project, in the same ink and lettering as the rest of the
 * set. They are diagrams of what was built rather than screenshots, so they
 * stay sharp at any size and need no image files. Swap one for a real
 * screenshot by giving the project an `image` in config/content.js.
 *
 * Every plate is drawn on a 640 x 400 sheet.
 */

const INK = 'var(--color-ink)';
const INK2 = 'var(--color-ink-2)';
const RED = 'var(--color-red)';
const CYAN = 'var(--color-cyan)';
const PAPER = 'var(--color-paper)';
const PAPER2 = 'var(--color-paper-2)';

const letter = { fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 };
const sans = { fontFamily: 'var(--font-sans)' };
const display = { fontFamily: 'var(--font-display)', fontWeight: 800 };

/** A revision cloud around a box: scallops of roughly `b` along each side. */
const cloud = (x, y, w, h, b) => {
  const n = (len) => Math.max(2, Math.round(len / (b * 2.2)));
  const run = (x0, y0, x1, y1, k) => {
    let out = '';
    const r = Math.hypot(x1 - x0, y1 - y0) / k / 2;
    for (let i = 1; i <= k; i++) {
      out += ` A${r.toFixed(1)} ${(r * 1.15).toFixed(1)} 0 0 1 ${(x0 + ((x1 - x0) * i) / k).toFixed(1)} ${(y0 + ((y1 - y0) * i) / k).toFixed(1)}`;
    }
    return out;
  };
  return `M${x} ${y}${run(x, y, x + w, y, n(w))}${run(x + w, y, x + w, y + h, n(h))}${run(x + w, y + h, x, y + h, n(w))}${run(x, y + h, x, y, n(h))}`;
};

const Label = ({ x, y, children, size = 12, fill = INK, anchor = 'start', style = letter }) => (
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} style={style}>
    {children}
  </text>
);

const Box = ({ x, y, w, h, title, sub, fill = PAPER, hatch }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={hatch ? `url(#${hatch})` : fill} stroke={INK} strokeWidth="1.5" />
    {title && (
      <Label x={x + w / 2} y={y + h / 2 + (sub ? -2 : 4)} anchor="middle" size={13}>
        {title}
      </Label>
    )}
    {sub && (
      <Label x={x + w / 2} y={y + h / 2 + 14} anchor="middle" size={10.5} fill={INK2} style={sans}>
        {sub}
      </Label>
    )}
  </g>
);

const Arrow = ({ x1, y1, x2, y2, color = INK, id, dashed }) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke={color}
    strokeWidth="1.5"
    strokeDasharray={dashed ? '5 4' : undefined}
    markerEnd={`url(#${id}-arrow)`}
  />
);

const Defs = ({ id }) => (
  <defs>
    <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 Z" fill={INK} />
    </marker>
    <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill={PAPER} />
      <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="0.9" opacity="0.55" />
    </pattern>
  </defs>
);

/* -------------------------------------------- Customer Management System API */
const ApiPlate = () => {
  const id = 'plate-api';
  const children = [
    { name: 'PhoneNumbers', y: 214 },
    { name: 'Addresses', y: 270 },
    { name: 'CustomerDocuments', y: 326 },
  ];
  return (
    <>
      <Defs id={id} />
      <Label x={24} y={34} size={12} fill={INK2}>Request path</Label>
      <Label x={24} y={92} size={11} fill={INK2} style={sans}>HTTP</Label>
      <Arrow id={id} x1={24} y1={100} x2={60} y2={100} />
      <Box x={62} y={74} w={104} h={52} title="Controller" />
      <Arrow id={id} x1={166} y1={100} x2={192} y2={100} />
      <Box x={194} y={74} w={104} h={52} title="Service" />
      <Arrow id={id} x1={298} y1={100} x2={324} y2={100} />
      <Box x={326} y={74} w={104} h={52} title="Repository" />
      <Arrow id={id} x1={430} y1={100} x2={514} y2={100} />
      <Label x={472} y={92} size={11} fill={INK2} anchor="middle" style={sans}>EF Core</Label>

      {/* Database cylinder */}
      <g>
        <path d="M520 78 v46 a48 12 0 0 0 96 0 v-46" fill={PAPER2} stroke={INK} strokeWidth="1.5" />
        <ellipse cx="568" cy="78" rx="48" ry="12" fill={PAPER} stroke={INK} strokeWidth="1.5" />
        <Label x={568} y={112} anchor="middle" size={12}>SQL Server</Label>
      </g>

      {/* Validation sits at the edge, before the controller acts. */}
      <line x1={114} y1={126} x2={114} y2={150} stroke={RED} strokeWidth="1.2" />
      <Label x={114} y={164} anchor="middle" size={11} fill={RED} style={sans}>FluentValidation</Label>

      <line x1={24} y1={182} x2={616} y2={182} stroke={CYAN} strokeWidth="1" strokeDasharray="2 4" />
      <Label x={24} y={206} size={12} fill={INK2}>Data model</Label>

      {/* Customers and its three children, one to many. */}
      <g>
        <rect x={60} y={218} width={190} height={150} fill={PAPER} stroke={INK} strokeWidth="1.5" />
        <rect x={60} y={218} width={190} height={30} fill={INK} />
        <Label x={72} y={238} size={13} fill={PAPER}>Customers</Label>
        {['Id  GUID, key', 'Email  unique', 'NID  unique', 'Name, details'].map((row, i) => (
          <Label key={row} x={72} y={270 + i * 24} size={12} fill={INK} style={sans}>
            {row}
          </Label>
        ))}
      </g>
      {children.map((c) => (
        <g key={c.name}>
          <path d={`M250 ${c.y + 18} H 330 L 360 ${c.y + 18}`} fill="none" stroke={INK} strokeWidth="1.3" />
          {/* crow's foot on the many side */}
          <path d={`M360 ${c.y + 10} L 376 ${c.y + 18} L 360 ${c.y + 26}`} fill="none" stroke={INK} strokeWidth="1.3" />
          <line x1={360} y1={c.y + 18} x2={376} y2={c.y + 18} stroke={INK} strokeWidth="1.3" />
          <Box x={376} y={c.y} w={190} h={36} title={c.name} hatch={`${id}-hatch`} />
        </g>
      ))}
      <Label x={604} y={386} size={10.5} fill={INK2} anchor="end" style={sans}>Cascade delete from Customers</Label>
    </>
  );
};

/* ---------------------------------------- Assignment and Submission Manager */
const RolesPlate = () => {
  const id = 'plate-roles';
  const states = [
    { x: 120, label: 'Published', verb: 'publish', note: 'the assignment goes out' },
    { x: 320, label: 'Submitted', verb: 'submit', note: 'the work comes in' },
    { x: 520, label: 'Reviewed', verb: 'review', note: 'feedback goes back' },
  ];
  return (
    <>
      <Defs id={id} />
      <Label x={24} y={34} size={12} fill={INK2}>Life of an assignment</Label>
      {states.map((s, i) => (
        <g key={s.label}>
          <circle cx={s.x} cy={110} r={46} fill={i === 2 ? INK : PAPER} stroke={INK} strokeWidth="1.5" />
          <Label x={s.x} y={114} anchor="middle" size={13} fill={i === 2 ? PAPER : INK}>
            {s.label}
          </Label>
          {i < states.length - 1 && <Arrow id={id} x1={s.x + 48} y1={110} x2={states[i + 1].x - 50} y2={110} />}
          {i > 0 && (
            <Label x={s.x - 100} y={100} anchor="middle" size={11} fill={INK2} style={sans}>
              {s.verb}
            </Label>
          )}
          <Label x={s.x} y={182} anchor="middle" size={11} fill={INK2} style={sans}>
            {s.note}
          </Label>
        </g>
      ))}

      <line x1={24} y1={212} x2={616} y2={212} stroke={CYAN} strokeWidth="1" strokeDasharray="2 4" />
      <Label x={24} y={238} size={12} fill={INK2}>How a request is allowed through</Label>

      <Box x={40} y={270} w={140} h={64} title="Next.js" sub="React, TypeScript" />
      <Box x={460} y={270} w={140} h={64} title="ASP.NET Core" sub="Web API, C#" />

      {/* The token, in three parts, riding on the request. */}
      <Arrow id={id} x1={180} y1={302} x2={456} y2={302} />
      <g>
        <rect x={232} y={256} width={176} height={26} fill={PAPER} stroke={RED} strokeWidth="1.3" />
        <line x1={286} y1={256} x2={286} y2={282} stroke={RED} strokeWidth="1.3" />
        <line x1={366} y1={256} x2={366} y2={282} stroke={RED} strokeWidth="1.3" />
        <Label x={259} y={273} anchor="middle" size={10} fill={RED}>header</Label>
        <Label x={326} y={273} anchor="middle" size={10} fill={RED}>role</Label>
        <Label x={387} y={273} anchor="middle" size={10} fill={RED}>sig</Label>
        <Label x={320} y={326} anchor="middle" size={11} fill={INK2} style={sans}>JWT on every request</Label>
      </g>

      {/* Three policies on the API side, one per role. */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={472 + i * 42} y={350} width={30} height={30} fill={i === 1 ? `url(#${id}-hatch)` : PAPER} stroke={INK} strokeWidth="1.3" />
          <Label x={487 + i * 42} y={370} anchor="middle" size={11}>{i + 1}</Label>
        </g>
      ))}
      <Label x={456} y={370} anchor="end" size={11} fill={INK2} style={sans}>three roles</Label>
    </>
  );
};

/* ------------------------------------------------------------------ Thesis */
const ThesisPlate = () => {
  const id = 'plate-thesis';
  const bar = (x, y, w, o = 0.35) => <rect x={x} y={y} width={w} height={6} fill={INK} opacity={o} />;
  const stats = [
    { n: '46', a: 'change log files', b: 'Azure SDK for Java' },
    { n: '26', a: 'releases', b: 'Hibernate Search' },
    { n: '14', a: 'elements extracted', b: 'from every entry' },
  ];
  return (
    <>
      <Defs id={id} />
      {/* A change log page, with one entry marked up in red pencil. */}
      <g>
        <rect x={40} y={36} width={250} height={330} fill={PAPER} stroke={INK} strokeWidth="1.5" />
        <Label x={58} y={64} size={14}>Changelog</Label>
        {bar(58, 82, 70, 0.7)}
        {bar(58, 102, 190)}
        {bar(58, 116, 150)}
        {bar(58, 130, 172)}
        {bar(58, 156, 70, 0.7)}
        {bar(58, 176, 182)}
        {bar(58, 190, 120)}
        {/* the architectural one */}
        <path d={cloud(50, 204, 214, 40, 8)} fill="none" stroke={RED} strokeWidth="1.4" strokeLinejoin="round" />
        {bar(58, 214, 186, 0.6)}
        {bar(58, 228, 140, 0.6)}
        {bar(58, 262, 70, 0.7)}
        {bar(58, 282, 160)}
        {bar(58, 296, 184)}
        {bar(58, 310, 110)}
        {bar(58, 336, 140)}
        <path d="M262 224 C 300 224, 300 190, 330 190" fill="none" stroke={RED} strokeWidth="1.3" />
        <Label x={334} y={186} size={12} fill={RED}>Architectural change</Label>
        <Label x={334} y={202} size={11} fill={RED} style={sans}>what moved, and why</Label>
      </g>

      <line x1={330} y1={232} x2={616} y2={232} stroke={CYAN} strokeWidth="1" strokeDasharray="2 4" />

      {stats.map((s, i) => (
        <g key={s.n}>
          <text x={334 + i * 98} y={300} fontSize="56" fill={INK} style={display}>
            {s.n}
          </text>
          <Label x={336 + i * 98} y={324} size={11} fill={INK} style={sans}>{s.a}</Label>
          <Label x={336 + i * 98} y={340} size={10.5} fill={INK2} style={sans}>{s.b}</Label>
        </g>
      ))}
      <Label x={334} y={62} size={12} fill={INK2}>Two Java projects</Label>
      <Label x={334} y={84} size={12} fill={INK} style={sans}>Compared with FSECAM, then a</Label>
      <Label x={334} y={102} size={12} fill={INK} style={sans}>baseline sentence structure for</Label>
      <Label x={334} y={120} size={12} fill={INK} style={sans}>writing these entries</Label>
    </>
  );
};

/* -------------------------------------------------------------- Super app */
const SuperAppPlate = () => {
  const id = 'plate-super';
  const layers = [
    { name: 'AI intelligence layer', fill: INK, text: PAPER },
    { name: 'Lifestyle layer', fill: `url(#${id}-hatch)`, text: INK },
    { name: 'Core financial services', fill: PAPER, text: INK },
  ];
  return (
    <>
      <Defs id={id} />
      <Label x={24} y={34} size={12} fill={INK2}>Three layers</Label>
      {layers.map((l, i) => (
        <g key={l.name}>
          <rect x={40} y={52 + i * 52} width={360} height={42} fill={l.fill} stroke={INK} strokeWidth="1.5" />
          {i === 1 && <rect x={52} y={62 + i * 52} width={156} height={22} fill={PAPER} />}
          <Label x={58} y={78 + i * 52} size={13} fill={l.text}>
            {l.name}
          </Label>
        </g>
      ))}

      {/* Ten use-case marks, one per AI use case in the plan. */}
      <Label x={432} y={70} size={12} fill={INK2}>AI use cases</Label>
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={432 + (i % 5) * 30}
          y={86 + Math.floor(i / 5) * 30}
          width={20}
          height={20}
          fill={PAPER}
          stroke={RED}
          strokeWidth="1.3"
        />
      ))}
      <Label x={432} y={172} size={11} fill={INK2} style={sans}>10+, customer-facing and internal</Label>

      <line x1={24} y1={222} x2={616} y2={222} stroke={CYAN} strokeWidth="1" strokeDasharray="2 4" />
      <Label x={24} y={248} size={12} fill={INK2}>Roadmap</Label>

      {['Phase 1', 'Phase 2', 'Phase 3'].map((p, i) => (
        <g key={p}>
          <path
            d={`M${40 + i * 190} 276 h 170 l 14 18 l -14 18 h -170 ${i === 0 ? 'z' : 'l 14 -18 z'}`}
            fill={i === 0 ? INK : PAPER}
            stroke={INK}
            strokeWidth="1.5"
          />
          <Label x={70 + i * 190} y={299} size={13} fill={i === 0 ? PAPER : INK}>
            {p}
          </Label>
        </g>
      ))}

      {/* Overall length, as a dimension line. */}
      <g stroke={INK} strokeWidth="1.2">
        <line x1={40} y1={350} x2={604} y2={350} />
        <line x1={40} y1={336} x2={40} y2={364} />
        <line x1={604} y1={336} x2={604} y2={364} />
        <line x1={34} y1={356} x2={46} y2={344} />
        <line x1={598} y1={356} x2={610} y2={344} />
      </g>
      <rect x={272} y={340} width={100} height={20} fill={PAPER} />
      <Label x={322} y={355} anchor="middle" size={12}>24 months</Label>
    </>
  );
};

const PLATES = { api: ApiPlate, roles: RolesPlate, thesis: ThesisPlate, superapp: SuperAppPlate };

const Plate = ({ kind, title, className = '' }) => {
  const Drawing = PLATES[kind];
  if (!Drawing) return null;
  return (
    <svg viewBox="0 0 640 400" className={`block h-auto w-full ${className}`} role="img" aria-label={title}>
      <Drawing />
    </svg>
  );
};

export default Plate;
