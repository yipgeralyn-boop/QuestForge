import { Icon, qfWord } from '../data.jsx';
import { ScreenScroll } from '../components/UI.jsx';

export default function HomeScreen({ race, go, t, mapStyle }) {
  return (
    <ScreenScroll>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* hero */}
        <div style={{ background: 'var(--qf-primary)', padding: '64px 22px 90px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(255,255,255,.2), transparent 38%), radial-gradient(circle at 90% 78%, rgba(255,255,255,.14), transparent 42%)' }} />
          {[['pin', 14, 78, 0], ['flag', 86, 20, 1], ['star', 78, 64, 2], ['compass', 8, 30, 1.4]].map((g, i) => (
            <div key={i} style={{ position: 'absolute', left: g[1] + '%', top: g[2] + '%', color: 'rgba(255,255,255,0.22)', animation: `qfFloat ${4 + i}s ${g[3]}s ease-in-out infinite` }}>
              <Icon name={g[0]} size={i % 2 ? 30 : 22} stroke={2.2} />
            </div>
          ))}
          <div style={{ position: 'relative', color: '#fff' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 99, background: 'rgba(255,255,255,0.18)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 13.5, marginBottom: 18 }}>
              <Icon name="compass" size={17} stroke={2.3} /> QuestForge
            </div>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 38, lineHeight: 1.02, letterSpacing: -0.5 }}>Turn any place into an adventure.</div>
          </div>
        </div>

        {/* cards overlapping hero */}
        <div style={{ padding: '0 18px', marginTop: -64, position: 'relative' }}>
          <button onClick={() => go({ name: 'orgBuilder' })} style={bigCard('var(--qf-surface)')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={iconWrap('var(--qf-primary)')}><Icon name="edit" size={26} stroke={2.3} /></div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={cardTitle}>Build a {qfWord(t, 'quest')}</div>
                <div style={cardSub}>Drop stops on the map &amp; add activities</div>
              </div>
              <Icon name="chevron" size={22} stroke={2.4} style={{ color: 'var(--qf-muted)' }} />
            </div>
          </button>

          <button onClick={() => go({ name: 'join' })} style={{ ...bigCard('var(--qf-ink)'), marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={iconWrap('var(--qf-accent)', 'var(--qf-accent-ink)')}><Icon name="play" size={24} stroke={2.3} /></div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ ...cardTitle, color: 'var(--qf-bg)' }}>Play a {qfWord(t, 'quest')}</div>
                <div style={{ ...cardSub, color: 'color-mix(in srgb, var(--qf-bg) 65%, transparent)' }}>Join with a code &amp; race your team</div>
              </div>
              <Icon name="chevron" size={22} stroke={2.4} style={{ color: 'var(--qf-bg)', opacity: 0.6 }} />
            </div>
          </button>
        </div>

        {/* how it works */}
        <div style={{ padding: '24px 18px 28px' }}>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 17, color: 'var(--qf-ink)', marginBottom: 16 }}>How it works</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['edit',    'var(--qf-primary)',   'Build your route',        'Drop stops on the map and set a name, hint, and GPS location for each one.'],
              ['camera',  '#E85D9E',             'Add challenges',          'Attach photo missions, quizzes, riddles, or GPS check-ins to each stop.'],
              ['users',   'var(--qf-secondary)', 'Invite your teams',       'Share the join code or QR — teams scan in and see the same map in real time.'],
              ['trophy',  'var(--qf-accent)',    'Race to the finish',      'First team to complete every stop and collect the most points wins.'],
            ].map(([icon, tint, title, desc], i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 18, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: `color-mix(in srgb, ${tint} 15%, transparent)`, color: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={icon} size={21} stroke={2.3} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, color: 'var(--qf-ink)' }}>{title}</div>
                  <div style={{ fontFamily: 'var(--qf-body)', fontSize: 13, color: 'var(--qf-muted)', marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ScreenScroll>
  );
}

const bigCard = (bg) => ({ width: '100%', padding: 18, borderRadius: 22, background: bg, border: '1px solid var(--qf-line)', cursor: 'pointer', boxShadow: '0 12px 30px -16px var(--qf-shadow)', WebkitTapHighlightColor: 'transparent' });
const iconWrap = (bg, fg = '#fff') => ({ width: 54, height: 54, borderRadius: 16, background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
const cardTitle = { fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 19, color: 'var(--qf-ink)' };
const cardSub = { fontFamily: 'var(--qf-body)', fontSize: 13, color: 'var(--qf-muted)', marginTop: 2 };
