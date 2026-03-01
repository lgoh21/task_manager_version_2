// theme.ts — Single source of truth for colours, fonts, spacing
// Mapped to CSS variables in globals.css via :root and .dark

export const theme = {
  colors: {
    // Base
    background: 'var(--color-background)',
    foreground: 'var(--color-foreground)',
    card: 'var(--color-card)',
    cardForeground: 'var(--color-card-foreground)',

    // Muted / secondary
    muted: 'var(--color-muted)',
    mutedForeground: 'var(--color-muted-foreground)',
    subtle: 'var(--color-subtle)',

    // Borders
    border: 'var(--color-border)',
    borderHover: 'var(--color-border-hover)',

    // Accent
    accent: 'var(--color-accent)',
    accentForeground: 'var(--color-accent-foreground)',

    // Semantic
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',

    // Sidebar
    sidebar: 'var(--color-sidebar)',
    sidebarForeground: 'var(--color-sidebar-foreground)',
    sidebarAccent: 'var(--color-sidebar-accent)',
    sidebarMuted: 'var(--color-sidebar-muted)',
  },

  // Project colour palette (max 7 active projects)
  projectColors: [
    { name: 'Red', value: '#B44D3E' },
    { name: 'Purple', value: '#6B5CE7' },
    { name: 'Green', value: '#4DA676' },
    { name: 'Orange', value: '#D4873A' },
    { name: 'Pink', value: '#C4567A' },
    { name: 'Teal', value: '#3A9E8F' },
    { name: 'Blue', value: '#4A8FD4' },
  ],

  fonts: {
    heading: 'var(--font-heading)',
    ui: 'var(--font-ui)',
    mono: 'var(--font-mono)',
  },

  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },

  spacing: {
    sidebar: {
      expanded: '16rem',   // 256px
      collapsed: '3.5rem', // 56px
    },
    detailPanel: '24rem',  // 384px
    topBar: '3.5rem',      // 56px
    captureBar: '3rem',    // 48px
  },
} as const;

// Light theme — warm cream/stone palette
export const lightTheme = {
  '--color-background': '#F6F4F0',
  '--color-foreground': '#2D2B27',
  '--color-card': '#FFFFFF',
  '--color-card-foreground': '#2D2B27',
  '--color-muted': '#F1EFEB',
  '--color-muted-foreground': '#8A877E',
  '--color-subtle': '#E8E5DF',
  '--color-border': '#E8E5DF',
  '--color-border-hover': '#D0CDC6',
  '--color-accent': '#B44D3E',
  '--color-accent-foreground': '#FFFFFF',
  '--color-success': '#4DA676',
  '--color-warning': '#C9940A',
  '--color-danger': '#B44D3E',
  '--color-sidebar': '#F1EFEB',
  '--color-sidebar-foreground': '#3D3B37',
  '--color-sidebar-accent': 'rgba(0,0,0,0.045)',
  '--color-sidebar-muted': '#8A877E',
} as const;

// Dark theme — warm dark variant
export const darkTheme = {
  '--color-background': '#1A1917',
  '--color-foreground': '#E8E5DF',
  '--color-card': '#222120',
  '--color-card-foreground': '#E8E5DF',
  '--color-muted': '#2A2826',
  '--color-muted-foreground': '#9C9990',
  '--color-subtle': '#3D3B37',
  '--color-border': '#3D3B37',
  '--color-border-hover': '#5C5A55',
  '--color-accent': '#D4705F',
  '--color-accent-foreground': '#FFFFFF',
  '--color-success': '#5DBF8A',
  '--color-warning': '#E0A820',
  '--color-danger': '#D4705F',
  '--color-sidebar': '#1E1D1B',
  '--color-sidebar-foreground': '#E8E5DF',
  '--color-sidebar-accent': 'rgba(255,255,255,0.06)',
  '--color-sidebar-muted': '#9C9990',
} as const;
