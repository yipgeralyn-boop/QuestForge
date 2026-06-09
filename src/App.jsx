import { useState, useEffect, useRef, Component } from 'react';
import { THEMES, MAP_STYLES, FONT_SETS, SAMPLE_RACE } from './data.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakSelect } from './components/TweaksPanel.jsx';
import IOSDevice from './components/IOSDevice.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import { OrgBuilder, OrgStop, OrgAddActivity, OrgPublish, OrgDashboard, OrgDetails } from './screens/OrgScreens.jsx';
import PlayActivity from './screens/ActivityScreen.jsx';
import { PlayJoin, PlayTeamSetup, PlayLobby, PlayMap, PlayResult, PlayRecap, qfRank } from './screens/PlayerScreens.jsx';

class ScreenErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
          <div style={{ fontFamily: 'system-ui', fontWeight: 700, fontSize: 16, color: '#E0564B' }}>Something went wrong</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#888', textAlign: 'center', wordBreak: 'break-all', maxWidth: 320 }}>{String(this.state.err)}</div>
          <button onClick={() => { this.setState({ err: null }); this.props.onReset?.(); }} style={{ marginTop: 8, padding: '10px 18px', borderRadius: 12, border: 'none', background: '#E0564B', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Back to home</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const TWEAK_DEFAULTS = {
  theme: 'sunset',
  mapStyle: 'parchment',
  font: 'fredoka',
  questWord: 'quest',
};

const THEME_PALETTES = Object.keys(THEMES).map(k => THEMES[k].swatch);
const paletteToTheme = (pal) => {
  const s = JSON.stringify(pal);
  return Object.keys(THEMES).find(k => JSON.stringify(THEMES[k].swatch) === s) || 'sunset';
};

const freshRace = () => JSON.parse(JSON.stringify(SAMPLE_RACE));

const DEVICE_W = 402, DEVICE_H = 874;

function QFApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [race, setRace] = useState(freshRace);
  const [stack, setStack] = useState([{ name: 'home' }]);
  const cur = stack[stack.length - 1];

  const [play, setPlay] = useState({ completedIds: [], score: 0, lastEarned: 0, lastCompletedName: '', teamName: '', roster: [] });
  const prevRankRef = useRef(null);

  const theme = THEMES[t.theme] || THEMES.sunset;
  const fonts = FONT_SETS[t.font] || FONT_SETS.fredoka;

  const rootRef = useRef(null);
  useEffect(() => {
    const el = rootRef.current; if (!el) return;
    Object.entries(theme.vars).forEach(([k, v]) => el.style.setProperty(k, v));
    el.style.setProperty('--qf-display', fonts.display);
    el.style.setProperty('--qf-body', fonts.body);
  }, [t.theme, t.font]);

  function go(scr) {
    if (scr.name === 'home') { setStack([{ name: 'home' }]); return; }
    if (scr.name === 'play') {
      setStack(s => {
        const base = s.filter(x => !['activity', 'result'].includes(x.name));
        if (base[base.length - 1] && base[base.length - 1].name === 'play') return base;
        return [...base, { name: 'play' }];
      });
      return;
    }
    setStack(s => [...s, scr]);
  }
  function back() { setStack(s => s.length > 1 ? s.slice(0, -1) : s); }

  function startPlay() {
    setPlay({ completedIds: [], score: 0, lastEarned: 0, lastCompletedName: '', startTime: Date.now() });
    prevRankRef.current = null;
  }

  function finishStop(earned, stopId, stopName) {
    setPlay(p => ({ ...p, completedIds: [...p.completedIds, stopId], score: p.score + earned, lastEarned: earned, lastCompletedName: stopName }));
    setStack(s => [...s.filter(x => x.name !== 'activity'), { name: 'result' }]);
  }

  const screenKey = cur.name + (cur.stopId || '') + (cur.name === 'result' ? play.completedIds.length : '');
  const common = { race, setRace, go, back, t, mapStyle: t.mapStyle };

  let screen = null;
  switch (cur.name) {
    case 'home': screen = <HomeScreen {...common} />; break;
    case 'orgBuilder': screen = <OrgBuilder {...common} />; break;
    case 'orgDetails': screen = <OrgDetails {...common} />; break;
    case 'orgStop': screen = <OrgStop {...common} stopId={cur.stopId} />; break;
    case 'orgAdd': screen = <OrgAddActivity {...common} stopId={cur.stopId} />; break;
    case 'orgPublish': screen = <OrgPublish {...common} />; break;
    case 'orgDash': screen = <OrgDashboard {...common} play={play} />; break;
    case 'join': screen = <PlayJoin {...common} />; break;
    case 'teamSetup': screen = <PlayTeamSetup {...common} setTeam={(teamName, roster) => setPlay(p => ({ ...p, teamName, roster }))} />; break;
    case 'lobby': screen = <PlayLobby {...common} startPlay={startPlay} play={play} />; break;
    case 'play': screen = <PlayMap {...common} play={play} />; break;
    case 'activity': {
      const stop = race.stops.find(s => s.id === cur.stopId);
      if (!stop || !stop.activities || stop.activities.length === 0) { screen = <PlayMap {...common} play={play} />; break; }
      screen = <PlayActivity
        stop={stop}
        onStopDone={(earned) => { prevRankRef.current = qfRank(race, play); finishStop(earned, stop.id, stop.name); }}
        onBack={back}
        onPhotoSubmit={(data) => setRace(r => ({ ...r, pendingPhotos: [...(r.pendingPhotos || []), { ...data, id: Date.now() + Math.random(), teamName: play.teamName || 'Unknown team' }] }))}
      />;
      break;
    }
    case 'result': screen = <PlayResult {...common} play={play} prevRank={prevRankRef.current} />; break;
    case 'recap': screen = <PlayRecap {...common} play={play} restart={() => { startPlay(); setStack([{ name: 'lobby' }]); }} />; break;
    default: screen = <HomeScreen {...common} />;
  }

  return (
    <div ref={rootRef} style={{
      width: '100%', height: '100%', background: 'var(--qf-bg)', color: 'var(--qf-ink)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
      fontFamily: 'var(--qf-body)',
    }}>
      <ScreenErrorBoundary key={screenKey} onReset={() => go({ name: 'home' })}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {screen}
        </div>
      </ScreenErrorBoundary>

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakColor label="Color theme" value={THEMES[t.theme].swatch}
          options={THEME_PALETTES}
          onChange={(pal) => setTweak('theme', paletteToTheme(pal))} />
        <TweakSelect label="Map style" value={t.mapStyle}
          options={Object.keys(MAP_STYLES).map(k => ({ value: k, label: MAP_STYLES[k].label }))}
          onChange={(v) => setTweak('mapStyle', v)} />
        <TweakSection label="Typography" />
        <TweakSelect label="Font set" value={t.font}
          options={Object.keys(FONT_SETS).map(k => ({ value: k, label: FONT_SETS[k].label }))}
          onChange={(v) => setTweak('font', v)} />
        <TweakSection label="Copy" />
        <TweakRadio label="Call a race a…" value={t.questWord}
          options={['quest', 'race', 'adventure', 'mission']}
          onChange={(v) => setTweak('questWord', v)} />
      </TweaksPanel>
    </div>
  );
}

class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#211a2e', color: '#fff', padding: 24, gap: 12, fontFamily: 'system-ui' }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#FF5C39' }}>App crashed</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#aaa', textAlign: 'center', wordBreak: 'break-all', maxWidth: 340 }}>{String(this.state.err)}</div>
          <button onClick={() => { this.setState({ err: null }); window.location.reload(); }} style={{ marginTop: 12, padding: '12px 22px', borderRadius: 12, border: 'none', background: '#FF5C39', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function fit() {
      const pad = 24;
      const s = Math.min((window.innerWidth - pad) / DEVICE_W, (window.innerHeight - pad) / DEVICE_H, 1);
      setScale(s);
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  return (
    <AppErrorBoundary>
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#211a2e',
        backgroundImage: 'radial-gradient(circle at 20% 15%, #2e2440, transparent 55%), radial-gradient(circle at 85% 85%, #1c2c3a, transparent 55%)',
      }}>
        <div style={{ transformOrigin: 'center center', transform: `scale(${scale})` }}>
          <IOSDevice width={DEVICE_W} height={DEVICE_H}>
            <QFApp />
          </IOSDevice>
        </div>
      </div>
    </AppErrorBoundary>
  );
}
