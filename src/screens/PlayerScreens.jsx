import { useState, useEffect } from 'react';
import { Icon, ACTIVITY_META, qfWord, TEAMS } from '../data.jsx';
import { Btn, TopBar, Chip, Stat, Progress, Avatar, RankBadge, Burst, ScreenScroll, FooterBar } from '../components/UI.jsx';
import AdventureMap from '../components/AdventureMap.jsx';

const ROSTER = ['Sam Ortiz', 'Ava Lin', 'Marco Diaz', 'Priya Raman'];
const PACE = { t2: 1.0, t3: 0.93, t4: 0.74, t5: 0.86 };
const JITTER = { t2: 20, t3: -30, t4: 15, t5: -10 };

const stopPoints = (st) => st.activities.reduce((a, x) => a + (x.points || 0), 0);
const totalPoints = (race) => race.stops.reduce((a, st) => a + stopPoints(st), 0);
const pointsThrough = (race, idx) => race.stops.slice(0, idx).reduce((a, st) => a + stopPoints(st), 0);

function buildLeaderboard(race, play) {
  const total = race.stops.length;
  const done = play.completedIds ? play.completedIds.length : (play.idx || 0);
  const rows = TEAMS.map(tm => {
    if (tm.you) return { team: tm, score: play.score, stopsDone: done, you: true };
    const pace = PACE[tm.id] || 0.9;
    const score = Math.max(0, Math.round(play.score * pace) + (JITTER[tm.id] || 0));
    const stopsDone = Math.max(0, Math.min(total, Math.round(done * pace)));
    return { team: tm, score, stopsDone, you: false };
  });
  rows.sort((a, b) => b.score - a.score || b.stopsDone - a.stopsDone);
  rows.forEach((r, i) => r.rank = i + 1);
  return rows;
}

const myRank = (rows) => (rows.find(r => r.you) || {}).rank || 1;

export function qfRank(race, play) { return myRank(buildLeaderboard(race, play)); }

export function PlayJoin({ go, back, t }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  function tryJoin() {
    if (code.trim().length >= 3) { go({ name: 'lobby' }); }
    else { setError(true); setTimeout(() => setError(false), 800); }
  }

  return (
    <>
      <TopBar sub={qfWord(t, 'Quest') + ' player'} title="Join a quest" onBack={back} />
      <ScreenScroll>
        <div style={{ padding: '8px 18px 24px' }}>
          {/* QR scanner mock */}
          <div style={{ borderRadius: 22, overflow: 'hidden', background: '#111', height: 240, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
            {/* corner brackets */}
            {[['0%','0%','right','bottom'],['100%','0%','left','bottom'],['0%','100%','right','top'],['100%','100%','left','top']].map(([l,t2,br,bb], i) => (
              <div key={i} style={{ position: 'absolute', left: l, top: t2, width: 36, height: 36, transform: `translate(${i%2?'-':''}16px, ${i>1?'-':''}16px)`, borderColor: 'var(--qf-primary)', borderStyle: 'solid', borderWidth: 0, [`border${br[0].toUpperCase()+br.slice(1)}Width`]: 3, [`border${bb[0].toUpperCase()+bb.slice(1)}Width`]: 3, borderRadius: 6 }} />
            ))}
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon name="qr" size={40} stroke={1.6} style={{ color: 'rgba(255,255,255,0.7)' }} />
              </div>
              <div style={{ fontFamily: 'var(--qf-body)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Point camera at the QR code</div>
            </div>
            {/* scan line animation */}
            <div style={{ position: 'absolute', left: '10%', right: '10%', height: 2, background: 'var(--qf-primary)', opacity: 0.7, animation: 'qfBob 2s ease-in-out infinite', top: '50%' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--qf-line)' }} />
            <span style={{ fontFamily: 'var(--qf-body)', fontSize: 13, color: 'var(--qf-muted)', fontWeight: 600 }}>or enter code</span>
            <div style={{ flex: 1, height: 1, background: 'var(--qf-line)' }} />
          </div>

          <div style={{ animation: error ? 'qfShake .4s ease' : 'none' }}>
            <input
              style={{ width: '100%', boxSizing: 'border-box', padding: '16px 18px', borderRadius: 16, border: `2px solid ${error ? '#E0564B' : 'var(--qf-line)'}`, background: 'var(--qf-surface)', color: 'var(--qf-ink)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 22, letterSpacing: 2, textAlign: 'center', outline: 'none', textTransform: 'uppercase', transition: 'border .2s' }}
              placeholder="QF-XXX-00"
              value={code}
              onChange={e => { setCode(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && tryJoin()}
            />
            {error && <div style={{ textAlign: 'center', fontFamily: 'var(--qf-body)', fontSize: 13, color: '#E0564B', marginTop: 8 }}>Code not found — check with your organiser</div>}
          </div>
        </div>
      </ScreenScroll>
      <FooterBar>
        <Btn full variant="primary" icon="play" onClick={tryJoin}>Join quest</Btn>
      </FooterBar>
    </>
  );
}

export function PlayLobby({ race, go, back, t, mapStyle, startPlay }) {
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
          <button onClick={back} style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevronL" size={20} stroke={2.6} />
          </button>
          <span style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)' }}>{qfWord(t, 'Quest')} lobby</span>
        </div>
        <div style={{ position: 'relative', padding: '12px 20px 0' }}>
          <div style={{ color: '#fff' }}>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 29, lineHeight: 1.05 }}>{race.name}</div>
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
              <div key={i} style={{ flex: 1, padding: '12px 4px', borderRadius: 16, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
                <Stat icon={s[0]} value={s[1]} label={s[2]} tint="var(--qf-primary)" />
              </div>
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
              {ROSTER.map((n, i) => (
                <div key={i} style={{ marginLeft: i ? -8 : 0 }}>
                  <Avatar name={n} color={['#FF5C39', '#7C6CF6', '#0FB5A4', '#EC6FB0'][i]} size={38} />
                </div>
              ))}
              <div style={{ marginLeft: 10, fontFamily: 'var(--qf-body)', fontSize: 13, color: 'var(--qf-muted)' }}>
                {ROSTER.map(n => n.split(' ')[0]).join(', ')}
              </div>
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
      <FooterBar blur>
        <Btn full variant="primary" size="lg" icon="play" onClick={() => setCount(3)}>Start the {qfWord(t, 'quest')}</Btn>
      </FooterBar>

      {count !== null && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 95, background: 'var(--qf-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, letterSpacing: 2, fontSize: 14, opacity: 0.85 }}>GET READY</div>
          <div key={count} style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 140, lineHeight: 1, animation: 'qfPop .5s ease' }}>{count === 0 ? 'GO' : count}</div>
        </div>
      )}
    </>
  );
}

export function PlayMap({ race, play, go, back, t, mapStyle }) {
  const total = race.stops.length;
  const allDone = play.completedIds.length >= total;
  const rows = buildLeaderboard(race, play);
  const rank = myRank(rows);

  if (allDone) {
    return (
      <>
        <TopBar sub={race.name} title="Quest complete!" />
        <ScreenScroll>
          <div style={{ padding: '0 18px' }}>
            <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--qf-line)' }}>
              <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="play" completedIds={play.completedIds} height={250} />
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

  return (
    <>
      <div style={{ paddingTop: 52, padding: '52px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={back} style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, background: 'var(--qf-surface)', color: 'var(--qf-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px var(--qf-shadow)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
          <Icon name="chevronL" size={20} stroke={2.6} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--qf-primary)' }}>{race.name}</div>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 21, color: 'var(--qf-ink)' }}>{play.completedIds.length} of {total} done</div>
        </div>
        <button onClick={() => go({ name: 'leaderboard' })} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 14, border: 'none', background: 'var(--qf-surface)', boxShadow: '0 3px 10px -4px var(--qf-shadow)', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
          <Icon name="trophy" size={17} stroke={2.3} style={{ color: 'var(--qf-accent)' }} />
          <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, color: 'var(--qf-ink)' }}>#{rank}</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, color: 'var(--qf-primary)' }}>{play.score}</span>
          <span style={{ fontFamily: 'var(--qf-body)', fontSize: 10.5, color: 'var(--qf-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>pts</span>
        </div>
      </div>
      <div style={{ padding: '0 18px 8px' }}>
        <Progress showDots dots={total} doneDots={play.completedIds.length} />
      </div>
      <ScreenScroll>
        <div style={{ padding: '6px 18px 16px' }}>
          <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--qf-line)', boxShadow: '0 10px 26px -14px var(--qf-shadow)' }}>
            <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="play" completedIds={play.completedIds} height={220}
              onPinTap={(i) => {
                const s = race.stops[i];
                if (!play.completedIds.includes(s.id)) go({ name: 'activity', stopId: s.id });
              }} />
          </div>

          <div style={{ marginTop: 16, fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16, color: 'var(--qf-ink)', marginBottom: 10 }}>Choose any stop</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {race.stops.map((s, i) => {
              const isDone = play.completedIds.includes(s.id);
              return (
                <button key={s.id}
                  onClick={() => { if (!isDone) go({ name: 'activity', stopId: s.id }); }}
                  style={{
                    textAlign: 'left', padding: '14px 16px', borderRadius: 18, width: '100%',
                    background: isDone ? 'var(--qf-surface-2)' : 'var(--qf-surface)',
                    border: '1px solid var(--qf-line)',
                    cursor: isDone ? 'default' : 'pointer',
                    opacity: isDone ? 0.6 : 1,
                    boxShadow: isDone ? 'none' : '0 5px 16px -12px var(--qf-shadow)',
                    WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 17, color: '#fff', background: isDone ? 'var(--qf-secondary)' : i === 0 ? 'var(--qf-secondary)' : i === race.stops.length - 1 ? 'var(--qf-accent)' : 'var(--qf-primary)' }}>
                      {isDone ? <Icon name="check" size={20} stroke={3} /> : i === 0 ? <Icon name="flag" size={16} stroke={2.4} /> : i === race.stops.length - 1 ? <Icon name="trophy" size={16} stroke={2.2} /> : i}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16, color: isDone ? 'var(--qf-muted)' : 'var(--qf-ink)' }}>{s.name}</div>
                      <div style={{ fontFamily: 'var(--qf-body)', fontSize: 12.5, color: 'var(--qf-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.hint}</div>
                    </div>
                    {isDone
                      ? <Icon name="check" size={18} stroke={2.4} style={{ color: 'var(--qf-secondary)', flexShrink: 0 }} />
                      : <Icon name="chevron" size={18} stroke={2.4} style={{ color: 'var(--qf-muted)', flexShrink: 0 }} />}
                  </div>
                  {!isDone && s.activities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {s.activities.map((a, k) => {
                        const m = ACTIVITY_META[a.type];
                        return <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 8, background: 'var(--qf-surface-2)', color: m.tint, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5 }}><Icon name={m.icon} size={12} stroke={2.4} /> {m.label} · {a.points}</span>;
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ScreenScroll>
    </>
  );
}

export function PlayResult({ race, play, prevRank, go }) {
  const total = race.stops.length;
  const allDone = play.completedIds.length >= total;
  const rows = buildLeaderboard(race, play);
  const rank = myRank(rows);
  const climbed = prevRank && rank < prevRank;
  const [burst, setBurst] = useState(false);
  useEffect(() => { const tm = setTimeout(() => setBurst(true), 200); return () => clearTimeout(tm); }, []);

  return (
    <>
      <Burst run={burst} />
      <ScreenScroll>
        <div style={{ padding: '54px 24px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--qf-secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px -10px var(--qf-secondary)', animation: 'qfPop .5s ease' }}>
            <Icon name="check" size={50} stroke={3} />
          </div>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 27, color: 'var(--qf-ink)', marginTop: 18 }}>Stop cleared!</div>
          <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14.5, color: 'var(--qf-muted)', marginTop: 4 }}>{play.lastCompletedName} is in the bag.</div>

          <div style={{ marginTop: 22, width: '100%', padding: 20, borderRadius: 22, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)', boxShadow: '0 10px 26px -16px var(--qf-shadow)' }}>
            <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--qf-muted)' }}>Points this stop</div>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 52, color: 'var(--qf-primary)', lineHeight: 1.1, animation: 'qfPop .5s .1s ease both' }}>+{play.lastEarned}</div>
            <div style={{ display: 'flex', borderTop: '1px solid var(--qf-line)', marginTop: 14, paddingTop: 14 }}>
              <Stat icon="star" value={play.score} label="Total" tint="var(--qf-ink)" />
              <Stat icon="trophy" value={'#' + rank} label="Rank" tint="var(--qf-accent)" />
              <Stat icon="pin" value={play.completedIds.length + '/' + total} label="Stops" tint="var(--qf-secondary)" />
            </div>
          </div>

          {climbed && (
            <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 15px', borderRadius: 99, whiteSpace: 'nowrap', background: 'color-mix(in srgb, var(--qf-secondary) 14%, transparent)', color: 'var(--qf-secondary)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 14 }}>
              <Icon name="bolt" size={16} stroke={2.4} /> You climbed to #{rank}!
            </div>
          )}
        </div>
      </ScreenScroll>
      <FooterBar>
        {allDone
          ? <Btn full variant="accent" icon="trophy" onClick={() => go({ name: 'recap' })}>Finish &amp; see results</Btn>
          : <Btn full variant="primary" iconRight="arrow" onClick={() => go({ name: 'play' })}>Back to the map</Btn>}
      </FooterBar>
    </>
  );
}

export function PlayLeaderboard({ race, play, back }) {
  const rows = buildLeaderboard(race, play);
  const total = race.stops.length;

  return (
    <>
      <TopBar
        sub={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--qf-primary)', display: 'inline-block', animation: 'qfBlink 1.4s infinite' }} /> Live standings</span>}
        title="Leaderboard" onBack={back} />
      <ScreenScroll>
        <div style={{ padding: '0 18px 18px' }}>
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
                  <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15.5, color: 'var(--qf-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.team.name}{r.you && <span style={{ color: 'var(--qf-primary)', fontSize: 12, marginLeft: 6 }}>YOU</span>}
                  </div>
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

export function PlayRecap({ race, play, go, mapStyle, restart }) {
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
              <div key={i} style={{ flex: 1, padding: '14px 4px', borderRadius: 16, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
                <Stat icon={s[0]} value={s[1]} label={s[2]} tint="var(--qf-primary)" />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 2px 12px' }}>
            <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, color: 'var(--qf-ink)' }}>Team photo wall</span>
            <Chip icon="share">Share</Chip>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {photoStops.map((s, i) => (
              <div key={s.id} style={{ background: '#fff', padding: '8px 8px 26px', borderRadius: 5, boxShadow: '0 8px 20px -12px rgba(0,0,0,0.3)', transform: `rotate(${i % 2 ? 1.6 : -1.6}deg)` }}>
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 3, background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="image" size={28} stroke={1.5} style={{ color: '#ccc' }} />
                </div>
                <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 12.5, color: 'var(--qf-ink)', marginTop: 7, textAlign: 'center' }}>{s.name}</div>
              </div>
            ))}
            {photoStops.length === 0 && (
              <div style={{ gridColumn: '1/-1', padding: 20, borderRadius: 16, background: 'var(--qf-surface-2)', textAlign: 'center', fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-muted)' }}>No photo challenges in this quest.</div>
            )}
          </div>

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
