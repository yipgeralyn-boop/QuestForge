import { useState, useEffect, useRef } from 'react';
import { Icon, ACTIVITY_META, qfWord, makeId } from '../data.jsx';
import { Btn, TopBar, Chip, Stat, Progress, Sheet, Field, inputStyle, ScreenScroll, FooterBar } from '../components/UI.jsx';
import AdventureMap from '../components/AdventureMap.jsx';

function NumericInput({ style, value, onChange }) {
  const [str, setStr] = useState(String(value ?? ''));
  const committed = useRef(value);
  if (value !== committed.current && document.activeElement?.dataset?.numinput !== '1') {
    committed.current = value;
    // sync if field isn't focused
  }
  return (
    <input
      style={style}
      type="text"
      inputMode="numeric"
      data-numinput="1"
      value={str}
      onChange={e => {
        let raw = e.target.value.replace(/[^0-9]/g, '');
        raw = raw.replace(/^0+(\d)/, '$1');
        setStr(raw);
        onChange(raw === '' ? 0 : Number(raw));
      }}
      onBlur={() => {
        const n = Number(str) || 0;
        setStr(String(n));
        onChange(n);
      }}
    />
  );
}

const totalPoints = (race) => race.stops.reduce((s, st) => s + st.activities.reduce((a, x) => a + (x.points || 0), 0), 0);

const actSummary = (a) => {
  if (a.type === 'gps') return 'Geo check-in unlocks the stop';
  if (a.type === 'photo') return a.prompt;
  if (a.type === 'quiz') return a.question;
  if (a.type === 'choice') return a.question;
  if (a.type === 'riddle') return a.riddle;
  return '';
};

function ActivityTag({ type }) {
  const m = ACTIVITY_META[type];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 8, background: 'var(--qf-surface-2)', color: m.tint, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 11.5 }}>
      <Icon name={m.icon} size={13} stroke={2.4} /> {m.label}
    </span>
  );
}

export function OrgBuilder({ race, setRace, go, back, t, mapStyle }) {
  function addStop() {
    const n = race.stops.length + 1;
    const positions = [[30, 60], [55, 45], [70, 30], [45, 70], [20, 35], [75, 65], [50, 20], [60, 75]];
    const [x, y] = positions[(race.stops.length) % positions.length];
    const stop = { id: makeId(), name: `Stop ${n}`, hint: 'Add a location hint', x, y, activities: [] };
    setRace({ ...race, stops: [...race.stops, stop] });
    go({ name: 'orgStop', stopId: stop.id, fresh: true });
  }

  function moveStop(i, dir) {
    const arr = [...race.stops]; const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setRace({ ...race, stops: arr });
  }

  function deleteStop(id) {
    setRace({ ...race, stops: race.stops.filter(s => s.id !== id) });
  }

  return (
    <>
      <TopBar sub={qfWord(t, 'Quest') + ' builder'} title={race.name} onBack={back}
        action={<button onClick={() => go({ name: 'orgDetails' })} style={iconBtn}><Icon name="edit" size={18} stroke={2.3} /></button>} />
      <ScreenScroll>
        <div style={{ padding: '0 18px' }}>
          <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 10px 26px -12px var(--qf-shadow)', border: '1px solid var(--qf-line)', position: 'relative' }}>
            <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="build" height={262}
              onPinTap={(i) => go({ name: 'orgStop', stopId: race.stops[i].id })} />
          </div>

          <div style={{ display: 'flex', gap: 8, margin: '14px 0 4px' }}>
            {[['pin', race.stops.length, 'Stops', false], ['star', totalPoints(race), 'Points', false], ['clock', race.duration + 'm', 'Time', true], ['users', race.teamCount, 'Teams', true]].map((s, i) => (
              <div key={i} onClick={s[3] ? () => go({ name: 'orgDetails' }) : undefined}
                style={{ ...cardMini, cursor: s[3] ? 'pointer' : 'default', position: 'relative', outline: s[3] ? '1.5px dashed var(--qf-line)' : 'none' }}>
                <Stat icon={s[0]} value={s[1]} label={s[2]} tint="var(--qf-primary)" />
                {s[3] && <Icon name="edit" size={11} stroke={2.4} style={{ position: 'absolute', top: 6, right: 6, color: 'var(--qf-muted)' }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 2px 10px' }}>
            <span style={sectionLabel}>Route order</span>
            <span style={{ fontFamily: 'var(--qf-body)', fontSize: 12, color: 'var(--qf-muted)' }}>tap a stop to edit</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
            {race.stops.map((st, i) => (
              <div key={st.id} style={{ display: 'flex', alignItems: 'stretch', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                  <button onClick={() => moveStop(i, -1)} disabled={i === 0} style={{ ...reorderBtn, opacity: i === 0 ? 0.3 : 1 }}><Icon name="chevronL" size={14} stroke={3} style={{ transform: 'rotate(90deg)' }} /></button>
                  <button onClick={() => moveStop(i, 1)} disabled={i === race.stops.length - 1} style={{ ...reorderBtn, opacity: i === race.stops.length - 1 ? 0.3 : 1 }}><Icon name="chevronL" size={14} stroke={3} style={{ transform: 'rotate(-90deg)' }} /></button>
                </div>
                <button onClick={() => go({ name: 'orgStop', stopId: st.id })} style={stopCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={routeNum(i, race.stops.length)}>
                      {i === 0 ? <Icon name="flag" size={16} stroke={2.4} /> : i === race.stops.length - 1 ? <Icon name="trophy" size={16} stroke={2.2} /> : i}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16, color: 'var(--qf-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.name}</div>
                      <div style={{ fontFamily: 'var(--qf-body)', fontSize: 12.5, color: 'var(--qf-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.hint}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteStop(st.id); }} style={{ ...reorderBtn, width: 30, height: 30, color: '#E0564B', background: 'color-mix(in srgb, #E0564B 12%, transparent)', border: 'none' }}>
                      <Icon name="close" size={14} stroke={2.6} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                    {st.activities.length === 0
                      ? <span style={{ fontFamily: 'var(--qf-body)', fontSize: 12, color: 'var(--qf-muted)', fontStyle: 'italic' }}>No activities yet — tap to add</span>
                      : st.activities.map((a, k) => <ActivityTag key={k} type={a.type} />)}
                  </div>
                </button>
              </div>
            ))}
          </div>

          <button onClick={addStop} style={addStopBtn}>
            <Icon name="plus" size={19} stroke={2.6} /> Add another stop
          </button>
        </div>
      </ScreenScroll>
      <FooterBar blur>
        <Btn full variant="primary" icon="sparkle" onClick={() => go({ name: 'orgPublish' })}>Review &amp; publish</Btn>
      </FooterBar>
    </>
  );
}

export function OrgDetails({ race, setRace, back, t }) {
  return (
    <>
      <TopBar sub={qfWord(t, 'Quest') + ' builder'} title={qfWord(t, 'Quest') + ' details'} onBack={back} />
      <ScreenScroll>
        <div style={{ padding: '0 18px 8px' }}>
          <Field label="Name">
            <input style={inputStyle} value={race.name} onChange={e => setRace({ ...race, name: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <input style={inputStyle} value={race.tagline} onChange={e => setRace({ ...race, tagline: e.target.value })} />
          </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Time limit (min)">
              <NumericInput style={inputStyle} value={race.duration} onChange={v => setRace({ ...race, duration: v })} />
            </Field>
            <Field label="Teams">
              <NumericInput style={inputStyle} value={race.teamCount} onChange={v => setRace({ ...race, teamCount: v })} />
            </Field>
          </div>
        </div>
      </ScreenScroll>
      <FooterBar>
        <Btn full variant="primary" onClick={back}>Save</Btn>
      </FooterBar>
    </>
  );
}

export function OrgStop({ race, setRace, go, back, t, mapStyle, stopId }) {
  const stop = race.stops.find(s => s.id === stopId);
  const idx = race.stops.findIndex(s => s.id === stopId);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | locating | denied | error
  const [coordStr, setCoordStr] = useState('');
  const [coordError, setCoordError] = useState('');
  if (!stop) return null;
  const update = (patch) => setRace({ ...race, stops: race.stops.map(s => s.id === stopId ? { ...s, ...patch } : s) });
  const delActivity = (k) => update({ activities: stop.activities.filter((_, i) => i !== k) });
  const delStop = () => { setRace({ ...race, stops: race.stops.filter(s => s.id !== stopId) }); back(); };

  function captureGPS() {
    if (!navigator.geolocation) { setGpsStatus('error'); return; }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => { update({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus('idle'); },
      err => { setGpsStatus(err.code === 1 ? 'denied' : 'error'); setTimeout(() => setGpsStatus('idle'), 3000); },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function applyCoords() {
    const parts = coordStr.split(',').map(s => s.trim());
    if (parts.length !== 2) { setCoordError('Enter as: lat, lng'); return; }
    const lat = parseFloat(parts[0]), lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCoordError('Invalid coordinates'); return;
    }
    update({ lat, lng });
    setCoordStr('');
    setCoordError('');
  }

  return (
    <>
      <TopBar sub={`Stop ${idx + 1} of ${race.stops.length}`} title={stop.name} onBack={back}
        action={<button onClick={delStop} style={{ ...iconBtn, color: '#E0564B' }}><Icon name="close" size={18} stroke={2.5} /></button>} />
      <ScreenScroll>
        <div style={{ padding: '0 18px 8px' }}>
          <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid var(--qf-line)', marginBottom: 16 }}>
            <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="build" height={150} selectedId={stopId} />
          </div>
          <Field label="Stop name"><input style={inputStyle} value={stop.name} onChange={e => update({ name: e.target.value })} /></Field>
          <Field label="Location hint" hint="Players see this as their clue to find the spot">
            <input style={inputStyle} value={stop.hint} onChange={e => update({ hint: e.target.value })} />
          </Field>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 13, color: 'var(--qf-ink)', marginBottom: 7 }}>GPS check-in point</div>
            {stop.lat != null ? (
              <div style={{ padding: '12px 14px', borderRadius: 14, background: 'color-mix(in srgb, var(--qf-secondary) 10%, var(--qf-surface))', border: '1px solid color-mix(in srgb, var(--qf-secondary) 35%, var(--qf-line))', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="pin" size={18} stroke={2.3} style={{ color: 'var(--qf-secondary)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 13, color: 'var(--qf-ink)' }}>Location saved</div>
                  <div style={{ fontFamily: 'var(--qf-body)', fontSize: 11.5, color: 'var(--qf-muted)', marginTop: 2 }}>{stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}</div>
                </div>
                <button onClick={() => update({ lat: undefined, lng: undefined })} style={{ ...iconBtn, width: 30, height: 30, boxShadow: 'none', background: 'transparent', color: 'var(--qf-muted)' }}>
                  <Icon name="close" size={14} stroke={2.3} />
                </button>
              </div>
            ) : (
              <>
                <button onClick={captureGPS} disabled={gpsStatus === 'locating'} style={{ ...addStopBtn, marginTop: 0, opacity: gpsStatus === 'locating' ? 0.6 : 1 }}>
                  <Icon name="pin" size={17} stroke={2.3} />
                  {gpsStatus === 'locating' ? 'Getting location…' : 'Capture GPS — stand at this stop'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--qf-line)' }} />
                  <span style={{ fontFamily: 'var(--qf-body)', fontSize: 12, color: 'var(--qf-muted)', fontWeight: 600 }}>or paste from Google Maps</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--qf-line)' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={coordStr}
                    onChange={e => { setCoordStr(e.target.value); setCoordError(''); }}
                    placeholder="1.35210, 103.81980"
                  />
                  <button onClick={applyCoords} style={{ ...iconBtn, flexShrink: 0, background: 'var(--qf-primary)', color: 'var(--qf-primary-ink)', boxShadow: '0 4px 12px -6px var(--qf-primary)' }}>
                    <Icon name="check" size={18} stroke={2.6} />
                  </button>
                </div>
                {coordError && <div style={{ marginTop: 6, fontFamily: 'var(--qf-body)', fontSize: 12.5, color: '#E0564B' }}>{coordError}</div>}
              </>
            )}
            {gpsStatus === 'denied' && <div style={{ marginTop: 8, fontFamily: 'var(--qf-body)', fontSize: 12.5, color: '#E0564B' }}>Location access denied — enable it in browser settings.</div>}
            {gpsStatus === 'error' && <div style={{ marginTop: 8, fontFamily: 'var(--qf-body)', fontSize: 12.5, color: '#E0564B' }}>Geolocation not available on this device.</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 2px 12px' }}>
            <span style={sectionLabel}>Activities</span>
            <span style={{ fontFamily: 'var(--qf-body)', fontSize: 12, color: 'var(--qf-muted)' }}>{stop.activities.reduce((a, x) => a + x.points, 0)} pts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stop.activities.map((a, k) => {
              const m = ACTIVITY_META[a.type];
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: 'var(--qf-surface)', boxShadow: '0 4px 14px -10px var(--qf-shadow)', border: '1px solid var(--qf-line)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `color-mix(in srgb, ${m.tint} 16%, transparent)`, color: m.tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={m.icon} size={22} stroke={2.3} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, color: 'var(--qf-ink)' }}>{m.label} <span style={{ color: 'var(--qf-muted)', fontWeight: 500, fontSize: 13 }}>· {a.points} pts</span></div>
                    <div style={{ fontFamily: 'var(--qf-body)', fontSize: 12.5, color: 'var(--qf-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{actSummary(a)}</div>
                  </div>
                  <button onClick={() => delActivity(k)} style={{ ...iconBtn, width: 32, height: 32, boxShadow: 'none', background: 'transparent', color: 'var(--qf-muted)' }}>
                    <Icon name="close" size={16} stroke={2.4} />
                  </button>
                </div>
              );
            })}
          </div>

          <button onClick={() => go({ name: 'orgAdd', stopId })} style={{ ...addStopBtn, marginTop: 12 }}>
            <Icon name="plus" size={19} stroke={2.6} /> Add an activity
          </button>
        </div>
      </ScreenScroll>
      <FooterBar><Btn full variant="dark" onClick={back}>Done editing stop</Btn></FooterBar>
    </>
  );
}

export function OrgAddActivity({ race, setRace, back, stopId, t }) {
  const [type, setType] = useState(null);
  const [cfg, setCfg] = useState({ points: 100, options: ['', '', '', ''], correctIndex: 0 });
  const stop = race.stops.find(s => s.id === stopId);

  function commit() {
    let a = { type, points: cfg.points };
    if (type === 'gps') a.points = cfg.points || 50;
    if (type === 'photo') a.prompt = cfg.prompt || 'Snap a creative team photo here';
    if (type === 'quiz') { a.question = cfg.question || 'Your question'; a.answer = cfg.answer || ''; }
    if (type === 'choice') { a.question = cfg.question || 'Your question'; a.options = cfg.options.filter(Boolean); a.correctIndex = cfg.correctIndex; }
    if (type === 'riddle') { a.riddle = cfg.riddle || 'Your riddle'; a.answer = cfg.answer || ''; }
    setRace({ ...race, stops: race.stops.map(s => s.id === stopId ? { ...s, activities: [...s.activities, a] } : s) });
    back();
  }
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  return (
    <>
      <TopBar sub={stop ? stop.name : ''} title="Add activity" onBack={back} />
      <ScreenScroll>
        <div style={{ padding: '0 18px 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.entries(ACTIVITY_META).map(([key, m]) => {
              const on = type === key;
              return (
                <button key={key} onClick={() => setType(key)} style={{
                  textAlign: 'left', padding: 14, borderRadius: 16, cursor: 'pointer',
                  border: on ? `2px solid ${m.tint}` : '2px solid var(--qf-line)',
                  background: on ? `color-mix(in srgb, ${m.tint} 10%, var(--qf-surface))` : 'var(--qf-surface)',
                  WebkitTapHighlightColor: 'transparent', transition: 'border .15s, background .15s',
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: `color-mix(in srgb, ${m.tint} 16%, transparent)`, color: m.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>
                    <Icon name={m.icon} size={21} stroke={2.3} />
                  </div>
                  <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, color: 'var(--qf-ink)' }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--qf-body)', fontSize: 12, color: 'var(--qf-muted)' }}>{m.blurb}</div>
                </button>
              );
            })}
          </div>

          {type && (
            <div style={{ marginTop: 20, animation: 'qfFadeUp .25s ease' }}>
              <span style={sectionLabel}>Configure</span>
              <div style={{ height: 12 }} />
              {type === 'photo' && <Field label="Photo prompt"><textarea style={{ ...inputStyle, minHeight: 76, resize: 'none' }} value={cfg.prompt || ''} onChange={e => set('prompt', e.target.value)} placeholder="e.g. Whole team in a superhero pose by the mural" /></Field>}
              {type === 'quiz' && <>
                <Field label="Question"><input style={inputStyle} value={cfg.question || ''} onChange={e => set('question', e.target.value)} placeholder="What does the plaque say the year is?" /></Field>
                <Field label="Correct answer"><input style={inputStyle} value={cfg.answer || ''} onChange={e => set('answer', e.target.value)} placeholder="1898" /></Field>
              </>}
              {type === 'riddle' && <>
                <Field label="Riddle"><textarea style={{ ...inputStyle, minHeight: 76, resize: 'none' }} value={cfg.riddle || ''} onChange={e => set('riddle', e.target.value)} placeholder="I have hands but cannot clap…" /></Field>
                <Field label="Answer"><input style={inputStyle} value={cfg.answer || ''} onChange={e => set('answer', e.target.value)} placeholder="a clock" /></Field>
              </>}
              {type === 'choice' && <>
                <Field label="Question"><input style={inputStyle} value={cfg.question || ''} onChange={e => set('question', e.target.value)} placeholder="Which stall is the oldest?" /></Field>
                <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 13, marginBottom: 7 }}>Options <span style={{ color: 'var(--qf-muted)', fontWeight: 500 }}>· tap the circle to mark correct</span></div>
                {cfg.options.map((o, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
                    <button onClick={() => set('correctIndex', i)} style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, border: cfg.correctIndex === i ? 'none' : '2px solid var(--qf-line)', background: cfg.correctIndex === i ? 'var(--qf-secondary)' : 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      {cfg.correctIndex === i && <Icon name="check" size={15} stroke={3} />}
                    </button>
                    <input style={inputStyle} value={o} onChange={e => { const arr = [...cfg.options]; arr[i] = e.target.value; set('options', arr); }} placeholder={`Option ${i + 1}`} />
                  </div>
                ))}
              </>}
              {type === 'gps' && <div style={{ padding: 14, borderRadius: 14, background: 'var(--qf-surface-2)', fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-muted)', marginBottom: 14 }}>Players must physically reach this spot. We'll auto-detect arrival within a 30m radius to unlock the stop.</div>}

              <Field label="Points">
                <div style={{ display: 'flex', gap: 8 }}>
                  {[50, 100, 150, 200].map(p => (
                    <Chip key={p} active={cfg.points === p} onClick={() => set('points', p)} tint="var(--qf-primary)" style={{ flex: 1, justifyContent: 'center', padding: '11px 0' }}>{p}</Chip>
                  ))}
                </div>
              </Field>
            </div>
          )}
        </div>
      </ScreenScroll>
      <FooterBar><Btn full disabled={!type} variant="primary" icon="plus" onClick={commit}>Add to stop</Btn></FooterBar>
    </>
  );
}

export function OrgPublish({ race, go, back, t, mapStyle }) {
  const [copied, setCopied] = useState(false);
  const [showTeams, setShowTeams] = useState(false);
  const [teamNames, setTeamNames] = useState(['Team 1', 'Team 2', 'Team 3']);
  const code = 'QF-' + (race.name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'RUN') + '-42';

  function shareLink() {
    const text = `Join our ${t.questWord}: ${race.name}\nCode: ${code}`;
    if (navigator.share) {
      navigator.share({ title: race.name, text });
    } else {
      navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  }
  return (
    <>
      <TopBar sub="Ready to launch" title={'Publish ' + qfWord(t, 'quest')} onBack={back} />
      <ScreenScroll>
        <div style={{ padding: '0 18px 8px' }}>
          <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--qf-line)', boxShadow: '0 10px 26px -12px var(--qf-shadow)' }}>
            <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="build" height={200} />
          </div>
          <div style={{ marginTop: 16, fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 24, color: 'var(--qf-ink)', lineHeight: 1.1 }}>{race.name}</div>
          <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14, color: 'var(--qf-muted)', marginTop: 4 }}>{race.tagline}</div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[['pin', race.stops.length, 'Stops'], ['star', totalPoints(race), 'Points'], ['clock', race.duration + 'm', 'Time'], ['users', race.teamCount, 'Teams']].map((s, i) => (
              <div key={i} style={cardMini}><Stat icon={s[0]} value={s[1]} label={s[2]} tint="var(--qf-primary)" /></div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 18, borderRadius: 20, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)', boxShadow: '0 6px 18px -12px var(--qf-shadow)' }}>
            <span style={sectionLabel}>Invite your teams</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
              <div style={{ width: 76, height: 76, borderRadius: 14, background: 'var(--qf-ink)', color: 'var(--qf-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="qr" size={42} stroke={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--qf-body)', fontSize: 12, color: 'var(--qf-muted)', fontWeight: 600 }}>JOIN CODE</div>
                <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 26, letterSpacing: 1, color: 'var(--qf-primary)' }}>{code}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Btn size="sm" variant="soft" icon="share" onClick={shareLink}>{copied ? 'Copied!' : 'Share link'}</Btn>
                  <Btn size="sm" variant="soft" icon="users" onClick={() => setShowTeams(true)}>Add teams</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScreenScroll>
      <FooterBar blur>
        <Btn variant="soft" onClick={back} style={{ flex: '0 0 auto' }} icon="edit"> </Btn>
        <Btn full variant="primary" icon="play" onClick={() => go({ name: 'orgDash' })}>Launch quest</Btn>
      </FooterBar>

      <Sheet open={showTeams} onClose={() => setShowTeams(false)}>
        <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 19, marginBottom: 14 }}>Teams</div>
        {teamNames.map((name, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input style={{ ...inputStyle, flex: 1 }} value={name}
              onChange={e => { const a = [...teamNames]; a[i] = e.target.value; setTeamNames(a); }}
              placeholder={`Team ${i + 1}`} />
            <button onClick={() => setTeamNames(teamNames.filter((_, j) => j !== i))}
              style={{ ...iconBtn, color: '#E0564B', background: 'color-mix(in srgb, #E0564B 10%, transparent)', boxShadow: 'none' }}>
              <Icon name="close" size={16} stroke={2.4} />
            </button>
          </div>
        ))}
        <button onClick={() => setTeamNames([...teamNames, `Team ${teamNames.length + 1}`])}
          style={{ ...addStopBtn, marginTop: 4, marginBottom: 14 }}>
          <Icon name="plus" size={17} stroke={2.6} /> Add team
        </button>
        <Btn full onClick={() => setShowTeams(false)}>Done</Btn>
      </Sheet>
    </>
  );
}

const TEAM_COLORS = ['#E85D3A', '#1FA85A', '#8B5CF6', '#F59E0B', '#3B82F6'];
const TEAM_PACE = [1.0, 0.82, 0.91, 0.68, 0.95];

export function OrgDashboard({ race, go, back, mapStyle }) {
  const [tick, setTick] = useState(0);
  const total = race.stops.length;
  const teamNames = ['The Trailblazers', 'Summit Squad', 'Pathfinders', 'North Stars', 'Compass Crew'];

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const teams = teamNames.map((name, i) => {
    const progress = Math.min(total, Math.floor(tick * TEAM_PACE[i] * 0.18));
    const pts = race.stops.slice(0, progress).reduce((s, st) => s + totalPoints({ stops: [st] }), 0);
    return { name, color: TEAM_COLORS[i], progress, pts };
  }).sort((a, b) => b.pts - a.pts || b.progress - a.progress);

  return (
    <>
      <TopBar onBack={back} title={race.name}
        action={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 99, background: 'color-mix(in srgb, var(--qf-secondary) 16%, transparent)', color: 'var(--qf-secondary)', fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--qf-secondary)', animation: 'qfBlink 1.2s ease infinite' }} /> LIVE
        </span>} />
      <ScreenScroll>
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid var(--qf-line)', marginBottom: 16 }}>
            <AdventureMap stops={race.stops} mapStyle={mapStyle} mode="build" height={200} />
          </div>

          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16, color: 'var(--qf-ink)', marginBottom: 10 }}>Live standings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {teams.map((tm, i) => (
              <div key={tm.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 16, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: tm.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, color: 'var(--qf-ink)' }}>{tm.name}</div>
                  <div style={{ marginTop: 5 }}>
                    <Progress showDots dots={total} doneDots={tm.progress} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16, color: 'var(--qf-primary)' }}>{tm.pts}</div>
                  <div style={{ fontFamily: 'var(--qf-body)', fontSize: 11, color: 'var(--qf-muted)' }}>pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScreenScroll>
      <FooterBar>
        <Btn full variant="dark" onClick={() => go({ name: 'home' })}>End quest</Btn>
      </FooterBar>
    </>
  );
}

const iconBtn = { width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--qf-surface)', color: 'var(--qf-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px var(--qf-shadow)', WebkitTapHighlightColor: 'transparent' };
const sectionLabel = { fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 16, color: 'var(--qf-ink)' };
const cardMini = { flex: 1, padding: '12px 4px', borderRadius: 16, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)', boxShadow: '0 4px 14px -12px var(--qf-shadow)' };
const stopCard = { flex: 1, minWidth: 0, textAlign: 'left', padding: 14, borderRadius: 18, background: 'var(--qf-surface)', border: '1px solid var(--qf-line)', cursor: 'pointer', boxShadow: '0 5px 16px -12px var(--qf-shadow)', WebkitTapHighlightColor: 'transparent' };
const reorderBtn = { width: 26, height: 24, borderRadius: 8, border: 'none', background: 'var(--qf-surface-2)', color: 'var(--qf-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' };
const routeNum = (i, n) => ({ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 17, color: '#fff', background: i === 0 ? 'var(--qf-secondary)' : i === n - 1 ? 'var(--qf-accent)' : 'var(--qf-primary)' });
const addStopBtn = { width: '100%', padding: '14px', borderRadius: 16, border: '2px dashed var(--qf-line)', background: 'transparent', color: 'var(--qf-primary)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, WebkitTapHighlightColor: 'transparent' };
