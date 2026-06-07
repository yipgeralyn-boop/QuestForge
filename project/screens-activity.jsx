// screens-activity.jsx — QuestForge activity engine (the heart of play)
// Exports to window: PlayActivity

(function () {
  const { useState, useEffect, useRef } = React;
  const { Icon, Btn, TopBar, ScreenScroll, FooterBar, ACTIVITY_META } = window;

  const norm = (s) => (s || '').trim().toLowerCase().replace(/^(a|an|the)\s+/, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');

  // Shared header showing which activity of the stop we're on
  function ActHeader({ stop, idx, total, onBack, m }) {
    return (
      <TopBar sub={stop.name} title={m.label} onBack={onBack}
        action={total > 1 ? <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5, color: 'var(--qf-muted)', padding: '6px 11px', borderRadius: 99, background: 'var(--qf-surface-2)' }}>{idx + 1}/{total}</div> : null} />
    );
  }

  // ── GPS check-in ─────────────────────────────────────────────
  function GpsActivity({ onDone, points }) {
    const [phase, setPhase] = useState('locating'); // locating -> found
    useEffect(() => { const tm = setTimeout(() => setPhase('found'), 1900); return () => clearTimeout(tm); }, []);
    return (
      <ScreenScroll>
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 200, height: 200, margin: '18px 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--qf-secondary)', opacity: 0, animation: `qfRadar 2.4s ${i * 0.8}s ease-out infinite` }} />
            ))}
            <div style={{ width: 92, height: 92, borderRadius: '50%', background: phase === 'found' ? 'var(--qf-secondary)' : 'var(--qf-surface)', color: phase === 'found' ? '#fff' : 'var(--qf-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 26px -10px var(--qf-shadow)', border: '1px solid var(--qf-line)', transition: 'all .4s' }}>
              <Icon name={phase === 'found' ? 'check' : 'pin'} size={44} stroke={2.4} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 23, color: 'var(--qf-ink)', marginTop: 14 }}>{phase === 'found' ? 'You made it!' : 'Locating you…'}</div>
          <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14.5, color: 'var(--qf-muted)', maxWidth: 260, marginTop: 6 }}>{phase === 'found' ? "You're within range of the stop. Check in to claim your points." : 'Hold tight while we lock onto your GPS signal…'}</div>
        </div>
        <FooterBar><Btn full variant="secondaryx" style={{ background: 'var(--qf-secondary)', color: '#fff', opacity: phase === 'found' ? 1 : 0.5 }} disabled={phase !== 'found'} icon="check" onClick={() => onDone(points, true)}>Check in &middot; +{points}</Btn></FooterBar>
      </ScreenScroll>
    );
  }

  // ── Photo challenge ──────────────────────────────────────────
  function PhotoActivity({ stop, prompt, points, onDone }) {
    const [phase, setPhase] = useState('aim'); // aim -> flash -> review
    const slotId = 'qf-photo-' + stop.id;
    function shoot() {
      setPhase('flash');
      setTimeout(() => setPhase('review'), 320);
    }
    return (
      <ScreenScroll style={{ background: phase === 'review' ? 'var(--qf-bg)' : '#0e0e14' }}>
        {phase !== 'review' ? (
          <div style={{ padding: '6px 18px 18px' }}>
            <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', aspectRatio: '3/4', background: 'linear-gradient(160deg,#2b3550,#46506e 55%,#6d7796)' }}>
              {/* faux scene */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 120%, rgba(255,210,120,.35), transparent 60%)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', background: 'linear-gradient(#5a4a39,#3c2f24)' }} />
              {/* viewfinder grid */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px)', backgroundSize: '33.33% 33.33%' }} />
              {/* corners */}
              {[['8px', '8px', '0 0'], ['8px', 'auto', '0 90'], ['auto', '8px', '90 0'], ['auto', 'auto', '90 90']].map((c, i) => (
                <div key={i} style={{ position: 'absolute', top: c[0] === '8px' ? 14 : 'auto', bottom: c[0] === 'auto' ? 14 : 'auto', left: c[1] === '8px' ? 14 : 'auto', right: c[1] === 'auto' ? 14 : 'auto', width: 26, height: 26, borderTop: c[2][0] === '0' ? '3px solid #fff' : 'none', borderBottom: c[2][0] === '9' ? '3px solid #fff' : 'none', borderLeft: c[2][2] === '0' ? '3px solid #fff' : 'none', borderRight: c[2][2] === '9' ? '3px solid #fff' : 'none', borderRadius: 4, opacity: 0.85 }} />
              ))}
              <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 99, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5C5C' }} /> CHALLENGE
              </div>
              {phase === 'flash' && <div style={{ position: 'absolute', inset: 0, background: '#fff', animation: 'qfFlash .32s ease' }} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ color: 'var(--qf-accent)', flexShrink: 0 }}><Icon name="camera" size={20} stroke={2.3} /></div>
              <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14.5, color: '#fff', lineHeight: 1.4 }}>{prompt}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
              <button onClick={shoot} aria-label="Take photo" style={{ width: 76, height: 76, borderRadius: '50%', border: '5px solid rgba(255,255,255,0.85)', background: 'var(--qf-primary)', cursor: 'pointer', boxShadow: '0 0 0 4px rgba(255,255,255,0.15)', WebkitTapHighlightColor: 'transparent' }} />
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--qf-body)', fontSize: 12.5, marginTop: 12 }}>Tap the shutter to capture</div>
          </div>
        ) : (
          <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 22, color: 'var(--qf-ink)', alignSelf: 'flex-start', marginBottom: 4 }}>Nice shot!</div>
            <div style={{ fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-muted)', alignSelf: 'flex-start', marginBottom: 16 }}>Drop your real team photo on the frame, or keep this one.</div>
            <div style={{ background: '#fff', padding: '12px 12px 46px', borderRadius: 6, boxShadow: '0 14px 30px -12px rgba(0,0,0,0.35)', transform: 'rotate(-2deg)', position: 'relative' }}
              dangerouslySetInnerHTML={{ __html: `<image-slot id="${slotId}" style="display:block;width:240px;height:240px" shape="rect" placeholder="Drop your photo"></image-slot>` }} />
            <div style={{ marginTop: 28, width: '100%' }}>
              <Btn full variant="primary" icon="check" onClick={() => onDone(points, true)}>Use this photo &middot; +{points}</Btn>
              <button onClick={() => setPhase('aim')} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 14, border: 'none', background: 'transparent', color: 'var(--qf-muted)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Retake</button>
            </div>
          </div>
        )}
      </ScreenScroll>
    );
  }

  // ── Text answer (quiz / riddle) ──────────────────────────────
  function TextActivity({ kind, question, answer, points, onDone }) {
    const [val, setVal] = useState('');
    const [tries, setTries] = useState(0);
    const [state, setState] = useState('idle'); // idle | wrong | right
    const ref = useRef(null);
    function submit() {
      if (!val.trim()) return;
      if (norm(val) === norm(answer) || (answer && norm(val).includes(norm(answer)) && norm(answer).length > 2)) {
        setState('right'); setTimeout(() => onDone(points, true, tries === 0), 850);
      } else {
        setState('wrong'); setTries(t => t + 1);
        if (ref.current) { ref.current.style.animation = 'none'; void ref.current.offsetWidth; ref.current.style.animation = 'qfShake .4s'; }
      }
    }
    return (
      <ScreenScroll>
        <div style={{ padding: '8px 22px 18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 99, whiteSpace: 'nowrap', background: 'color-mix(in srgb, ' + ACTIVITY_META[kind].tint + ' 16%, transparent)', color: ACTIVITY_META[kind].tint, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5 }}>
            <Icon name={ACTIVITY_META[kind].icon} size={15} stroke={2.4} /> {kind === 'riddle' ? 'Riddle me this' : 'Quiz question'}
          </div>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 25, lineHeight: 1.2, color: 'var(--qf-ink)', margin: '16px 0 22px', textWrap: 'pretty', fontStyle: kind === 'riddle' ? 'italic' : 'normal' }}>{question}</div>
          <div ref={ref}>
            <input autoFocus value={val} disabled={state === 'right'} onChange={e => { setVal(e.target.value); if (state === 'wrong') setState('idle'); }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Type your answer…"
              style={{ width: '100%', boxSizing: 'border-box', padding: '16px 16px', borderRadius: 16, fontFamily: 'var(--qf-body)', fontSize: 17, outline: 'none', WebkitAppearance: 'none', color: 'var(--qf-ink)', background: 'var(--qf-surface)', border: '2px solid ' + (state === 'right' ? 'var(--qf-secondary)' : state === 'wrong' ? '#E0564B' : 'var(--qf-line)'), transition: 'border .15s' }} />
          </div>
          {state === 'wrong' && <div style={{ marginTop: 12, color: '#E0564B', fontFamily: 'var(--qf-body)', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="close" size={15} stroke={2.6} /> Not quite — give it another go!</div>}
          {state === 'right' && <div style={{ marginTop: 12, color: 'var(--qf-secondary)', fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={16} stroke={2.8} /> Correct!{tries === 0 ? ' First try — nice!' : ''}</div>}
          {tries >= 2 && state !== 'right' && <button onClick={() => alert('Hint: the answer is “' + answer + '”')} style={{ marginTop: 16, padding: '9px 14px', borderRadius: 12, border: '1.5px solid var(--qf-line)', background: 'transparent', color: 'var(--qf-muted)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name="sparkle" size={15} stroke={2.2} /> Need a hint?</button>}
        </div>
        <FooterBar><Btn full variant="primary" disabled={state === 'right'} onClick={submit}>Submit answer</Btn></FooterBar>
      </ScreenScroll>
    );
  }

  // ── Multiple choice ──────────────────────────────────────────
  function ChoiceActivity({ question, options, correctIndex, points, onDone }) {
    const [picked, setPicked] = useState(null);
    const [locked, setLocked] = useState(false);
    function choose(i) {
      if (locked) return;
      setPicked(i);
      if (i === correctIndex) { setLocked(true); setTimeout(() => onDone(points, true), 900); }
      else { setTimeout(() => setPicked(null), 700); }
    }
    return (
      <ScreenScroll>
        <div style={{ padding: '8px 22px 18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 99, whiteSpace: 'nowrap', background: 'color-mix(in srgb, ' + ACTIVITY_META.choice.tint + ' 16%, transparent)', color: ACTIVITY_META.choice.tint, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5 }}>
            <Icon name="choice" size={15} stroke={2.4} /> Multiple choice
          </div>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 25, lineHeight: 1.2, color: 'var(--qf-ink)', margin: '16px 0 20px', textWrap: 'pretty' }}>{question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {options.map((o, i) => {
              const isPicked = picked === i;
              const right = locked && i === correctIndex;
              const wrong = isPicked && i !== correctIndex;
              let border = 'var(--qf-line)', bg = 'var(--qf-surface)', col = 'var(--qf-ink)';
              if (right) { border = 'var(--qf-secondary)'; bg = 'color-mix(in srgb, var(--qf-secondary) 12%, var(--qf-surface))'; }
              else if (wrong) { border = '#E0564B'; bg = 'color-mix(in srgb, #E0564B 10%, var(--qf-surface))'; }
              return (
                <button key={i} onClick={() => choose(i)} style={{ display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', padding: '15px 16px', borderRadius: 16, cursor: 'pointer', background: bg, border: '2px solid ' + border, transition: 'all .15s', WebkitTapHighlightColor: 'transparent', animation: wrong ? 'qfShake .4s' : 'none' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 14, background: right ? 'var(--qf-secondary)' : wrong ? '#E0564B' : 'var(--qf-surface-2)', color: (right || wrong) ? '#fff' : 'var(--qf-muted)' }}>{right ? <Icon name="check" size={16} stroke={3} /> : wrong ? <Icon name="close" size={15} stroke={3} /> : String.fromCharCode(65 + i)}</div>
                  <span style={{ fontFamily: 'var(--qf-body)', fontWeight: 600, fontSize: 15.5, color: col }}>{o}</span>
                </button>
              );
            })}
          </div>
        </div>
      </ScreenScroll>
    );
  }

  // ── Orchestrator: runs each activity of the stop in turn ─────
  function PlayActivity({ stop, onStopDone, onBack }) {
    const [i, setI] = useState(0);
    const earned = useRef(0);
    const acts = stop.activities;
    const a = acts[i];
    const m = ACTIVITY_META[a.type];

    function next(points, ok, firstTry) {
      earned.current += (points || 0);
      if (i + 1 < acts.length) setI(i + 1);
      else onStopDone(earned.current);
    }

    return (
      <>
        <ActHeader stop={stop} idx={i} total={acts.length} onBack={onBack} m={m} />
        {a.type === 'gps' && <GpsActivity key={i} points={a.points} onDone={next} />}
        {a.type === 'photo' && <PhotoActivity key={i} stop={stop} prompt={a.prompt} points={a.points} onDone={next} />}
        {a.type === 'quiz' && <TextActivity key={i} kind="quiz" question={a.question} answer={a.answer} points={a.points} onDone={next} />}
        {a.type === 'riddle' && <TextActivity key={i} kind="riddle" question={a.riddle} answer={a.answer} points={a.points} onDone={next} />}
        {a.type === 'choice' && <ChoiceActivity key={i} question={a.question} options={a.options} correctIndex={a.correctIndex} points={a.points} onDone={next} />}
      </>
    );
  }

  window.PlayActivity = PlayActivity;
})();
