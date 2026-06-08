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
      <g transform="translate(89,12)" opacity="0.7">
        <circle r="6.5" fill="none" stroke={ms.ink} strokeWidth="0.6" opacity="0.5" />
        <path d="M0 -6 L1.6 0 L0 6 L-1.6 0 Z" fill={ms.ink} opacity="0.55" />
        <path d="M-6 0 L0 -1.4 L6 0 L0 1.4 Z" fill={ms.ink} opacity="0.3" />
        <text x="0" y="-7.6" textAnchor="middle" fill={ms.ink} opacity="0.6"
          style={{ font: '700 3.4px "Fredoka", system-ui' }}>N</text>
      </g>
    </svg>
  );
}

export default function AdventureMap({
  stops, mapStyle = 'parchment', mode = 'build', currentIndex = 0,
  selectedId = null, onPinTap, height = 300,
  placing = false, onPlace, ghost = null,
  completedIds = [],
}) {
  const ms = MAP_STYLES[mapStyle] || MAP_STYLES.parchment;
  const pts = stops.map(s => ({ x: s.x, y: s.y }));

  const fullD = useMemo(() => smoothPath(pts), [JSON.stringify(pts)]);

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
        <path d={fullD} fill="none" stroke={ms.ink} strokeOpacity={0.4}
          strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.2 3.2" />
      </svg>

      {stops.map((s, i) => {
        const done = mode === 'play' ? completedIds.includes(s.id) : false;
        const isFirst = i === 0, isLast = i === stops.length - 1;
        const selected = selectedId === s.id;
        let bg = 'var(--qf-primary)', fg = 'var(--qf-primary-ink)';
        if (mode === 'play' && done) { bg = 'var(--qf-secondary)'; }
        const tappable = onPinTap && (mode !== 'play' || !done);
        return (
          <div key={s.id} onClick={(e) => { if (tappable) { e.stopPropagation(); onPinTap(i); } }}
            role={tappable ? 'button' : undefined} aria-label={s.name}
            style={{
              position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
              transform: 'translate(-50%,-100%)',
              padding: 0, cursor: tappable ? 'pointer' : 'default', zIndex: 4,
              WebkitTapHighlightColor: 'transparent',
              opacity: mode === 'play' && done ? 0.65 : 1,
            }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50% 50% 50% 4px',
                transform: 'rotate(45deg)',
                background: bg,
                border: '2px solid rgba(255,255,255,0.55)',
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
