import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const cards = [
  {
    icon: '⚡',
    title: 'Real Personalization',
    body: 'No cookie-cutter templates. Every plan is built from your unique inputs — your body, your goals, your lifestyle. The difference between a generic plan and a personalized one is the difference between results and frustration.',
  },
  {
    icon: '🎯',
    title: 'AI + Human Expertise',
    body: "We combine 6+ years of Coach DK's hands-on coaching experience with AI generation to deliver plans that are both scientifically sound and practically achievable in the Indian context.",
  },
  {
    icon: '🏆',
    title: 'Accessibility',
    body: 'Premium fitness coaching has always been expensive and exclusive. Xerxes makes it accessible — one-time payment, instant delivery, no monthly fees. Your transformation starts now, not someday.',
  },
];

export default function Motive() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 16 } }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography sx={{
            fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
            fontSize: { xs: 28, md: 40 }, color: '#FFD700', letterSpacing: 2, mb: 2,
          }}>
            OUR MOTIVE
          </Typography>
          <Typography sx={{ color: '#888', fontSize: { xs: 15, md: 17 }, maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
            Why Xerxes exists — and why we built it the way we did.
          </Typography>
        </Box>

        {/* Quote */}
        <Box sx={{
          textAlign: 'center', mb: { xs: 8, md: 12 },
          px: { xs: 2, md: 8 },
        }}>
          <Box sx={{ width: 40, height: 3, bgcolor: '#FFD700', mx: 'auto', mb: 4, borderRadius: 1 }} />
          <Typography sx={{
            fontFamily: 'Cinzel, serif',
            fontSize: { xs: 18, md: 24 },
            color: '#C0C0C0',
            lineHeight: 1.7,
            fontStyle: 'italic',
          }}>
            "A man's greatest victory is the conquest of himself. Discipline forges the warrior that no enemy can break."
          </Typography>
          <Typography sx={{ color: '#555', fontSize: 13, mt: 2, letterSpacing: 1 }}>— King Xerxes I, Persian Empire</Typography>
          <Box sx={{ width: 40, height: 3, bgcolor: '#FFD700', mx: 'auto', mt: 4, borderRadius: 1 }} />
        </Box>

        {/* Cards */}
        <Grid container spacing={4} sx={{ mb: { xs: 8, md: 12 } }}>
          {cards.map((card) => (
            <Grid item xs={12} md={4} key={card.title}>
              <Box sx={{
                bgcolor: '#111',
                border: '1px solid #1A1A1A',
                borderRadius: 3, p: { xs: 3, md: 4 },
                height: '100%',
                transition: 'border-color 0.2s',
                '&:hover': { borderColor: 'rgba(255,215,0,0.3)' },
              }}>
                <Typography sx={{ fontSize: 36, mb: 2 }}>{card.icon}</Typography>
                <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#fff', fontSize: 18, mb: 2 }}>
                  {card.title}
                </Typography>
                <Typography sx={{ color: '#888', fontSize: 14, lineHeight: 1.8 }}>
                  {card.body}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#fff', fontSize: { xs: 22, md: 30 }, mb: 2 }}>
            Ready to begin?
          </Typography>
          <Typography sx={{ color: '#888', mb: 4, fontSize: 15 }}>
            Join 500+ clients who chose Xerxes for their transformation.
          </Typography>
          <Button
            onClick={() => navigate('/programs')}
            sx={{
              bgcolor: '#FFD700', color: '#000', fontWeight: 800,
              px: 5, py: 1.5, borderRadius: 2, fontSize: 15,
              fontFamily: 'Montserrat,sans-serif',
              '&:hover': { bgcolor: '#E6C200' },
            }}
          >
            VIEW PROGRAMS
          </Button>
        </Box>

      </Container>
    </Box>
  );
}
