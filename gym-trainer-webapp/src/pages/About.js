import React from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function About() {
  return (
    <Box sx={{ bgcolor: '#000', pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 16 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 12 }} alignItems="center">

          {/* Photo side */}
          <Grid item xs={12} md={5}>
            <Box sx={{
              borderRadius: 3, overflow: 'hidden',
              bgcolor: '#111', border: '1px solid #222',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', minHeight: 380, position: 'relative',
            }}>
              <img src="/xerxes-logo.png" alt="Coach DK"
                style={{ width: '65%', objectFit: 'contain', opacity: 0.9 }} />
              <Box sx={{
                position: 'absolute', bottom: 20, right: 20,
                bgcolor: 'rgba(0,0,0,0.88)',
                border: '1px solid #222',
                borderRadius: 2, p: 2,
              }}>
                <Typography sx={{ fontSize: 11, color: '#555', letterSpacing: '0.08em', mb: 0.3 }}>EXPERIENCE</Typography>
                <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 24, color: '#FFD700', lineHeight: 1 }}>6+ Years</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Content side */}
          <Grid item xs={12} md={7}>
            <Typography sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#FFD700', mb: 2,
            }}>
              <Box component="span" sx={{ display: 'inline-block', width: 20, height: 1.5, bgcolor: '#FFD700', borderRadius: 1 }} />
              About the Coach
            </Typography>

            <Typography sx={{
              fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.1,
              color: '#fff', mb: 3,
            }}>Coach DK</Typography>

            {[
              "I'm a dedicated gym and health coach with 6+ years of experience helping people genuinely transform — not just lose weight for a wedding, but change their relationship with their body, their food, and their training.",
              "My approach is simple: no generic templates, no one-size-fits-all plans. Every program I build is specific to you — your body, your schedule, your food preferences, your goals.",
              "Whether you're a complete beginner trying to lose your first 5kg or an experienced lifter hitting a plateau, I'll build a plan that actually works and explain the why behind every choice.",
            ].map((para, i) => (
              <Typography key={i} sx={{ fontSize: 16, color: '#888', lineHeight: 1.8, mb: 2 }}>{para}</Typography>
            ))}

            <Box sx={{
              display: 'flex', flexWrap: 'wrap', gap: 4, my: 4,
              pt: 4, borderTop: '1px solid #1A1A1A',
            }}>
              {[
                { value: '6+', label: 'Years coaching' },
                { value: '500+', label: 'Transformations' },
                { value: '4.9★', label: 'Average rating' },
              ].map(s => (
                <Box key={s.label}>
                  <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 28, color: '#FFD700', lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#555', mt: 0.5 }}>{s.label}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={Link} to="/signup"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#FFD700', color: '#000', fontWeight: 800,
                  px: 3, py: 1.3, borderRadius: 2,
                  fontFamily: 'Montserrat,sans-serif',
                  '&:hover': { bgcolor: '#E6C200' }
                }}
              >Start your transformation</Button>
              <Button
                component={Link} to="/contact"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255,215,0,0.3)', color: '#FFD700',
                  fontWeight: 700, px: 3, py: 1.3, borderRadius: 2,
                  '&:hover': { borderColor: '#FFD700', bgcolor: 'rgba(255,215,0,0.05)' }
                }}
              >Get in touch</Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
