// Generative, animated artwork for project cards — no screenshots needed,
// each project gets its own hue + motif. Purely decorative.

const NODES = [
  [40, 110], [90, 50], [150, 92], [210, 36], [262, 84], [176, 138], [70, 140], [290, 128],
];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [0, 6], [6, 5], [4, 7], [5, 7], [1, 3]];

export default function ProjectArt({ art, hue, className = "" }) {
  const c1 = `hsl(${hue} 85% 72%)`;
  const c2 = `hsl(${(hue + 40) % 360} 80% 58%)`;
  const id = `g-${art}-${hue}`;

  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${hue} 60% 18%)`} />
          <stop offset="1" stopColor={`hsl(${(hue + 30) % 360} 65% 9%)`} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor={c1} stopOpacity="0.45" />
          <stop offset="1" stopColor={c1} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill={`url(#${id})`} />
      <circle cx="240" cy="40" r="90" fill={`url(#${id}-glow)`} className="art-drift" />

      {art === "orbit" && (
        <g transform="translate(160 80)" fill="none" stroke={c1} strokeOpacity="0.55">
          {[26, 46, 68].map((r, i) => (
            <g key={r} style={{ transformOrigin: "0 0", animation: `artSpin ${14 + i * 6}s linear infinite ${i % 2 ? "reverse" : ""}` }}>
              <ellipse rx={r * 1.6} ry={r * 0.7} transform={`rotate(${i * 32})`} />
              <circle cx={r * 1.6} cy="0" r={3 + i} fill={i % 2 ? c2 : c1} stroke="none" transform={`rotate(${i * 32})`} />
            </g>
          ))}
          <circle r="9" fill={c1} stroke="none" className="art-pulse" />
        </g>
      )}

      {art === "steps" && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={40 + i * 62}
              y={112 - i * 22}
              width="50"
              height={48 + i * 22}
              rx="6"
              fill={i % 2 ? c2 : c1}
              fillOpacity={0.25 + i * 0.16}
              stroke={c1}
              strokeOpacity="0.6"
              className="art-rise"
              style={{ animationDelay: `${i * 0.25}s`, transformOrigin: `${65 + i * 62}px 160px` }}
            />
          ))}
          <path d="M65 100 L127 78 L189 56 L251 34" stroke={c1} strokeWidth="2" strokeDasharray="5 6" fill="none" className="art-dash" />
        </g>
      )}

      {art === "network" && (
        <g>
          {EDGES.map(([a, b], i) => (
            <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} stroke={c1} strokeOpacity="0.4" strokeDasharray="4 5" className="art-dash" />
          ))}
          {NODES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 7 : 5} fill={i % 2 ? c2 : c1} className="art-pulse" style={{ animationDelay: `${i * 0.3}s`, transformOrigin: `${x}px ${y}px` }} />
          ))}
        </g>
      )}

      {art === "bars" && (
        <g>
          {Array.from({ length: 12 }).map((_, i) => {
            const h = 30 + ((i * 37) % 70);
            return (
              <rect
                key={i}
                x={22 + i * 24}
                y={150 - h}
                width="14"
                height={h}
                rx="4"
                fill={i % 3 === 0 ? c2 : c1}
                fillOpacity="0.7"
                className="art-bar"
                style={{ animationDelay: `${i * 0.12}s`, transformOrigin: `${29 + i * 24}px 150px` }}
              />
            );
          })}
        </g>
      )}

      {art === "grid" && (
        <g>
          {Array.from({ length: 24 }).map((_, i) => (
            <rect
              key={i}
              x={28 + (i % 8) * 34}
              y={22 + Math.floor(i / 8) * 42}
              width="26"
              height="32"
              rx="6"
              fill={i % 5 === 0 ? c2 : c1}
              className="art-tile"
              style={{ animationDelay: `${(i * 0.17) % 2.4}s` }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
