import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const LINKS = {
  Programs: [
    { label: 'Diet Plan',          to: '/personalize-diet' },
    { label: 'Workout Plan',       to: '/personalize-workout' },
    { label: 'Combo Plan',         to: '/personalize-combo' },
    { label: 'All Programs',       to: '/programs' },
  ],
  Company: [
    { label: 'About',              to: '/about' },
    { label: 'Articles',           to: '/articles' },
    { label: 'Our Motive',         to: '/motive' },
    { label: 'Contact',            to: '/contact' },
    { label: 'FAQs',               to: '/faqs' },
  ],
  Legal: [
    { label: 'Privacy Policy',     to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Refund Policy',      to: '/refund-policy' },
  ],
};

export default function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: '1px solid #1A1A1A', bgcolor: '#111', pt: { xs: 8, md: 12 }, pb: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          {/* Brand column */}
          <Grid item xs={12} md={4}>
            <Link to="/" style={{ display: 'inline-block', marginBottom: 20 }}>
              <img src="/xerxes-logo.png" alt="Xerxes" style={{ height: 44, objectFit: 'contain' }} />
            </Link>
            <Typography sx={{ fontSize: 14, color: '#888', lineHeight: 1.8, maxWidth: 280, mb: 1 }}>
              Elite fitness coaching built on personalization, science, and real results.
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#555' }}>6+ years · 500+ transformations</Typography>
          </Grid>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <Grid item xs={6} md={2.5} key={section}>
              <Typography sx={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#FFD700', mb: 2.5,
              }}>{section}</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {links.map(({ label, to }) => (
                  <Typography
                    key={to}
                    component={Link}
                    to={to}
                    sx={{
                      fontSize: 13, color: '#888',
                      textDecoration: 'none',
                      transition: 'color 0.15s',
                      '&:hover': { color: '#FFD700' },
                    }}
                  >{label}</Typography>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Bottom bar */}
        <Box sx={{
          mt: { xs: 6, md: 10 }, pt: 3,
          borderTop: '1px solid #1A1A1A',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 2,
        }}>
          <Typography sx={{ fontSize: 12, color: '#555' }}>
            © {new Date().getFullYear()} Xerxes Fitness. All rights reserved.
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#333' }}>
            Powered by Razorpay · Azure
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
