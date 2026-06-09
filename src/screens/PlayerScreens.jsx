import { useState, useEffect, useRef } from 'react';
import { Icon, ACTIVITY_META, qfWord } from '../data.jsx';
import { Btn, TopBar, Chip, Stat, Progress, Avatar, RankBadge, Burst, ScreenScroll, FooterBar } from '../components/UI.jsx';
import AdventureMap from '../components/AdventureMap.jsx';

const stopPoints = (st) => st.activities.reduce((a, x) => a + (x.points || 0), 0);

function getSimRivals(race, play) {
  if (!play?.startTime || !race?.stops?.length) return [];
  const elapsed = Math.max(0, (Date.now() - play.startTime) / 1000);
  const duration = (race.duration || 60) * 60;
  const pct = Math.min(1, elapsed / duration);
  const total = race.stops.length;
  const totalPts = race.stops.reduce((a, s) => a + s.activities.reduce((b, x) => b + (x.points || 0), 0), 0);
  return [
    { name: 'Team Falcon',    color: '#7C6CF6', rate: 0.78 },
    { name: 'The Navigators', color: '#22D3EE', rate: 0.50 },
    { name: 'Lost & Found',   color: '#F472B6', rate: 0.28 },
  ].map(r => ({
    name: r.name, color: r.color,
    stops: Math.min(total, Math.round(total * pct * r.rate * 1.4)),
    score: Math.round(totalPts * pct * r.rate),
  }));
}
const totalPoints = (race) => race.stops.reduce((a, st) => a + stopPoints(st), 0);
const pointsThrough = (race, idx) => race.stops.slice(0, idx).reduce((a, st) => a + stopPoints(st), 0);

export function qfRank(race, play) {
  if (!race?.stops || !play) return 1;
  const total = race.stops.reduce((a, s) => a + s.activities.reduce((b, x) => b + (x.points || 0), 0), 0);
  if (!total) return 1;
  const rivals = [Math.round(total * 0.55), Math.round(total * 0.70), Math.round(total * 0.38)];
  return 1 + rivals.filter(r => r > (play.score || 0)).length;
}

function ordinal(n) {
  const v = n % 100;
  return n + (['th','st','nd','rd'][(v - 20) % 10] || ['th','st','nd','rd'][v] || 'th');
}

export function PlayJoin({ go, back, t, race }) {
  const [code, setCode] = useState(race?.publishedCode || '');
  const [error, setError] = useState(false);

  function tryJoin() {
    const trimmed = code.trim();
    if (race?.publishedCode) {
      if (trimmed.toLowerCase() === race.publishedCode.toLowerCase()) go({ name: 'teamSetup' });
      else { setError(true); setTimeout(() => setError(false), 800); }
    } else {
      if (trimmed.length >= 3) go({ name: 'teamSetup' });
      else { setError(true); setTimeout(() => setError(false), 800); }
    }
  }

  return (
    <>
      <TopBar sub={qfWord(t, 'Quest') + ' player'} title="Join a quest" onBack={back} />
      <ScreenScroll>
        <div style={{ padding: '32px 18px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="pin" size={38} stroke={1.8} style={{ color: 'var(--qf-primary)' }} />
            </div>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 20, color: 'var(--qf-ink)' }}>Enter your quest code</div>
            <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14, color: 'var(--qf-muted)', marginTop: 6 }}>Team leaders to input code from organiser</div>
          </div>

          <div style={{ animation: error ? 'qfShake .4s ease' : 'none' }}>
            <input
              style={{ width: '100%', boxSizing: 'border-box', padding: '18px', borderRadius: 16, border: `2px solid ${error ? '#E0564B' : 'var(--qf-line)'}`, background: 'var(--qf-surface)', color: 'var(--qf-ink)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 26, letterSpacing: 3, textAlign: 'center', outline: 'none', textTransform: 'uppercase', transition: 'border .2s' }}
              placeholder="QF-XXX-00"
              value={code}
              autoFocus
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

export function PlayTeamSetup({ go, back, t, setTeam }) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState(['', '', '']);
  const [nameError, setNameError] = useState(false);

  function proceed() {
    if (!name.trim()) { setNameError(true); setTimeout(() => setNameError(false), 800); return; }
    setTeam(name.trim(), members.filter(m => m.trim()));
    go({ name: 'lobby' });
  }

  const inputBase = { width: '100%', boxSizing: 'border-box', padding: '13px 14px', borderRadius: 12, border: '1.5px solid var(--qf-line)', background: 'var(--qf-surface)', color: 'var(--qf-ink)', fontFamily: 'var(--qf-body)', fontSize: 15, outline: 'none' };

  return (
    <>
      <TopBar sub={qfWord(t, 'Quest') + ' player'} title="Your team" onBack={back} />
      <ScreenScroll>
        <div style={{ padding: '20px 18px 8px' }}>
          <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 13, color: nameError ? '#E0564B' : 'var(--qf-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, transition: 'color .2s' }}>Team name</div>
          <div style={{ animation: nameError ? 'qfShake .4s ease' : 'none' }}>
            <input
              autoFocus
              style={{ ...inputBase, fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, marginBottom: 4, borderColor: nameError ? '#E0564B' : 'var(--qf-line)', transition: 'border-color .2s' }}
              placeholder="e.g. Compass Crew"
              value={name}
              onChange={e => { setName(e.target.value); setNameError(false); }}
              onKeyDown={e => e.key === 'Enter' && proceed()}
            />
            <div style={{ height: 20, marginBottom: 16 }}>
              {nameError && <div style={{ fontFamily: 'var(--qf-body)', fontSize: 13, color: '#E0564B' }}>Enter a team name to continue</div>}
            </div>
          </div>

          <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 13, color: 'var(--qf-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Members</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inputBase, flex: 1 }}
                  placeholder={`Member ${i + 1} name`}
                  value={m}
                  onChange={e => { const a = [...members]; a[i] = e.target.value; setMembers(a); }}
                />
                <button
                  onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); setMembers(members.filter((_, j) => j !== i)); }}
                  style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: 'color-mix(in srgb, #E0564B 10%, transparent)', color: '#E0564B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                  <Icon name="close" size={15} stroke={2.6} />
                </button>
              </div>
            ))}
          </div>
          <button
            onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); setMembers([...members, '']); }}
            style={{ width: '100%', marginTop: 10, padding: '12px', borderRadius: 12, border: '1.5px dashed var(--qf-line)', background: 'transparent', color: 'var(--qf-primary)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
            <Icon name="plus" size={16} stroke={2.6} /> Add member
          </button>
        </div>
      </ScreenScroll>
      <FooterBar>
        <Btn full variant="primary" icon="play" onClick={proceed}>Enter lobby</Btn>
      </FooterBar>
    </>
  );
}

export function PlayLobby({ race, go, back, t, mapStyle, startPlay, play }) {
  const [count, setCount] = useState(null);
  const teamName = play.teamName || 'Your Team';
  const roster = play.roster || [];

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

          <div style={{ marginTop: 12, padding: '14px 16px', borderRadius: 18, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 14, color: 'var(--qf-ink)', marginBottom: 10 }}>How to win</div>
            {[
              ['target', `Complete stops in any order — no set route`],
              ['star', `Earn points by finishing activities at each stop`],
              ['trophy', `Highest score when time runs out wins`],
            ].map(([icon, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: 'var(--qf-surface-2)', color: 'var(--qf-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={icon} size={16} stroke={2.2} />
                </div>
                <span style={{ fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-ink)', lineHeight: 1.3 }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: 16, borderRadius: 20, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--qf-primary)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 17, color: 'var(--qf-ink)' }}>{teamName}</span>
              <span style={{ fontFamily: 'var(--qf-body)', fontSize: 12, fontWeight: 700, color: 'var(--qf-primary)', background: 'var(--qf-surface-2)', padding: '3px 8px', borderRadius: 99 }}>YOU</span>
            </div>
            {roster.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}>
                {roster.map((n, i) => (
                  <div key={i} style={{ marginLeft: i ? -8 : 0 }}>
                    <Avatar name={n} color={['#FF5C39', '#7C6CF6', '#0FB5A4', '#EC6FB0', '#F59E0B', '#3B82F6'][i % 6]} size={38} />
                  </div>
                ))}
                <div style={{ marginLeft: 10, fontFamily: 'var(--qf-body)', fontSize: 13, color: 'var(--qf-muted)' }}>
                  {roster.map(n => n.split(' ')[0]).join(', ')}
                </div>
              </div>
            )}
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

export function PlayMap({ race, play, go, back, t, mapStyle, onDismissBroadcast }) {
  const total = race.stops.length;
  const allDone = play.completedIds.length >= total;
  const rank = qfRank(race, play);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const [secsLeft, setSecsLeft] = useState(() => {
    if (!play.startTime) return race.duration * 60;
    return Math.max(0, race.duration * 60 - Math.floor((Date.now() - play.startTime) / 1000));
  });

  useEffect(() => {
    if (allDone) return;
    const id = setInterval(() => {
      const s = play.startTime ? Math.max(0, race.duration * 60 - Math.floor((Date.now() - play.startTime) / 1000)) : 0;
      setSecsLeft(s);
      if (s === 0) { clearInterval(id); go({ name: 'recap' }); }
    }, 1000);
    return () => clearInterval(id);
  }, [allDone, play.startTime]);

  const mins = Math.floor(secsLeft / 60);
  const secs = secsLeft % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
  const urgent = secsLeft <= 120;

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
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ paddingTop: 52, padding: '52px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setConfirmQuit(true)} style={{ width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, background: 'var(--qf-surface)', color: 'var(--qf-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px var(--qf-shadow)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
          <Icon name="chevronL" size={20} stroke={2.6} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--qf-primary)' }}>{race.name}</div>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 21, color: 'var(--qf-ink)' }}>{play.completedIds.length} of {total} done</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'var(--qf-accent)', color: 'var(--qf-accent-ink)', fontFamily: 'var(--qf-display)', fontWeight: 700, fontSize: 13 }}>
            <Icon name="trophy" size={13} stroke={2.4} /> {ordinal(rank)}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, color: 'var(--qf-primary)' }}>{play.score}</span>
            <span style={{ fontFamily: 'var(--qf-body)', fontSize: 10.5, color: 'var(--qf-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>pts</span>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ margin: '2px 18px 6px', padding: '9px 14px', borderRadius: 14, background: urgent ? 'color-mix(in srgb, #E0564B 10%, var(--qf-surface))' : 'var(--qf-surface)', border: `1.5px solid ${urgent ? 'color-mix(in srgb, #E0564B 35%, var(--qf-line))' : 'var(--qf-line)'}`, display: 'flex', alignItems: 'center', gap: 10, transition: 'all .4s' }}>
        <Icon name="clock" size={16} stroke={2.3} style={{ color: urgent ? '#E0564B' : 'var(--qf-muted)', flexShrink: 0, transition: 'color .4s' }} />
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--qf-line)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: urgent ? '#E0564B' : 'var(--qf-primary)', width: `${(secsLeft / (race.duration * 60)) * 100}%`, transition: 'width 1s linear, background .4s' }} />
        </div>
        <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16, color: urgent ? '#E0564B' : 'var(--qf-ink)', minWidth: 46, textAlign: 'right', transition: 'color .4s' }}>{timeStr}</span>
      </div>

      {race.broadcast?.message && play.dismissedBroadcastAt !== race.broadcast.sentAt && (
        <div style={{ margin: '0 18px 6px', padding: '11px 14px', borderRadius: 14, background: 'color-mix(in srgb, var(--qf-secondary) 12%, var(--qf-surface))', border: '1px solid color-mix(in srgb, var(--qf-secondary) 28%, var(--qf-line))', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Icon name="bolt" size={15} stroke={2.4} style={{ color: 'var(--qf-secondary)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5, color: 'var(--qf-secondary)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>Announcement!</div>
            <div style={{ fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-ink)', lineHeight: 1.4 }}>{race.broadcast.message}</div>
          </div>
          <button onClick={onDismissBroadcast} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--qf-muted)', padding: 0, flexShrink: 0, display: 'flex' }}>
            <Icon name="close" size={15} stroke={2.4} />
          </button>
        </div>
      )}

      <div style={{ margin: '0 18px 6px', display: 'flex', gap: 6 }}>
        {[{ name: 'You', color: 'var(--qf-primary)', stops: play.completedIds.length, score: play.score, isMe: true }, ...getSimRivals(race, play)].map((r, i) => (
          <div key={i} style={{ flex: 1, padding: '7px 9px', borderRadius: 11, background: r.isMe ? 'color-mix(in srgb, var(--qf-primary) 10%, var(--qf-surface))' : 'var(--qf-surface)', border: `1px solid ${r.isMe ? 'color-mix(in srgb, var(--qf-primary) 30%, var(--qf-line))' : 'var(--qf-line)'}` }}>
            <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 10, color: r.isMe ? 'var(--qf-primary)' : 'var(--qf-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>{r.name}</div>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 13, color: 'var(--qf-ink)', lineHeight: 1 }}>{r.score}<span style={{ fontFamily: 'var(--qf-body)', fontSize: 9, color: 'var(--qf-muted)', marginLeft: 2 }}>pts</span></div>
            <div style={{ marginTop: 4, height: 3, borderRadius: 99, background: 'var(--qf-line)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, background: r.isMe ? 'var(--qf-primary)' : r.color, width: total > 0 ? `${(r.stops / total) * 100}%` : '0%', transition: 'width 1s linear' }} />
            </div>
          </div>
        ))}
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
                        const hasPenalty = a.penalty > 0 && ['quiz', 'riddle', 'choice'].includes(a.type);
                        return (
                          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 8, background: 'var(--qf-surface-2)', color: m.tint, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5 }}>
                            <Icon name={m.icon} size={12} stroke={2.4} /> {m.label} · {a.points} pts
                            {hasPenalty && <span style={{ color: '#E0564B' }}>· −{a.penalty} wrong</span>}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ScreenScroll>

      {confirmQuit && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: 'var(--qf-bg)', borderRadius: '24px 24px 0 0', padding: '22px 18px 34px' }}>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 20, color: 'var(--qf-ink)', marginBottom: 6 }}>Leave the quest?</div>
            <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14, color: 'var(--qf-muted)', marginBottom: 20 }}>Your progress will be lost.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn full variant="soft" onClick={() => setConfirmQuit(false)}>Keep playing</Btn>
              <Btn full variant="outline" onClick={() => go({ name: 'home' })}>Leave</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlayResult({ race, play, go }) {
  const total = race.stops.length;
  const allDone = play.completedIds.length >= total;
  const [burst, setBurst] = useState(false);
  useEffect(() => { const tm = setTimeout(() => setBurst(true), 200); return () => clearTimeout(tm); }, []);

  return (
    <>
      <Burst run={burst} />
      <ScreenScroll>
        <div style={{ padding: '54px 24px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--qf-secondary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 30px -10px var(--qf-secondary)' }}>
            <Icon name="check" size={50} stroke={3} />
          </div>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 27, color: 'var(--qf-ink)', marginTop: 18 }}>Stop cleared!</div>
          <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14.5, color: 'var(--qf-muted)', marginTop: 4 }}>{play.lastCompletedName} is in the bag.</div>

          <div style={{ marginTop: 22, width: '100%', padding: 20, borderRadius: 22, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)', boxShadow: '0 10px 26px -16px var(--qf-shadow)' }}>
            <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--qf-muted)' }}>Points this stop</div>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 52, color: 'var(--qf-primary)', lineHeight: 1.1 }}>+{play.lastEarned}</div>
            <div style={{ display: 'flex', borderTop: '1px solid var(--qf-line)', marginTop: 14, paddingTop: 14 }}>
              <Stat icon="trophy" value={ordinal(qfRank(race, play))} label="Position" tint="var(--qf-accent)" />
              <Stat icon="star" value={play.score} label="Total" tint="var(--qf-ink)" />
              <Stat icon="pin" value={play.completedIds.length + '/' + total} label="Stops" tint="var(--qf-secondary)" />
            </div>
          </div>
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

export function PlayRecap({ race, play, go, mapStyle, restart }) {
  const [burst, setBurst] = useState(false);
  useEffect(() => { const tm = setTimeout(() => setBurst(true), 250); return () => clearTimeout(tm); }, []);
  const photoStops = race.stops.filter(s => s.activities.some(a => a.type === 'photo'));
  const approvedPhotos = race.approvedPhotos || [];
  const pendingPhotos = race.pendingPhotos || [];

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
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 34, lineHeight: 1.05, marginTop: 4 }}>Quest complete!</div>
          </div>
        </div>

        <div style={{ padding: '18px 18px 8px' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['trophy', ordinal(qfRank(race, play)), 'Place'], ['star', play.score, 'Points'], ['pin', race.stops.length, 'Stops'], ['clock', play.startTime ? Math.round((Date.now() - play.startTime) / 60000) + 'm' : race.duration + 'm', 'Time']].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '14px 4px', borderRadius: 16, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
                <Stat icon={s[0]} value={s[1]} label={s[2]} tint={i === 0 ? 'var(--qf-accent)' : 'var(--qf-primary)'} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 2px 12px' }}>
            <span style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 18, color: 'var(--qf-ink)' }}>Team photo wall</span>
            <Chip icon="share">Share</Chip>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {photoStops.map((s, i) => {
              const photo = approvedPhotos.find(p => p.stopId === s.id) || pendingPhotos.find(p => p.stopId === s.id);
              const isPending = photo && !approvedPhotos.find(p => p.stopId === s.id);
              return (
                <div key={s.id} style={{ background: '#fff', padding: '8px 8px 26px', borderRadius: 5, boxShadow: '0 8px 20px -12px rgba(0,0,0,0.3)', transform: `rotate(${i % 2 ? 1.6 : -1.6}deg)`, position: 'relative' }}>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: 3, background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {photo?.photoUrl
                      ? <img src={photo.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : <Icon name="image" size={28} stroke={1.5} style={{ color: '#ccc' }} />}
                  </div>
                  {isPending && (
                    <div style={{ position: 'absolute', top: 12, right: 8, background: '#F59E0B', color: '#fff', fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 10, padding: '2px 6px', borderRadius: 6, letterSpacing: 0.5 }}>PENDING</div>
                  )}
                  <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 12.5, color: 'var(--qf-ink)', marginTop: 7, textAlign: 'center' }}>{s.name}</div>
                </div>
              );
            })}
            {photoStops.length === 0 && (
              <div style={{ gridColumn: '1/-1', padding: 20, borderRadius: 16, background: 'var(--qf-surface-2)', textAlign: 'center', fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-muted)' }}>No photo challenges in this quest.</div>
            )}
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
