import React from 'react';
import { Box, Typography, Link as MuiLink, Stack } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#111', color: '#fff', py: 3, mt: 8, textAlign: 'center', borderTop: '1px solid #222' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
        <MuiLink href="/privacy" underline="hover" color="inherit" sx={{ cursor: 'pointer', fontWeight: 500 }}>
          Privacy Policy
        </MuiLink>
        <MuiLink href="/terms" underline="hover" color="inherit" sx={{ cursor: 'pointer', fontWeight: 500 }}>
          Terms & Conditions
        </MuiLink>
        <MuiLink href="/refund-policy" underline="hover" color="inherit" sx={{ cursor: 'pointer', fontWeight: 500 }}>
          Refund Policy
        </MuiLink>
        <MuiLink href="/motive" underline="hover" color="inherit" sx={{ cursor: 'pointer', fontWeight: 500 }}>
          Our Motive
        </MuiLink>
      </Stack>
      <Typography variant="caption" display="block" sx={{ mt: 2, color: '#aaa' }}>
        © {new Date().getFullYear()} Xerxes Gym Trainer. All rights reserved.
      </Typography>
    </Box>
  );
}
