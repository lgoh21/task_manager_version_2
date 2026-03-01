// theme.ts — Single source of truth for colours, fonts, spacing
// Mapped to CSS variables in globals.css for runtime theming

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
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Red', value: '#EF4444' },
  ],

  fonts: {
    sans: 'var(--font-sans)',
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

// CSS variable definitions — applied in globals.css via :root and .dark
export const lightTheme = {
  '--color-background': '#FAFAFA',
  '--color-foreground': '#0A0A0A',
  '--color-card': '#FFFFFF',
  '--color-card-foreground': '#0A0A0A',
  '--color-muted': '#F5F5F5',
  '--color-muted-foreground': '#737373',
  '--color-subtle': '#E5E5E5',
  '--color-border': '#E5E5E5',
  '--color-border-hover': '#D4D4D4',
  '--color-accent': '#2563EB',
  '--color-accent-foreground': '#FFFFFF',
  '--color-success': '#16A34A',
  '--color-warning': '#D97706',
  '--color-danger': '#DC2626',
  '--color-sidebar': '#F5F5F5',
  '--color-sidebar-foreground': '#171717',
  '--color-sidebar-accent': '#E5E5E5',
  '--color-sidebar-muted': '#A3A3A3',
} as const;

export const darkTheme = {
  '--color-background': '#0A0A0A',
  '--color-foreground': '#FAFAFA',
  '--color-card': '#141414',
  '--color-card-foreground': '#FAFAFA',
  '--color-muted': '#1C1C1C',
  '--color-muted-foreground': '#A3A3A3',
  '--color-subtle': '#262626',
  '--color-border': '#262626',
  '--color-border-hover': '#3B3B3B',
  '--color-accent': '#3B82F6',
  '--color-accent-foreground': '#FFFFFF',
  '--color-success': '#22C55E',
  '--color-warning': '#F59E0B',
  '--color-danger': '#EF4444',
  '--color-sidebar': '#111111',
  '--color-sidebar-foreground': '#FAFAFA',
  '--color-sidebar-accent': '#1C1C1C',
  '--color-sidebar-muted': '#737373',
} as const;
