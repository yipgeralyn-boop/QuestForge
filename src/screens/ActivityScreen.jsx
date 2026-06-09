import { useState, useRef } from 'react';
import { Icon, ACTIVITY_META } from '../data.jsx';
import { Btn, TopBar, ScreenScroll, FooterBar } from '../components/UI.jsx';

const norm = (s) => (s || '').trim().toLowerCase().replace(/^(a|an|the)\s+/, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');

function ActHeader({ stop, idx, total, onBack, m }) {
  return (
    <TopBar sub={stop.name} title={m.label} onBack={onBack}
      action={total > 1 ? <div style={{ fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5, color: 'var(--qf-muted)', padding: '6px 11px', borderRadius: 99, background: 'var(--qf-surface-2)' }}>{idx + 1}/{total}</div> : null} />
  );
}

function PhotoActivity({ stop, prompt, points, onDone, onSubmit, onBackToMap }) {
  const [phase, setPhase] = useState('aim'); // aim | review | submitted
  const [photoUrl, setPhotoUrl] = useState(null);
  const [inputKey, setInputKey] = useState(0);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setPhotoUrl(ev.target.result); setPhase('review'); };
    reader.readAsDataURL(file);
    setInputKey(k => k + 1);
  }

  function submit() {
    onSubmit({ stopId: stop.id, stopName: stop.name, prompt, points, photoUrl });
    setPhase('submitted');
  }

  // iOS fix: input embedded inside label (not htmlFor), positioned off-screen (not display:none),
  // and re-keyed after each capture so it's a fresh DOM element next time
  const CameraInput = () => (
    <input key={inputKey} type="file" accept="image/*" capture="environment"
      style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, width: 1, height: 1 }}
      onChange={handleFile} />
  );

  if (phase === 'submitted') {
    return (
      <ScreenScroll>
        <div style={{ padding: '48px 28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'color-mix(in srgb, var(--qf-accent) 16%, var(--qf-surface))', color: 'var(--qf-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <Icon name="clock" size={38} stroke={2} />
          </div>
          <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 22, color: 'var(--qf-ink)' }}>Photo sent!</div>
          <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14.5, color: 'var(--qf-muted)', marginTop: 8, maxWidth: 260, lineHeight: 1.5 }}>
            Waiting for the organiser to approve. Keep going — tackle other stops while you wait.
          </div>
        </div>
        <FooterBar>
          <Btn full variant="primary" iconRight="arrow" onClick={onBackToMap}>Continue to other stops</Btn>
        </FooterBar>
      </ScreenScroll>
    );
  }

  if (phase === 'aim') {
    return (
      <ScreenScroll style={{ background: '#0e0e14' }}>
        <label style={{ display: 'block', cursor: 'pointer', position: 'relative' }}>
          <CameraInput />
          <div style={{ padding: '6px 18px 0' }}>
            <div style={{ position: 'relative', borderRadius: 22, overflow: 'hidden', aspectRatio: '3/4', background: 'linear-gradient(160deg,#2b3550,#46506e 55%,#6d7796)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 120%, rgba(255,210,120,.35), transparent 60%)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '38%', background: 'linear-gradient(#5a4a39,#3c2f24)' }} />
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.18) 1px,transparent 1px)', backgroundSize: '33.33% 33.33%' }} />
              {[['tl','8px','8px'],['tr','8px',null],['bl',null,'8px'],['br',null,null]].map(([k,t,l]) => (
                <div key={k} style={{ position: 'absolute', top: t ? 14 : 'auto', bottom: !t ? 14 : 'auto', left: l ? 14 : 'auto', right: !l ? 14 : 'auto', width: 26, height: 26, borderTop: t ? '3px solid #fff' : 'none', borderBottom: !t ? '3px solid #fff' : 'none', borderLeft: l ? '3px solid #fff' : 'none', borderRight: !l ? '3px solid #fff' : 'none', borderRadius: 4, opacity: 0.85 }} />
              ))}
              <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 99, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5C5C' }} /> CHALLENGE
              </div>
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--qf-body)', fontSize: 13 }}>
                <Icon name="camera" size={40} stroke={1.5} style={{ margin: '0 auto 8px', display: 'block', color: 'rgba(255,255,255,0.4)' }} />
                Tap to open camera
              </div>
            </div>
          </div>
          <div style={{ padding: '0 18px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 16, padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ color: 'var(--qf-accent)', flexShrink: 0 }}><Icon name="camera" size={20} stroke={2.3} /></div>
              <div style={{ fontFamily: 'var(--qf-body)', fontSize: 14.5, color: '#fff', lineHeight: 1.4 }}>{prompt}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', border: '5px solid rgba(255,255,255,0.85)', background: 'var(--qf-primary)', boxShadow: '0 0 0 4px rgba(255,255,255,0.15)' }} />
            </div>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--qf-body)', fontSize: 12.5, marginTop: 12 }}>Tap the shutter to capture</div>
          </div>
        </label>
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 22, color: 'var(--qf-ink)', alignSelf: 'flex-start', marginBottom: 4 }}>Nice shot!</div>
        <div style={{ fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-muted)', alignSelf: 'flex-start', marginBottom: 16 }}>Happy with it? Submit for review.</div>
        <div style={{ background: '#fff', padding: '12px 12px 46px', borderRadius: 6, boxShadow: '0 14px 30px -12px rgba(0,0,0,0.35)', transform: 'rotate(-2deg)' }}>
          <img src={photoUrl} style={{ width: 240, height: 240, objectFit: 'cover', borderRadius: 3, display: 'block' }} />
        </div>
        <div style={{ marginTop: 28, width: '100%' }}>
          <Btn full variant="primary" icon="check" onClick={submit}>Submit for review · +{points} pts</Btn>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', marginTop: 10, padding: '12px 0', borderRadius: 14, cursor: 'pointer', color: 'var(--qf-muted)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 15 }}>
            <CameraInput />
            Retake
          </label>
        </div>
      </div>
    </ScreenScroll>
  );
}

function TextActivity({ kind, question, answer, points, onDone }) {
  const [val, setVal] = useState('');
  const [tries, setTries] = useState(0);
  const [state, setState] = useState('idle');
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

  const tint = ACTIVITY_META[kind].tint;

  return (
    <ScreenScroll>
      <div style={{ padding: '8px 22px 18px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 99, whiteSpace: 'nowrap', background: `color-mix(in srgb, ${tint} 16%, transparent)`, color: tint, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5 }}>
          <Icon name={ACTIVITY_META[kind].icon} size={15} stroke={2.4} /> {kind === 'riddle' ? 'Riddle me this' : 'Quiz question'}
        </div>
        <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 25, lineHeight: 1.2, color: 'var(--qf-ink)', margin: '16px 0 22px', fontStyle: kind === 'riddle' ? 'italic' : 'normal' }}>{question}</div>
        <div ref={ref}>
          <input autoFocus value={val} disabled={state === 'right'} onChange={e => { setVal(e.target.value); if (state === 'wrong') setState('idle'); }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Type your answer…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '16px 16px', borderRadius: 16, fontFamily: 'var(--qf-body)', fontSize: 17, outline: 'none', WebkitAppearance: 'none', color: 'var(--qf-ink)', background: 'var(--qf-surface)', border: '2px solid ' + (state === 'right' ? 'var(--qf-secondary)' : state === 'wrong' ? '#E0564B' : 'var(--qf-line)'), transition: 'border .15s' }} />
        </div>
        {state === 'wrong' && <div style={{ marginTop: 12, color: '#E0564B', fontFamily: 'var(--qf-body)', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="close" size={15} stroke={2.6} /> Not quite — give it another go!</div>}
        {state === 'right' && <div style={{ marginTop: 12, color: 'var(--qf-secondary)', fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={16} stroke={2.8} /> Correct!{tries === 0 ? ' First try — nice!' : ''}</div>}
        {tries >= 2 && state !== 'right' && <button onClick={() => alert(`Hint: the answer is "${answer}"`)} style={{ marginTop: 16, padding: '9px 14px', borderRadius: 12, border: '1.5px solid var(--qf-line)', background: 'transparent', color: 'var(--qf-muted)', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}><Icon name="sparkle" size={15} stroke={2.2} /> Need a hint?</button>}
      </div>
      <FooterBar><Btn full variant="primary" disabled={state === 'right'} onClick={submit}>Submit answer</Btn></FooterBar>
    </ScreenScroll>
  );
}

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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 99, whiteSpace: 'nowrap', background: `color-mix(in srgb, ${ACTIVITY_META.choice.tint} 16%, transparent)`, color: ACTIVITY_META.choice.tint, fontFamily: 'var(--qf-body)', fontWeight: 700, fontSize: 12.5 }}>
          <Icon name="choice" size={15} stroke={2.4} /> Multiple choice
        </div>
        <div style={{ fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 25, lineHeight: 1.2, color: 'var(--qf-ink)', margin: '16px 0 20px' }}>{question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {options.map((o, i) => {
            const isPicked = picked === i;
            const right = locked && i === correctIndex;
            const wrong = isPicked && i !== correctIndex;
            let border = 'var(--qf-line)', bg = 'var(--qf-surface)';
            if (right) { border = 'var(--qf-secondary)'; bg = 'color-mix(in srgb, var(--qf-secondary) 12%, var(--qf-surface))'; }
            else if (wrong) { border = '#E0564B'; bg = 'color-mix(in srgb, #E0564B 10%, var(--qf-surface))'; }
            return (
              <button key={i} onClick={() => choose(i)} style={{ display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', padding: '15px 16px', borderRadius: 16, cursor: 'pointer', background: bg, border: '2px solid ' + border, transition: 'all .15s', WebkitTapHighlightColor: 'transparent', animation: wrong ? 'qfShake .4s' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--qf-display)', fontWeight: 600, fontSize: 14, background: right ? 'var(--qf-secondary)' : wrong ? '#E0564B' : 'var(--qf-surface-2)', color: (right || wrong) ? '#fff' : 'var(--qf-muted)' }}>
                  {right ? <Icon name="check" size={16} stroke={3} /> : wrong ? <Icon name="close" size={15} stroke={3} /> : String.fromCharCode(65 + i)}
                </div>
                <span style={{ fontFamily: 'var(--qf-body)', fontWeight: 600, fontSize: 15.5, color: 'var(--qf-ink)' }}>{o}</span>
              </button>
            );
          })}
        </div>
      </div>
    </ScreenScroll>
  );
}

export default function PlayActivity({ stop, onStopDone, onBack, onPhotoSubmit }) {
  const [i, setI] = useState(0);
  const earned = useRef(0);
  const acts = stop.activities;
  const a = acts[i];
  const m = ACTIVITY_META[a.type];

  function next(points) {
    earned.current += (points || 0);
    if (i + 1 < acts.length) setI(i + 1);
    else onStopDone(earned.current);
  }

  return (
    <>
      <ActHeader stop={stop} idx={i} total={acts.length} onBack={onBack} m={m} />
      {a.clue && (
        <div style={{ margin: '0 18px 4px', padding: '10px 14px', borderRadius: 14, background: 'color-mix(in srgb, var(--qf-accent) 14%, var(--qf-surface))', border: '1px solid color-mix(in srgb, var(--qf-accent) 30%, var(--qf-line))', display: 'flex', alignItems: 'flex-start', gap: 9 }}>
          <Icon name="sparkle" size={15} stroke={2.3} style={{ color: 'var(--qf-accent)', flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontFamily: 'var(--qf-body)', fontSize: 13.5, color: 'var(--qf-ink)', lineHeight: 1.4 }}>{a.clue}</span>
        </div>
      )}
      {a.type === 'photo' && <PhotoActivity key={i} stop={stop} prompt={a.prompt} points={a.points} onDone={next} onSubmit={onPhotoSubmit || (() => {})} onBackToMap={onBack} />}
      {a.type === 'quiz' && <TextActivity key={i} kind="quiz" question={a.question} answer={a.answer} points={a.points} onDone={next} />}
      {a.type === 'riddle' && <TextActivity key={i} kind="riddle" question={a.riddle} answer={a.answer} points={a.points} onDone={next} />}
      {a.type === 'choice' && <ChoiceActivity key={i} question={a.question} options={a.options} correctIndex={a.correctIndex} points={a.points} onDone={next} />}
    </>
  );
}
