// screens-home.jsx — QuestForge entry point (choose Create or Play)
// Exports to window: HomeScreen

(function () {
  const { Icon, Btn, qfWord, ScreenScroll } = window;

  function HomeScreen({ race, go, t, mapStyle }) {
    const { AdventureMap } = window;
    return (
      <ScreenScroll>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* hero */}
          <div style={{ background: 'var(--qf-primary)', padding: '64px 22px 90px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(255,255,255,.2), transparent 38%), radial-gradient(circle at 90% 78%, rgba(255,255,255,.14), transparent 42%)' }} />
            {/* floating glyphs */}
            {[['pin', 14, 78, 0], ['flag', 86, 20, 1], ['star', 78, 64, 2], ['compass', 8, 30, 1.4]].map((g, i) => (
              <div key={i} style={{ position: 'absolute', left: g[1] + '%', top: g[2] + '%', color: 'rgba(255,255,255,0.22)', animation: `qfFloat ${4 + i}s ${g[3]}s ease-in-out infinite` }}><Icon name={g[0]} size={i % 2 ? 30 : 22} stroke={2.2} /></div>
            ))}
            <div style={{ position: 'relative', color: '#fff' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 99, background: 'rgba(255,255,255,0.18)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 13.5, marginBottom: 18 }}>
                <Icon name="compass" size={17} stroke={2.3} /> QuestForge
              </div>
              <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 38, lineHeight: 1.02, letterSpacing: -0.5, textWrap: 'balance' }}>Turn any place into an adventure.</div>
              <div style={{ fontFamily: 'var(--qf-body)', fontSize: 15, opacity: 0.92, marginTop: 12, maxWidth: 300, lineHeight: 1.45 }}>Build {qfWord(t, 'quests')} with stops, routes, photo missions and quizzes — then race your team to the finish.</div>
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

            <button onClick={() => go({ name: 'lobby', reset: true })} style={{ ...bigCard('var(--qf-ink)'), marginTop: 12 }}>
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

          {/* featured quest preview */}
          <div style={{ padding: '22px 18px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 17, color: 'var(--qf-ink)' }}>Your latest {qfWord(t, 'quest')}</span>
              <span style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12, color: 'var(--qf-secondary)', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--qf-secondary)' }} /> Ready</span>
            </div>
            <div role="button" tabIndex={0} onClick={() => go({ name: 'orgBuilder' })} style={{ width: '100%', padding: 0, border: '1px solid var(--qf-line)', borderRadius: 22, overflow: 'hidden', background: 'var(--qf-surface)', cursor: 'pointer', boxShadow: '0 10px 26px -16px var(--qf-shadow)' }}>
              <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="build" height={150} />
              <div style={{ padding: 16, textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 19, color: 'var(--qf-ink)' }}>{race.name}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                  {[['pin', race.stops.length + ' stops'], ['clock', race.duration + ' min'], ['users', race.teamCount + ' teams']].map((m, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--qf-body)', fontWeight: 600, fontSize: 13, color: 'var(--qf-muted)' }}><Icon name={m[0]} size={15} stroke={2.3} /> {m[1]}</span>
                  ))}
                </div>
              </div>
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

  window.HomeScreen = HomeScreen;
})();
