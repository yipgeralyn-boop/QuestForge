// ui.jsx — QuestForge shared UI primitives
// Exports to window: Btn, TopBar, Chip, Stat, Progress, Sheet, Field,
//   Avatar, RankBadge, Burst, ScreenScroll, FooterBar

(function () {
  const { useEffect, useState } = React;
  const Icon = window.Icon;

  // Primary action + variants
  function Btn({ children, onClick, variant = 'primary', size = 'lg', icon, iconRight, disabled, style = {}, full }) {
    const base = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      fontFamily: 'var(--qf-display)', fontWeight: 600, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      borderRadius: 16, transition: 'transform .12s ease, box-shadow .12s ease, opacity .12s',
      width: full ? '100%' : undefined, WebkitTapHighlightColor: 'transparent', whiteSpace: 'nowrap',
      opacity: disabled ? 0.45 : 1, letterSpacing: 0.2,
    };
    const sizes = {
      lg: { padding: '15px 22px', fontSize: 17 },
      md: { padding: '11px 16px', fontSize: 15 },
      sm: { padding: '8px 13px', fontSize: 13.5, borderRadius: 12, gap: 6 },
    };
    const variants = {
      primary: { background: 'var(--qf-primary)', color: 'var(--qf-primary-ink)', boxShadow: '0 8px 18px -6px var(--qf-primary)' },
      accent: { background: 'var(--qf-accent)', color: 'var(--qf-accent-ink)', boxShadow: '0 8px 18px -8px var(--qf-accent)' },
      dark: { background: 'var(--qf-ink)', color: 'var(--qf-bg)' },
      soft: { background: 'var(--qf-surface-2)', color: 'var(--qf-ink)' },
      outline: { background: 'transparent', color: 'var(--qf-ink)', boxShadow: 'inset 0 0 0 1.5px var(--qf-line)' },
      ghost: { background: 'transparent', color: 'var(--qf-muted)' },
    };
    return (
      <button onClick={disabled ? undefined : onClick} disabled={disabled}
        onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
        {icon && <Icon name={icon} size={size === 'sm' ? 16 : 19} stroke={2.4} />}
        {children}
        {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 19} stroke={2.4} />}
      </button>
    );
  }

  function TopBar({ title, sub, onBack, action, tone = 'plain', icon }) {
    const onPrimary = tone === 'primary';
    return (
      <div style={{
        paddingTop: 52, padding: '52px 18px 14px', display: 'flex', alignItems: 'center', gap: 12,
        background: onPrimary ? 'transparent' : 'transparent', position: 'relative', zIndex: 5,
      }}>
        {onBack && (
          <button onClick={onBack} style={{
            width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: onPrimary ? 'rgba(255,255,255,0.18)' : 'var(--qf-surface)',
            color: onPrimary ? '#fff' : 'var(--qf-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px var(--qf-shadow)', WebkitTapHighlightColor: 'transparent',
          }}>
            <Icon name="chevronL" size={20} stroke={2.6} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {sub && <div style={{ fontFamily: 'var(--qf-body)', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: onPrimary ? 'rgba(255,255,255,0.85)' : 'var(--qf-primary)' }}>{sub}</div>}
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 22, lineHeight: 1.1, color: onPrimary ? '#fff' : 'var(--qf-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        </div>
        {action}
      </div>
    );
  }

  function Chip({ children, icon, tint, active, onClick, style = {} }) {
    return (
      <button onClick={onClick} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999,
        fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 13, cursor: onClick ? 'pointer' : 'default',
        border: 'none', WebkitTapHighlightColor: 'transparent',
        background: active ? (tint || 'var(--qf-ink)') : 'var(--qf-surface-2)',
        color: active ? '#fff' : 'var(--qf-ink)',
        boxShadow: active ? '0 4px 10px -4px var(--qf-shadow)' : 'none', ...style,
      }}>
        {icon && <Icon name={icon} size={15} stroke={2.4} />}
        {children}
      </button>
    );
  }

  function Stat({ icon, value, label, tint }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: tint || 'var(--qf-ink)' }}>
          {icon && <Icon name={icon} size={16} stroke={2.4} />}
          <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 19 }}>{value}</span>
        </div>
        <span style={{ fontFamily: 'var(--qf-body)', fontSize: 11, fontWeight: 600, color: 'var(--qf-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</span>
      </div>
    );
  }

  function Progress({ value, max = 100, tint = 'var(--qf-primary)', height = 9, showDots, dots = 0, doneDots = 0 }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    if (showDots) {
      return (
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {Array.from({ length: dots }).map((_, i) => (
            <div key={i} style={{ flex: 1, height, borderRadius: 99, background: i < doneDots ? tint : 'var(--qf-line)', transition: 'background .3s' }} />
          ))}
        </div>
      );
    }
    return (
      <div style={{ width: '100%', height, borderRadius: 99, background: 'var(--qf-line)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: tint, transition: 'width .5s cubic-bezier(.4,1.4,.5,1)' }} />
      </div>
    );
  }

  // Bottom sheet / full modal
  function Sheet({ open, onClose, children, full = false, pad = true }) {
    const [show, setShow] = useState(open);
    useEffect(() => { if (open) setShow(true); }, [open]);
    if (!show) return null;
    return (
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end',
        background: 'rgba(20,12,30,0.42)', backdropFilter: 'blur(2px)',
        animation: open ? 'qfFade .2s ease' : 'qfFade .2s ease reverse',
      }}
        onAnimationEnd={() => { if (!open) setShow(false); }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: '100%', background: 'var(--qf-bg)', borderRadius: full ? '26px 26px 0 0' : '26px 26px 0 0',
          maxHeight: full ? '92%' : '82%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.25)', animation: 'qfSlideUp .28s cubic-bezier(.2,.9,.3,1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
            <div style={{ width: 38, height: 5, borderRadius: 99, background: 'var(--qf-line)' }} />
          </div>
          <div style={{ overflow: 'auto', padding: pad ? '8px 18px 26px' : 0 }}>{children}</div>
        </div>
      </div>
    );
  }

  function Field({ label, children, hint }) {
    return (
      <label style={{ display: 'block', marginBottom: 14 }}>
        {label && <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 13, color: 'var(--qf-ink)', marginBottom: 7 }}>{label}</div>}
        {children}
        {hint && <div style={{ fontFamily: 'var(--qf-body)', fontSize: 12, color: 'var(--qf-muted)', marginTop: 6 }}>{hint}</div>}
      </label>
    );
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 14,
    border: '1.5px solid var(--qf-line)', background: 'var(--qf-surface)', color: 'var(--qf-ink)',
    fontFamily: 'var(--qf-body)', fontSize: 15, outline: 'none', WebkitAppearance: 'none',
  };

  function Avatar({ name, color, size = 34, you }) {
    const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('');
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: size * 0.4,
        boxShadow: you ? '0 0 0 2.5px var(--qf-bg), 0 0 0 4px var(--qf-accent)' : 'none',
      }}>{initials}</div>
    );
  }

  function RankBadge({ rank }) {
    const palette = { 1: ['#FFD24A', '#7A5B00'], 2: ['#D6DBE3', '#54606E'], 3: ['#E6A86A', '#6B3F18'] };
    const c = palette[rank];
    if (!c) return <div style={{ width: 26, textAlign: 'center', fontFamily: 'var(--qf-display)', fontWeight: 600, color: 'var(--qf-muted)' }}>{rank}</div>;
    return (
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: c[0], color: c[1], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 13 }}>{rank}</div>
    );
  }

  // Confetti burst
  function Burst({ run }) {
    const colors = ['var(--qf-primary)', 'var(--qf-secondary)', 'var(--qf-accent)', '#7C6CF6', '#EC6FB0'];
    if (!run) return null;
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 90 }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const left = Math.random() * 100, delay = Math.random() * 0.3, dur = 1.4 + Math.random() * 1.2;
          const size = 6 + Math.random() * 7, rot = Math.random() * 360;
          return <span key={i} style={{
            position: 'absolute', top: '-8%', left: `${left}%`, width: size, height: size * 0.6,
            background: colors[i % colors.length], borderRadius: 2,
            transform: `rotate(${rot}deg)`, animation: `qfConfetti ${dur}s ${delay}s linear forwards`,
          }} />;
        })}
      </div>
    );
  }

  function ScreenScroll({ children, style = {} }) {
    return <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', ...style }}>{children}</div>;
  }

  function FooterBar({ children, blur }) {
    return (
      <div style={{
        padding: '12px 18px 30px', display: 'flex', gap: 10, flexShrink: 0,
        background: blur ? 'color-mix(in srgb, var(--qf-bg) 86%, transparent)' : 'var(--qf-bg)',
        backdropFilter: blur ? 'blur(10px)' : 'none',
        boxShadow: '0 -8px 20px -14px var(--qf-shadow)', position: 'relative', zIndex: 5,
      }}>{children}</div>
    );
  }

  Object.assign(window, { Btn, TopBar, Chip, Stat, Progress, Sheet, Field, inputStyle, Avatar, RankBadge, Burst, ScreenScroll, FooterBar });
})();
