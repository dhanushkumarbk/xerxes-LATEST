// ── XERXES Design System 2025 ──────────────────────────────────────────────
export const tokens = {
  // Grays
  black:     '#000000',
  gray950:   '#0A0A0B',
  gray900:   '#111113',
  gray800:   '#1C1C1F',
  gray700:   '#26262B',
  gray600:   '#333339',
  gray500:   '#515159',
  gray400:   '#7C7C87',
  gray300:   '#AFAFB8',
  gray200:   '#D4D4DC',
  gray100:   '#EBEBF0',
  white:     '#FFFFFF',
  // Brand
  gold:      '#D4A843',
  goldLight: '#F0C060',
  goldMuted: '#8A6B28',
  // Semantic
  success:   '#22C55E',
  error:     '#EF4444',
  warning:   '#F59E0B',
};

// For legacy compatibility
export const colors = {
  primary:    tokens.gold,
  background: tokens.gray950,
  card:       tokens.gray900,
  text:       tokens.white,
  muted:      tokens.gray300,
  border:     tokens.gray700,
};

export const font = {
  display: '"Syne", "Inter", sans-serif',
  body:    '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
};
