// QuestForge — theme tokens, icons, and sample quest data

export const THEMES = {
  sunset: {
    label: 'Sunset Quest',
    dark: false,
    swatch: ['#FF5C39', '#14B8A6', '#FFC53D'],
    vars: {
      '--qf-bg': '#FBF4E9',
      '--qf-surface': '#FFFFFF',
      '--qf-surface-2': '#FFF3E4',
      '--qf-ink': '#2A2438',
      '--qf-muted': '#8C8499',
      '--qf-primary': '#FF5C39',
      '--qf-primary-ink': '#FFFFFF',
      '--qf-secondary': '#0FB5A4',
      '--qf-accent': '#FFC53D',
      '--qf-accent-ink': '#3A2A06',
      '--qf-line': 'rgba(42,36,56,0.10)',
      '--qf-shadow': 'rgba(63,42,20,0.16)',
    },
  },
  jungle: {
    label: 'Jungle Trek',
    dark: false,
    swatch: ['#1FA85A', '#F2960F', '#C2E84B'],
    vars: {
      '--qf-bg': '#F2F7EC',
      '--qf-surface': '#FFFFFF',
      '--qf-surface-2': '#E9F3DD',
      '--qf-ink': '#1B2B21',
      '--qf-muted': '#7C8B7E',
      '--qf-primary': '#1FA85A',
      '--qf-primary-ink': '#FFFFFF',
      '--qf-secondary': '#F2960F',
      '--qf-accent': '#B6E24A',
      '--qf-accent-ink': '#2A3A06',
      '--qf-line': 'rgba(27,43,33,0.10)',
      '--qf-shadow': 'rgba(20,50,28,0.16)',
    },
  },
  neon: {
    label: 'Neon Night',
    dark: true,
    swatch: ['#8B5CF6', '#22D3EE', '#F472B6'],
    vars: {
      '--qf-bg': '#13112A',
      '--qf-surface': '#1E1B3A',
      '--qf-surface-2': '#272252',
      '--qf-ink': '#F3F0FF',
      '--qf-muted': '#9A93C8',
      '--qf-primary': '#8B5CF6',
      '--qf-primary-ink': '#FFFFFF',
      '--qf-secondary': '#22D3EE',
      '--qf-accent': '#F472B6',
      '--qf-accent-ink': '#37102A',
      '--qf-line': 'rgba(255,255,255,0.12)',
      '--qf-shadow': 'rgba(0,0,0,0.45)',
    },
  },
};

export const MAP_STYLES = {
  parchment: {
    label: 'Parchment',
    paper: '#F1E4C9', paper2: '#EAD9B6',
    land: '#C4E2A0', land2: '#AED68C',
    water: '#9FD3E6', road: '#F6EDD6', roadEdge: '#E2CFA6',
    ink: '#6B5836', grid: 'rgba(107,88,54,0.10)',
  },
  modern: {
    label: 'Clean',
    paper: '#EEF1F5', paper2: '#E5E9EF',
    land: '#D9E7D6', land2: '#CBDDC7',
    water: '#BFE0EC', road: '#FFFFFF', roadEdge: '#DCE2EA',
    ink: '#8A93A1', grid: 'rgba(120,130,145,0.10)',
  },
  night: {
    label: 'Tactical',
    paper: '#161A2E', paper2: '#11142440',
    land: '#1F2540', land2: '#252C4D',
    water: '#152544', road: '#2E365C', roadEdge: '#3A4170',
    ink: '#7C84B0', grid: 'rgba(140,150,200,0.08)',
  },
};

export const FONT_SETS = {
  fredoka: { label: 'Fredoka', display: '"Fredoka", system-ui', body: '"DM Sans", system-ui' },
  baloo: { label: 'Baloo', display: '"Baloo 2", system-ui', body: '"Nunito Sans", system-ui' },
  bricolage: { label: 'Bricolage', display: '"Bricolage Grotesque", system-ui', body: '"DM Sans", system-ui' },
};

const ICON_PATHS = {
  flag: <><path d="M5 21V4M5 4c3-2 6 2 9 0s5 0 5 0v9s-2 2-5 0-6-2-9 0" /></>,
  camera: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" /><circle cx="12" cy="13" r="3.2" /></>,
  quiz: <><circle cx="12" cy="12" r="9" /><path d="M9.2 9.5a2.8 2.8 0 015.4.9c0 1.9-2.6 2.3-2.6 4M12 17.4v.01" /></>,
  choice: <><path d="M4 6h16M4 12h16M4 18h16" /><path d="M2.5 6l1 1 1.8-2M2.5 12l1 1 1.8-2M2.5 18l1 1 1.8-2" /></>,
  riddle: <><path d="M12 3l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 20l.9-5L4.8 11.5l5-.7L12 3z" /></>,
  pin: <><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></>,
  trophy: <><path d="M7 4h10v4a5 5 0 01-10 0V4z" /><path d="M7 6H4.5A1.5 1.5 0 003 7.5C3 9.4 4.6 11 7 11M17 6h2.5A1.5 1.5 0 0121 7.5C21 9.4 19.4 11 17 11M9 14h6M10 14l-.7 4h5.4L14 14M8 21h8" /></>,
  check: <><path d="M5 12.5l4.2 4.5L19 7" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  chevron: <><path d="M9 6l6 6-6 6" /></>,
  chevronL: <><path d="M15 6l-6 6 6 6" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></>,
  star: <><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0111 0M16 6.2a3 3 0 010 5.6M17 13.5a5.5 5.5 0 013.5 5.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  close: <><path d="M6 6l12 12M18 6L6 18" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  sparkle: <><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" /><path d="M19 4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" /></>,
  edit: <><path d="M4 20h4L19 9a2 2 0 00-3-3L5 17v3z" /><path d="M14.5 6.5l3 3" /></>,
  share: <><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="6" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M8.1 11l7.8-3.8M8.1 13l7.8 3.8" /></>,
  play: <><path d="M7 4.5l12 7.5-12 7.5v-15z" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" /></>,
  route: <><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="6" r="2.4" /><path d="M8.4 17.3C14 16 16 13 16.4 8.2M6 15.6V11a3 3 0 013-3h4" /></>,
  image: <><rect x="3.5" y="5" width="17" height="14" rx="2.2" /><circle cx="8.5" cy="10" r="1.6" /><path d="M5 18l4.5-4.5 3 3L16 12l4 5" /></>,
  medal: <><circle cx="12" cy="14" r="5.2" /><path d="M12 11.6l1 2 2.2.2-1.7 1.5.6 2.2-2.1-1.2-2.1 1.2.6-2.2-1.7-1.5 2.2-.2 1-2zM8.5 9L6 3.5M15.5 9L18 3.5" /></>,
  bolt: <><path d="M13 3L5 13h5l-1 8 8-10h-5l1-8z" /></>,
  gift: <><rect x="4" y="11" width="16" height="9" rx="1.5" /><path d="M4 11h16M12 11v9M12 11s-1.5-5-4-5a2 2 0 000 5M12 11s1.5-5 4-5a2 2 0 010 5" /></>,
  map: <><path d="M9 4L3.5 6.2v13.3L9 17.3l6 2.2 5.5-2.2V4L15 6.2 9 4z" /><path d="M9 4v13.3M15 6.2v13.3" /></>,
  grip: <><circle cx="9" cy="6" r="1.3" /><circle cx="15" cy="6" r="1.3" /><circle cx="9" cy="12" r="1.3" /><circle cx="15" cy="12" r="1.3" /><circle cx="9" cy="18" r="1.3" /><circle cx="15" cy="18" r="1.3" /></>,
  flame: <><path d="M12 3s4 3.5 4 8a4 4 0 01-8 0c0-1 .4-2 1-2.6C9 11 12 9 12 3z" /><path d="M12 21a3 3 0 003-3c0-2-3-3-3-3s-3 1-3 3a3 3 0 003 3z" /></>,
  refresh: <><path d="M4 12a8 8 0 0113.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 01-13.7 5.7L4 16M4 20v-4h4" /></>,
  qr: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2M20 14v.01M18 18h2v2M14 20h.01" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>,
};

export function Icon({ name, size = 22, stroke = 2, fill = 'none', style = {}, className }) {
  const p = ICON_PATHS[name] || null;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}>
      {p}
    </svg>
  );
}

export const ACTIVITY_META = {
  gps: { label: 'Arrive', verb: 'Check in', icon: 'pin', tint: 'var(--qf-secondary)', blurb: 'Reach the spot to unlock' },
  photo: { label: 'Photo', verb: 'Snap it', icon: 'camera', tint: 'var(--qf-primary)', blurb: 'Capture the challenge' },
  quiz: { label: 'Quiz', verb: 'Answer', icon: 'quiz', tint: 'var(--qf-accent)', blurb: 'Type the right answer' },
  choice: { label: 'Multiple choice', verb: 'Choose', icon: 'choice', tint: '#7C6CF6', blurb: 'Pick the correct option' },
  riddle: { label: 'Riddle', verb: 'Solve it', icon: 'riddle', tint: '#EC6FB0', blurb: 'Crack the clue' },
};

export const SAMPLE_RACE = {
  name: '',
  tagline: '',
  duration: 60,
  stops: [],
};

export function qfWord(t, which) {
  const base = (t && t.questWord) || 'quest';
  const word = base;
  const plural = word + 's';
  switch (which) {
    case 'quests': return plural;
    case 'Quest': return word[0].toUpperCase() + word.slice(1);
    case 'Quests': return (word[0].toUpperCase() + word.slice(1)) + 's';
    default: return word;
  }
}

let _idn = 100;
export function makeId() { _idn += 1; return 'x' + _idn; }
