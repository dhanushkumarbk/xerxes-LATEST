import React from 'react';
import Paper from '@mui/material/Paper';
import { colors } from '../theme';

export default function PremiumCard({ title, subtitle, children, style }) {
  return (
    <Paper elevation={4} sx={{
      borderRadius: '24px',
      padding: '2rem',
      background: colors.card,
      boxShadow: '0 8px 32px 0 rgba(25,118,210,0.08)',
      textAlign: 'center',
      ...style
    }}>
      <div style={{ fontWeight: 700, fontSize: '1.4rem', color: colors.primary, marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ color: colors.muted, fontSize: '1rem', marginBottom: 10 }}>{subtitle}</div>}
      {children}
    </Paper>
  );
}
