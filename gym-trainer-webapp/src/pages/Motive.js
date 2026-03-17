import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

export default function Motive() {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={8} sx={{ width: '100%', p: { xs: 3, sm: 5 }, borderRadius: 5, bgcolor: '#181818', color: '#fff', textAlign: 'center', boxShadow: '0 4px 24px #FFD70033' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 900, letterSpacing: 2, color: '#FFD700', fontFamily: 'Montserrat, serif', fontSize: { xs: 28, sm: 34 } }}>
          Our Motive
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ fontStyle: 'italic', color: '#C0C0C0', fontSize: { xs: 18, sm: 22 } }}>
          "Transform Your Body. Elevate Your Life."
        </Typography>
        <Typography variant="body1" paragraph sx={{ mt: 3, fontSize: { xs: 16, sm: 18 }, color: '#C0C0C0' }}>
          At Xerxes, our mission is to empower you to become the strongest, healthiest, and most confident version of yourself. We believe fitness is not just about aesthetics, but about discipline, resilience, and personal growth. Every program we offer is designed to inspire you to push your limits, conquer challenges, and embrace a lifestyle of excellence.
        </Typography>
        <Typography variant="body1" paragraph sx={{ fontSize: { xs: 16, sm: 18 }, color: '#C0C0C0' }}>
          Whether you are just starting out or striving for elite performance, we are here to guide, motivate, and celebrate every step of your journey. Join us and discover the power within you to achieve greatness—inside and outside the gym.
        </Typography>
      </Paper>
    </Container>
  );
}
