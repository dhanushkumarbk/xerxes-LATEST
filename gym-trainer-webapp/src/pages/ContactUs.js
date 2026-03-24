import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function ContactRow({ icon, label, value, href }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 2.5, borderBottom: '1px solid #1A1A1A', '&:last-child': { borderBottom: 'none' } }}>
      <Box sx={{ color: '#FFD700', flexShrink: 0, mt: 0.3 }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#555', mb: 0.4 }}>{label}</Typography>
        {href ? (
          <Box component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: '#fff', fontSize: 15, textDecoration: 'none', '&:hover': { color: '#FFD700' } }}>
            {value}
          </Box>
        ) : (
          <Typography sx={{ color: '#fff', fontSize: 15 }}>{value}</Typography>
        )}
      </Box>
    </Box>
  );
}

export default function ContactUs() {
  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 16 } }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography sx={{
            fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
            fontSize: { xs: 28, md: 40 }, color: '#FFD700', letterSpacing: 2, mb: 1,
          }}>
            CONTACT US
          </Typography>
          <Typography sx={{ color: '#888', fontSize: 15 }}>
            Reach out and we'll respond within 24 hours.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{
          bgcolor: '#111', border: '1px solid #222', borderRadius: 3,
          p: { xs: 3, sm: 4 }, mb: 3, position: 'relative', overflow: 'hidden',
          '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #FFD700, #fff 50%, #FFD700)' },
        }}>
          <ContactRow
            icon={<EmailIcon />}
            label="Email"
            value="dhanushkumar102@gmail.com"
            href="mailto:dhanushkumar102@gmail.com"
          />
          <ContactRow
            icon={<InstagramIcon />}
            label="Instagram"
            value="@xerxes.fitness"
            href="https://instagram.com/xerxes.fitness"
          />
          <ContactRow
            icon={<AccessTimeIcon />}
            label="Response Time"
            value="Within 24 hours"
          />
        </Paper>

        <Paper elevation={0} sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 3, p: { xs: 3, sm: 4 } }}>
          <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#FFD700', fontSize: 16, mb: 1.5 }}>
            Before You Write
          </Typography>
          <Typography sx={{ color: '#888', fontSize: 14, lineHeight: 1.8 }}>
            For questions about your plan, issues with your download, or payment concerns — email us with your registered email address and order details. We will resolve it as quickly as possible.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
