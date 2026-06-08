import { useMemo } from 'react';
import { Icon, MAP_STYLES } from '../data.jsx';

function smoothPath(p) {
  if (!p.length) return '';
  if (p.length === 1) return `M ${p[0].x} ${p[0].y}`;
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x} ${p2.y}`;
  }
  return d;
}

function lerpAlong(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function MapDecor({ ms }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <pattern id="qfgrid" width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M9 0H0V9" fill="none" stroke={ms.grid} strokeWidth="0.4" />
        </pattern>
        <filter id="qfsoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.7" />
        </filter>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill={ms.paper} />
      <rect x="0" y="0" width="100" height="100" fill="url(#qfgrid)" />
      <path d="M-5 8 C 20 14, 26 30, 44 30 S 78 22, 108 34 L 108 56 C 80 44, 62 50, 44 50 S 16 40, -5 36 Z"
        fill={ms.water} opacity="0.9" />
      <path d="M70 76 C 84 70, 100 78, 112 74 L 112 112 -2 112 -2 100 C 24 104, 52 92, 70 76 Z"
        fill={ms.water} opacity="0.9" />
      <path d="M6 58 C 2 50, 14 44, 22 48 S 34 62, 26 70 18 78, 8 72 10 66 6 58 Z" fill={ms.land} />
      <path d="M52 70 C 50 62, 62 60, 68 64 S 74 78, 64 80 52 78 52 70 Z" fill={ms.land2} />
      <ellipse cx="88" cy="46" rx="11" ry="9" fill={ms.land} />
      <g stroke={ms.roadEdge} strokeWidth="6.4" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M-4 84 C 24 80, 30 56, 50 56 S 78 64, 104 40" />
        <path d="M20 104 C 22 80, 40 70, 44 44 S 56 8, 70 -4" />
        <path d="M2 30 C 26 34, 40 26, 60 30 S 92 38, 106 26" />
      </g>
      <g stroke={ms.road} strokeWidth="3.6" fill="none" strokeLinecap="round">
        <path d="M-4 84 C 24 80, 30 56, 50 56 S 78 64, 104 40" />
        <path d="M20 104 C 22 80, 40 70, 44 44 S 56 8, 70 -4" />
        <path d="M2 30 C 26 34, 40 26, 60 30 S 92 38, 106 26" />
      </g>
      {[[12, 64], [16, 70], [9, 69], [60, 70], [65, 74], [89, 42], [85, 49], [92, 49], [38, 88], [44, 90]].map((t, i) => (
        <g key={i} filter="url(#qfsoft)">
          <circle cx={t[0]} cy={t[1]} r="2.4" fill={ms.land2} stroke={ms.ink} strokeOpacity="0.25" strokeWidth="0.4" />
        </g>
      ))}
      <g transform="translate(89,12)" opacity="0.85">
        <circle r="6.5" fill="none" stroke={ms.ink} strokeWidth="0.6" opacity="0.5" />
        <path d="M0 -6 L1.6 0 L0 6 L-1.6 0 Z" fill={ms.ink} opacity="0.55" />
        <path d="M-6 0 L0 -1.4 L6 0 L0 1.4 Z" fill={ms.ink} opacity="0.3" />
        <text x="0" y="-7.6" textAnchor="middle" fill={ms.ink} opacity="0.6"
          style={{ font: '700 3.4px "Fredoka", system-ui' }}>N</text>
      </g>
      <g stroke={ms.ink} strokeWidth="0.5" strokeDasharray="0.4 2" opacity="0.35" fill="none">
        <path d="M30 92 C 40 96, 54 96, 64 92" />
      </g>
    </svg>
  );
}

export default function AdventureMap({
  stops, mapStyle = 'parchment', mode = 'build', currentIndex = 0,
  selectedId = null, onPinTap, height = 300,
  placing = false, onPlace, ghost = null,
}) {
  const ms = MAP_STYLES[mapStyle] || MAP_STYLES.parchment;
  const pts = stops.map(s => ({ x: s.x, y: s.y }));

  const fullD = useMemo(() => smoothPath(pts), [JSON.stringify(pts)]);
  const doneD = useMemo(() => {
    if (mode !== 'play') return '';
    const sub = pts.slice(0, Math.min(pts.length, Math.max(1, currentIndex)));
    return smoothPath(sub);
  }, [JSON.stringify(pts), mode, currentIndex]);

  let you = null;
  if (mode === 'play') {
    const ci = Math.min(currentIndex, pts.length - 1);
    if (ci <= 0) you = lerpAlong(pts[0], pts[1] || pts[0], -0.18);
    else you = lerpAlong(pts[ci - 1], pts[ci], 0.42);
  }

  function handlePlaceClick(e) {
    if (!placing || !onPlace) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(10, Math.min(94, ((e.clientY - r.top) / r.height) * 100));
    onPlace(+x.toFixed(1), +y.toFixed(1));
  }

  return (
    <div style={{
      position: 'relative', width: '100%', height, overflow: 'hidden',
      background: ms.paper, cursor: placing ? 'crosshair' : 'default',
    }} onClick={handlePlaceClick}>
      <MapDecor ms={ms} />

      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <path d={fullD} fill="none" stroke={ms.ink} strokeOpacity={mode === 'play' ? 0.28 : 0.5}
          strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.2 3.2" />
        {mode === 'play' && currentIndex > 0 && (
          <path d={doneD} fill="none" stroke="var(--qf-secondary)" strokeWidth="2.1"
            strokeLinecap="round" strokeDasharray="0.2 3.2" />
        )}
      </svg>

      {stops.map((s, i) => {
        const done = mode === 'play' && i < currentIndex;
        const current = mode === 'play' && i === currentIndex;
        const isFirst = i === 0, isLast = i === stops.length - 1;
        const selected = selectedId === s.id;
        let bg = 'var(--qf-primary)', fg = 'var(--qf-primary-ink)';
        if (mode === 'play') {
          if (done) { bg = 'var(--qf-secondary)'; }
          else if (current) { bg = 'var(--qf-primary)'; }
          else { bg = 'var(--qf-surface)'; fg = 'var(--qf-muted)'; }
        }
        return (
          <div key={s.id} onClick={(e) => { if (onPinTap) { e.stopPropagation(); onPinTap(i); } }}
            role={onPinTap ? 'button' : undefined} aria-label={s.name}
            style={{
              position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
              transform: 'translate(-50%,-100%)',
              padding: 0, cursor: onPinTap ? 'pointer' : 'default', zIndex: current ? 6 : 4,
              WebkitTapHighlightColor: 'transparent',
            }}>
            {current && (
              <span style={{
                position: 'absolute', left: '50%', bottom: 2, width: 46, height: 46,
                transform: 'translate(-50%,50%)', borderRadius: '50%',
                background: 'var(--qf-primary)', opacity: 0.25,
                animation: 'qfPulse 1.8s ease-out infinite',
              }} />
            )}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50% 50% 50% 4px',
                transform: 'rotate(45deg)',
                background: bg,
                border: (mode === 'play' && !done && !current) ? '2px solid var(--qf-line)' : '2px solid rgba(255,255,255,0.55)',
                boxShadow: selected
                  ? '0 0 0 3px var(--qf-accent), 0 6px 14px var(--qf-shadow)'
                  : '0 5px 12px var(--qf-shadow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: fg }}>
                  {done ? <Icon name="check" size={17} stroke={3} />
                    : isFirst ? <Icon name="flag" size={15} stroke={2.4} />
                      : isLast ? <Icon name="trophy" size={15} stroke={2.2} />
                        : <span style={{ font: '700 15px var(--qf-display)' }}>{i}</span>}
                </span>
              </div>
              <div style={{
                width: 5, height: 5, borderRadius: '50%', marginTop: -1,
                background: 'rgba(0,0,0,0.18)', filter: 'blur(0.5px)',
              }} />
            </div>
          </div>
        );
      })}

      {you && (
        <div style={{
          position: 'absolute', left: `${you.x}%`, top: `${you.y}%`,
          transform: 'translate(-50%,-50%)', zIndex: 7, pointerEvents: 'none',
        }}>
          <span style={{
            position: 'absolute', left: '50%', top: '50%', width: 30, height: 30,
            transform: 'translate(-50%,-50%)', borderRadius: '50%',
            background: 'var(--qf-secondary)', opacity: 0.3,
            animation: 'qfPulse 1.8s ease-out infinite',
          }} />
          <div style={{
            position: 'relative', width: 18, height: 18, borderRadius: '50%',
            background: 'var(--qf-secondary)', border: '3px solid #fff',
            boxShadow: '0 3px 8px var(--qf-shadow)',
          }} />
        </div>
      )}

      {ghost && (
        <div style={{
          position: 'absolute', left: `${ghost.x}%`, top: `${ghost.y}%`,
          transform: 'translate(-50%,-100%)', zIndex: 8, pointerEvents: 'none',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50% 50% 50% 4px', transform: 'rotate(45deg)',
            background: 'var(--qf-primary)', opacity: 0.55, border: '2px dashed #fff',
          }} />
        </div>
      )}

      {placing && (
        <div style={{
          position: 'absolute', left: '50%', top: 14, transform: 'translateX(-50%)', zIndex: 9,
          display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999,
          background: 'var(--qf-ink)', color: 'var(--qf-bg)', whiteSpace: 'nowrap',
          fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 13, boxShadow: '0 6px 16px var(--qf-shadow)',
          animation: 'qfBob 1.6s ease-in-out infinite',
        }}>
          <Icon name="pin" size={15} stroke={2.4} /> Tap the map to drop a stop
        </div>
      )}
    </div>
  );
}
