// screens-player.jsx — QuestForge player flow
// Exports to window: PlayLobby, PlayMap, PlayResult, PlayLeaderboard, PlayRecap

(function () {
  const { useState, useEffect } = React;
  const { Icon, Btn, TopBar, Chip, Stat, Progress, Avatar, RankBadge, Burst, ScreenScroll, FooterBar, AdventureMap, ACTIVITY_META, qfWord, TEAMS } = window;

  const ROSTER = ['Sam Ortiz', 'Ava Lin', 'Marco Diaz', 'Priya Raman', 'Jules Kim'];
  const PACE = { t2: 1.0, t3: 0.93, t4: 0.74, t5: 0.86 };
  const JITTER = { t2: 20, t3: -30, t4: 15, t5: -10 };

  const stopPoints = (st) => st.activities.reduce((a, x) => a + (x.points || 0), 0);
  const pointsThrough = (race, idx) => race.stops.slice(0, idx).reduce((a, st) => a + stopPoints(st), 0);

  function buildLeaderboard(race, play) {
    const total = race.stops.length;
    const rows = TEAMS.map(tm => {
      if (tm.you) return { team: tm, score: play.score, stopsDone: Math.min(play.idx, total), you: true };
      const perfect = pointsThrough(race, play.idx);
      const score = Math.max(0, Math.round(perfect * (PACE[tm.id] || 0.9)) + (JITTER[tm.id] || 0));
      const stopsDone = Math.max(0, Math.min(total, Math.round(play.idx * (PACE[tm.id] || 0.9))));
      return { team: tm, score, stopsDone, you: false };
    });
    rows.sort((a, b) => b.score - a.score || b.stopsDone - a.stopsDone);
    rows.forEach((r, i) => r.rank = i + 1);
    return rows;
  }
  const myRank = (rows) => (rows.find(r => r.you) || {}).rank || 1;

  // ── Lobby ────────────────────────────────────────────────────
  function PlayLobby({ race, go, back, t, mapStyle, startPlay }) {
    const [count, setCount] = useState(null);
    useEffect(() => {
      if (count === null) return;
      if (count === 0) { startPlay(); go({ name: 'play' }); return; }
      const tm = setTimeout(() => setCount(c => c - 1), 800);
      return () => clearTimeout(tm);
    }, [count]);

    return (
      <>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, height: 250, background: 'var(--qf-primary)' }} />
          <div style={{ position: 'relative', paddingTop: 52, padding: '52px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={back} style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevronL" size={20} stroke={2.6} /></button>
            <span style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>{qfWord(t, 'Quest')} lobby</span>
          </div>
          <div style={{ position: 'relative', padding: '12px 20px 0' }}>
            <div style={{ color: '#fff' }}>
              <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 29, lineHeight: 1.05, textWrap: 'balance' }}>{race.name}</div>
              <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14, opacity: 0.9, marginTop: 6 }}>{race.tagline}</div>
            </div>
            <div style={{ marginTop: 16, borderRadius: 20, overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 16px 30px -14px var(--qf-shadow)' }}>
              <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="build" height={172} />
            </div>
          </div>
        </div>
        <ScreenScroll style={{ marginTop: 4 }}>
          <div style={{ padding: '14px 20px 8px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['pin', race.stops.length, 'Stops'], ['star', pointsThrough(race, race.stops.length), 'Points'], ['clock', race.duration + 'm', 'Limit']].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: '12px 4px', borderRadius: 16, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}><Stat icon={s[0]} value={s[1]} label={s[2]} tint="var(--qf-primary)" /></div>
              ))}
            </div>

            <div style={{ marginTop: 18, padding: 16, borderRadius: 20, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--qf-primary)' }} />
                  <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 17, color: 'var(--qf-ink)' }}>Compass Crew</span>
                  <span style={{ fontFamily: 'var(--qf-body)', fontSize: 12, fontWeight: 700, color: 'var(--qf-primary)', background: 'var(--qf-surface-2)', padding: '3px 8px', borderRadius: 99 }}>YOU</span>
                </div>
                <button style={{ border: 'none', background: 'transparent', color: 'var(--qf-muted)', cursor: 'pointer' }}><Icon name="edit" size={17} stroke={2.3} /></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}>
                {ROSTER.slice(0, 4).map((n, i) => (
                  <div key={i} style={{ marginLeft: i ? -8 : 0 }}><Avatar name={n} color={['#FF5C39', '#7C6CF6', '#0FB5A4', '#EC6FB0'][i]} size={38} /></div>
                ))}
                <div style={{ marginLeft: 10, fontFamily: 'var(--qf-body)', fontSize: 13, color: 'var(--qf-muted)' }}>{ROSTER.slice(0, 4).map(n => n.split(' ')[0]).join(', ')}</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5, color: 'var(--qf-muted)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Also racing today</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {TEAMS.filter(tm => !tm.you).map(tm => (
                  <div key={tm.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 14, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
                    <Avatar name={tm.name} color={tm.color} size={30} />
                    <span style={{ flex: 1, fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 14.5, color: 'var(--qf-ink)' }}>{tm.name}</span>
                    <span style={{ fontFamily: 'var(--qf-body)', fontSize: 12.5, color: 'var(--qf-muted)' }}>{tm.members} players</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScreenScroll>
        <FooterBar blur><Btn full variant="primary" size="lg" icon="play" onClick={() => setCount(3)}>Start the {qfWord(t, 'quest')}</Btn></FooterBar>

        {count !== null && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 95, background: 'var(--qf-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, letterSpacing: 2, fontSize: 14, opacity: 0.85 }}>GET READY</div>
            <div key={count} style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 140, lineHeight: 1, animation: 'qfPop .5s ease' }}>{count === 0 ? 'GO' : count}</div>
          </div>
        )}
      </>
    );
  }

  // ── Race-day map ─────────────────────────────────────────────
  function PlayMap({ race, play, go, t, mapStyle }) {
    const total = race.stops.length;
    const done = play.idx >= total;
    const stop = race.stops[Math.min(play.idx, total - 1)];
    const rows = buildLeaderboard(race, play);
    const rank = myRank(rows);
    const dist = [0, 120, 340, 260, 180, 410][play.idx % 6] || 150;

    if (done) {
      return (
        <>
          <TopBar sub={race.name} title="Finish line!" />
          <ScreenScroll>
            <div style={{ padding: '0 18px' }}>
              <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--qf-line)' }}>
                <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="play" currentIndex={total} height={250} />
              </div>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 24, color: 'var(--qf-ink)' }}>Every stop conquered!</div>
                <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14, color: 'var(--qf-muted)', marginTop: 4 }}>See how your team stacked up.</div>
              </div>
            </div>
          </ScreenScroll>
          <FooterBar><Btn full variant="accent" icon="trophy" onClick={() => go({ name: 'recap' })}>See the results</Btn></FooterBar>
        </>
      );
    }

    const next = play.idx + 1;
    return (
      <>
        <div style={{ paddingTop: 52, padding: '52px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--qf-primary)' }}>{race.name}</div>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 21, color: 'var(--qf-ink)' }}>Stop {next} of {total}</div>
          </div>
          <button onClick={() => go({ name: 'leaderboard' })} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 14, border: 'none', background: 'var(--qf-surface)', boxShadow: '0 3px 10px -4px var(--qf-shadow)', cursor: 'pointer' }}>
            <Icon name="trophy" size={17} stroke={2.3} style={{ color: 'var(--qf-accent)' }} />
            <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, color: 'var(--qf-ink)' }}>#{rank}</span>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, color: 'var(--qf-primary)' }}>{play.score}</span>
            <span style={{ fontFamily: 'var(--qf-body)', fontSize: 10.5, color: 'var(--qf-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>points</span>
          </div>
        </div>
        <div style={{ padding: '0 18px 8px' }}>
          <Progress showDots dots={total} doneDots={play.idx} />
        </div>

        <ScreenScroll>
          <div style={{ padding: '6px 18px 8px' }}>
            <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--qf-line)', boxShadow: '0 10px 26px -14px var(--qf-shadow)' }}>
              <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="play" currentIndex={play.idx} height={252}
                onPinTap={(i) => { if (i === play.idx) go({ name: 'activity' }); }} />
            </div>

            <div style={{ marginTop: 16, padding: 18, borderRadius: 20, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)', boxShadow: '0 8px 22px -16px var(--qf-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 99, background: 'color-mix(in srgb, var(--qf-primary) 14%, transparent)', color: 'var(--qf-primary)', fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5 }}><Icon name="target" size={13} stroke={2.5} /> NEXT STOP</span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5, color: 'var(--qf-secondary)' }}><Icon name="route" size={14} stroke={2.4} /> {dist}m away</span>
              </div>
              <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 22, color: 'var(--qf-ink)' }}>{stop.name}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 6 }}>
                <Icon name="compass" size={16} stroke={2.2} style={{ color: 'var(--qf-muted)', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-muted)', lineHeight: 1.4 }}>{stop.hint}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {stop.activities.map((a, k) => {
                  const m = ACTIVITY_META[a.type];
                  return <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 9, background: 'var(--qf-surface-2)', color: m.tint, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5 }}><Icon name={m.icon} size={13} stroke={2.4} /> {m.label} · {a.points}</span>;
                })}
              </div>
            </div>
          </div>
        </ScreenScroll>
        <FooterBar blur>
          <Btn full variant="primary" size="lg" icon={stop.activities[0].type === 'gps' ? 'pin' : 'play'} onClick={() => go({ name: 'activity' })}>
            {stop.activities[0].type === 'gps' ? "I'm here — check in" : 'Start this stop'}
          </Btn>
        </FooterBar>
      </>
    );
  }

  // ── Stop result ──────────────────────────────────────────────
  function PlayResult({ race, play, prevRank, go, t }) {
    const total = race.stops.length;
    const last = play.idx >= total;
    const rows = buildLeaderboard(race, play);
    const rank = myRank(rows);
    const climbed = prevRank && rank < prevRank;
    const [burst, setBurst] = useState(false);
    useEffect(() => { const tm = setTimeout(() => setBurst(true), 200); return () => clearTimeout(tm); }, []);
    const stop = race.stops[play.idx - 1];

    return (
      <>
        <Burst run={burst} />
        <ScreenScroll>
          <div style={{ padding: '54px 24px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--qf-secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px -10px var(--qf-secondary)', animation: 'qfPop .5s ease' }}>
              <Icon name="check" size={50} stroke={3} />
            </div>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 27, color: 'var(--qf-ink)', marginTop: 18 }}>Stop cleared!</div>
            <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14.5, color: 'var(--qf-muted)', marginTop: 4 }}>{stop ? stop.name : ''} is in the bag.</div>

            <div style={{ marginTop: 22, width: '100%', padding: 20, borderRadius: 22, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)', boxShadow: '0 10px 26px -16px var(--qf-shadow)' }}>
              <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--qf-muted)' }}>Points this stop</div>
              <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 52, color: 'var(--qf-primary)', lineHeight: 1.1, animation: 'qfPop .5s .1s ease both' }}>+{play.lastEarned}</div>
              <div style={{ display: 'flex', borderTop: '1px solid var(--qf-line)', marginTop: 14, paddingTop: 14 }}>
                <Stat icon="star" value={play.score} label="Total" tint="var(--qf-ink)" />
                <Stat icon="trophy" value={'#' + rank} label="Rank" tint="var(--qf-accent)" />
                <Stat icon="pin" value={play.idx + '/' + total} label="Stops" tint="var(--qf-secondary)" />
              </div>
            </div>

            {climbed && <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 99, whiteSpace: 'nowrap', background: 'color-mix(in srgb, var(--qf-secondary) 14%, transparent)', color: 'var(--qf-secondary)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 14 }}><Icon name="bolt" size={16} stroke={2.4} /> You climbed to #{rank}!</div>}
          </div>
        </ScreenScroll>
        <FooterBar>
          {last
            ? <Btn full variant="accent" icon="trophy" onClick={() => go({ name: 'recap' })}>Finish &amp; see results</Btn>
            : <Btn full variant="primary" iconRight="arrow" onClick={() => go({ name: 'play' })}>Onward to stop {play.idx + 1}</Btn>}
        </FooterBar>
      </>
    );
  }

  // ── Leaderboard ──────────────────────────────────────────────
  function PlayLeaderboard({ race, play, back, t }) {
    const rows = buildLeaderboard(race, play);
    const total = race.stops.length;
    return (
      <>
        <TopBar sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--qf-primary)', display: 'inline-block', animation: 'qfBlink 1.4s infinite' }} /> Live standings</span>} title="Leaderboard" onBack={back} />
        <ScreenScroll>
          <div style={{ padding: '0 18px 18px' }}>
            {/* podium */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, padding: '8px 0 18px' }}>
              {[rows[1], rows[0], rows[2]].map((r, i) => {
                const h = [78, 104, 60][i];
                return (
                  <div key={r.team.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar name={r.team.name} color={r.team.color} size={i === 1 ? 50 : 40} you={r.you} />
                    <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 12.5, color: 'var(--qf-ink)', marginTop: 6, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{r.team.name.split(' ')[0]}</div>
                    <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12, color: 'var(--qf-muted)' }}>{r.score}</div>
                    <div style={{ width: '78%', height: h, borderRadius: '10px 10px 0 0', marginTop: 8, background: r.you ? 'var(--qf-primary)' : 'var(--qf-surface-2)', border: '1px solid var(--qf-line)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 }}>
                      <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 20, color: r.you ? '#fff' : 'var(--qf-muted)' }}>{r.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {rows.map(r => (
                <div key={r.team.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, background: r.you ? 'color-mix(in srgb, var(--qf-primary) 9%, var(--qf-surface))' : 'var(--qf-surface)', border: r.you ? '1.5px solid var(--qf-primary)' : '1px solid var(--qf-line)' }}>
                  <RankBadge rank={r.rank} />
                  <Avatar name={r.team.name} color={r.team.color} size={36} you={r.you} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15.5, color: 'var(--qf-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.team.name}{r.you && <span style={{ color: 'var(--qf-primary)', fontSize: 12, marginLeft: 6 }}>YOU</span>}</div>
                    <div style={{ fontFamily: 'var(--qf-body)', fontSize: 12, color: 'var(--qf-muted)' }}>{r.stopsDone}/{total} stops</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, color: r.you ? 'var(--qf-primary)' : 'var(--qf-ink)' }}>{r.score}</div>
                    <div style={{ fontFamily: 'var(--qf-body)', fontSize: 10.5, color: 'var(--qf-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScreenScroll>
        <FooterBar><Btn full variant="dark" onClick={back}>Back to the map</Btn></FooterBar>
      </>
    );
  }

  // ── Recap ────────────────────────────────────────────────────
  function PlayRecap({ race, play, go, t, mapStyle, restart }) {
    const rows = buildLeaderboard(race, { ...play, idx: race.stops.length });
    const rank = myRank(rows);
    const [burst, setBurst] = useState(false);
    useEffect(() => { const tm = setTimeout(() => setBurst(true), 250); return () => clearTimeout(tm); }, []);
    const photoStops = race.stops.filter(s => s.activities.some(a => a.type === 'photo'));
    const place = rank === 1 ? 'Champions!' : rank === 2 ? 'Runners-up!' : rank === 3 ? 'On the podium!' : 'Quest complete!';

    return (
      <>
        <Burst run={burst} />
        <ScreenScroll>
          <div style={{ background: 'var(--qf-primary)', padding: '64px 22px 28px', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(255,255,255,.18), transparent 40%), radial-gradient(circle at 85% 90%, rgba(255,255,255,.12), transparent 45%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--qf-accent)', color: 'var(--qf-accent-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 26px -8px rgba(0,0,0,0.3)', animation: 'qfPop .5s ease' }}>
                <Icon name="trophy" size={44} stroke={2.2} />
              </div>
              <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, letterSpacing: 1.5, fontSize: 12.5, opacity: 0.9, marginTop: 16, textTransform: 'uppercase' }}>{race.name}</div>
              <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 34, lineHeight: 1.05, marginTop: 4 }}>{place}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '8px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.18)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16 }}>
                <Icon name="medal" size={18} stroke={2.2} /> Finished #{rank} of {rows.length}
              </div>
            </div>
          </div>

          <div style={{ padding: '18px 18px 8px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['star', play.score, 'Points'], ['pin', race.stops.length, 'Stops'], ['clock', Math.round(race.duration * 0.82) + 'm', 'Your time']].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: '14px 4px', borderRadius: 16, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}><Stat icon={s[0]} value={s[1]} label={s[2]} tint="var(--qf-primary)" /></div>
              ))}
            </div>

            {/* photo wall */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 2px 12px' }}>
              <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, color: 'var(--qf-ink)' }}>Team photo wall</span>
              <Chip icon="share">Share</Chip>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {photoStops.map((s, i) => (
                <div key={s.id} style={{ background: '#fff', padding: '8px 8px 26px', borderRadius: 5, boxShadow: '0 8px 20px -12px rgba(0,0,0,0.3)', transform: `rotate(${i % 2 ? 1.6 : -1.6}deg)` }}>
                  <div dangerouslySetInnerHTML={{ __html: `<image-slot id="qf-recap-${s.id}" style="display:block;width:100%;aspect-ratio:1;border-radius:3px" shape="rect" placeholder="Team photo"></image-slot>` }} />
                  <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 12.5, color: 'var(--qf-ink)', marginTop: 7, textAlign: 'center' }}>{s.name}</div>
                </div>
              ))}
              {photoStops.length === 0 && <div style={{ gridColumn: '1/-1', padding: 20, borderRadius: 16, background: 'var(--qf-surface-2)', textAlign: 'center', fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-muted)' }}>No photo challenges in this quest.</div>}
            </div>

            {/* final standings */}
            <div style={{ margin: '24px 2px 12px', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, color: 'var(--qf-ink)' }}>Final standings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rows.map(r => (
                <div key={r.team.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 14, background: r.you ? 'color-mix(in srgb, var(--qf-primary) 9%, var(--qf-surface))' : 'var(--qf-surface)', border: r.you ? '1.5px solid var(--qf-primary)' : '1px solid var(--qf-line)' }}>
                  <RankBadge rank={r.rank} />
                  <span style={{ flex: 1, fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, color: 'var(--qf-ink)' }}>{r.team.name}</span>
                  <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16, color: r.you ? 'var(--qf-primary)' : 'var(--qf-ink)' }}>{r.score}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 8 }} />
          </div>
        </ScreenScroll>
        <FooterBar blur>
          <Btn variant="soft" icon="refresh" onClick={restart} style={{ flex: '0 0 auto' }}> </Btn>
          <Btn full variant="primary" icon="sparkle" onClick={() => go({ name: 'home' })}>Back to start</Btn>
        </FooterBar>
      </>
    );
  }

  Object.assign(window, { PlayLobby, PlayMap, PlayResult, PlayLeaderboard, PlayRecap });
  window.qfRank = (race, play) => myRank(buildLeaderboard(race, play));
})();
