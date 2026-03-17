import React from 'react';
import Button from '@mui/material/Button';
import { colors } from '../theme';

export default function PremiumButton({ children, style, ...props }) {
  return (
    <Button
      variant="contained"
      sx={{
        background: `linear-gradient(90deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
        borderRadius: '32px',
        padding: '12px 32px',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        boxShadow: '0 4px 18px 0 rgba(25,118,210,0.12)',
        textTransform: 'none',
        ...style
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
