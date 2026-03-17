import React from 'react';
import { Container, Typography, Box, Avatar, Paper } from '@mui/material';

const About = () => (
  <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', pt: { xs: 15, sm: 18 } }}>
    <Paper elevation={8} sx={{ width: '100%', p: { xs: 3, sm: 5 }, borderRadius: 5, bgcolor: '#181818', color: '#fff', textAlign: 'center', boxShadow: '0 4px 24px #FFD70033' }}>
      <Avatar
        alt="Trainer"
        src="/xerxes-logo.png"
        sx={{ width: { xs: 90, sm: 120, md: 140 }, height: { xs: 90, sm: 120, md: 140 }, margin: '0 auto', border: '3px solid #FFD700', boxShadow: '0 2px 18px #FFD70044', mb: 2 }}
      />
      <Typography variant="h3" fontWeight={900} sx={{ color: '#FFD700', mb: 2, letterSpacing: 1.5, fontFamily: 'Montserrat, serif', fontSize: { xs: 28, sm: 34 } }}>
        About Us
      </Typography>
      <Typography variant="body1" paragraph sx={{ fontSize: { xs: 17, sm: 19 }, color: '#C0C0C0', mb: 1.5 }}>
        Hi! I’m a dedicated gym and health trainer with over 6 years of experience helping people transform their fitness journeys. My mission is to motivate, guide, and empower you to build a healthier, stronger, and more confident version of yourself. Whether you’re starting your fitness journey or looking to push your limits as an athlete, I’ll create the right program tailored just for you.
      </Typography>
    </Paper>
  </Container>
);

export default About;
