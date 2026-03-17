import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';

export default function ContactUs() {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={8} sx={{ width: '100%', p: { xs: 3, sm: 5 }, borderRadius: 5, bgcolor: '#181818', color: '#fff', textAlign: 'center', boxShadow: '0 4px 24px #FFD70033' }}>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#FFD700', mb: 2, letterSpacing: 1.5, fontFamily: 'Montserrat, serif' }}>
          Contact Us
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: 17, sm: 19 }, color: '#C0C0C0' }}>
          For support or any questions, please contact us:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700 }}>Email:</Typography>
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500, fontSize: 18 }}>dhanushkumar102@gmail.com</Typography>
        </Box>
      </Paper>
    </Container>
  );
}
