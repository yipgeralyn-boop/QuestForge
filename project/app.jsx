// app.jsx — QuestForge router, theme + tweaks wiring
(function () {
  const { useState, useEffect, useRef } = React;
  const {
    THEMES, MAP_STYLES, FONT_SETS, SAMPLE_RACE,
    HomeScreen, OrgBuilder, OrgStop, OrgAddActivity, OrgPublish,
    PlayLobby, PlayMap, PlayActivity, PlayResult, PlayLeaderboard, PlayRecap,
    useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakSelect, TweakText,
  } = window;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "sunset",
    "mapStyle": "parchment",
    "font": "fredoka",
    "questWord": "quest"
  }/*EDITMODE-END*/;

  // theme key <-> swatch-palette mapping (TweakColor stores the palette array)
  const THEME_PALETTES = Object.keys(THEMES).map(k => THEMES[k].swatch);
  const paletteToTheme = (pal) => {
    const s = JSON.stringify(pal);
    return Object.keys(THEMES).find(k => JSON.stringify(THEMES[k].swatch) === s) || 'sunset';
  };

  // deep-clone sample so edits don't mutate the source
  const freshRace = () => JSON.parse(JSON.stringify(SAMPLE_RACE));

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [race, setRace] = useState(freshRace);
    const [stack, setStack] = useState([{ name: 'home' }]);
    const cur = stack[stack.length - 1];

    // play session state
    const [play, setPlay] = useState({ idx: 0, score: 0, lastEarned: 0, prevRank: null });
    const prevRankRef = useRef(null);

    const theme = THEMES[t.theme] || THEMES.sunset;
    const fonts = FONT_SETS[t.font] || FONT_SETS.fredoka;

    // apply theme + font vars to the app root
    const rootRef = useRef(null);
    useEffect(() => {
      const el = rootRef.current; if (!el) return;
      Object.entries(theme.vars).forEach(([k, v]) => el.style.setProperty(k, v));
      el.style.setProperty('--qf-display', fonts.display);
      el.style.setProperty('--qf-body', fonts.body);
    }, [t.theme, t.font]);

    function go(scr) {
      if (scr.reset) { setRace(r => r); }
      if (scr.name === 'home') { setStack([{ name: 'home' }]); return; }
      // play-flow transitions advance the session
      if (scr.name === 'play') {
        // returning to map; replace top if it's a result/activity
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
      setPlay({ idx: 0, score: 0, lastEarned: 0 });
      prevRankRef.current = null;
    }
    // called when a stop's activities are all done
    function finishStop(earned) {
      setPlay(p => {
        const np = { ...p, idx: p.idx + 1, score: p.score + earned, lastEarned: earned };
        return np;
      });
      // push result screen
      setStack(s => [...s.filter(x => x.name !== 'activity'), { name: 'result' }]);
    }

    const screenKey = cur.name + (cur.stopId || '') + (cur.name === 'result' ? play.idx : '');
    const mapStyle = t.mapStyle;

    let screen = null;
    const common = { race, setRace, go, back, t, mapStyle };
    switch (cur.name) {
      case 'home': screen = <HomeScreen {...common} />; break;
      case 'orgBuilder': screen = <OrgBuilder {...common} />; break;
      case 'orgStop': screen = <OrgStop {...common} stopId={cur.stopId} />; break;
      case 'orgAdd': screen = <OrgAddActivity {...common} stopId={cur.stopId} />; break;
      case 'orgPublish': screen = <OrgPublish {...common} />; break;
      case 'lobby': screen = <PlayLobby {...common} startPlay={startPlay} />; break;
      case 'play': screen = <PlayMap {...common} play={play} />; break;
      case 'activity': {
        const stop = race.stops[play.idx];
        screen = <PlayActivity stop={stop} onStopDone={(earned) => { prevRankRef.current = window.qfRank(race, play); finishStop(earned); }} onBack={back} />;
        break;
      }
      case 'result': screen = <PlayResult {...common} play={play} prevRank={prevRankRef.current} />; break;
      case 'leaderboard': screen = <PlayLeaderboard {...common} play={play} />; break;
      case 'recap': screen = <PlayRecap {...common} play={play} restart={() => { startPlay(); setStack([{ name: 'lobby' }]); }} />; break;
      default: screen = <HomeScreen {...common} />;
    }

    return (
      <div ref={rootRef} className="qf-root" style={{
        width: '100%', height: '100%', background: 'var(--qf-bg)', color: 'var(--qf-ink)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
        fontFamily: 'var(--qf-body)',
      }}>
        <div key={screenKey} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, animation: 'qfScreenIn .32s cubic-bezier(.2,.8,.2,1)' }}>
          {screen}
        </div>

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

  window.QFApp = App;
})();
