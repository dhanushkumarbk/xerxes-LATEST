import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#FFD700', fontSize: 16, mb: 1.5 }}>
        {title}
      </Typography>
      <Typography sx={{ color: '#888', fontSize: 14, lineHeight: 1.9 }}>{children}</Typography>
    </Box>
  );
}

export default function Privacy() {
  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 16 } }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: { xs: 26, md: 36 }, color: '#FFD700', letterSpacing: 2, mb: 1 }}>
            Privacy Policy
          </Typography>
          <Typography sx={{ color: '#555', fontSize: 13 }}>Last updated: January 2025</Typography>
        </Box>

        <Paper elevation={0} sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 3, p: { xs: 3, sm: 5 } }}>
          <Section title="1. Information We Collect">
            We collect information you provide during account registration (name, email, phone, date of birth) and when filling personalisation forms (body stats, health history, goals). We also collect payment transaction references processed via Razorpay — we do not store card numbers or banking credentials.
          </Section>
          <Section title="2. How We Use Your Information">
            Your information is used exclusively to generate your personalised fitness or diet plan, manage your account, process payments, and respond to support requests. We do not use your data for advertising or sell it to third parties.
          </Section>
          <Section title="3. Data Storage">
            Your data is stored securely on Azure cloud infrastructure with encryption at rest and in transit. Account data and generated plans are retained for the duration of your account. You may request deletion at any time.
          </Section>
          <Section title="4. Third-Party Services">
            We use Razorpay for payment processing and Google's AI services for plan generation. These services have their own privacy policies. We only share the minimum data required for these services to function.
          </Section>
          <Section title="5. Cookies">
            We use session tokens (JWT) stored in your browser's localStorage for authentication. We do not use tracking cookies or third-party analytics beyond what is necessary for service functionality.
          </Section>
          <Section title="6. Your Rights">
            You may request access to, correction of, or deletion of your personal data at any time by contacting us at dhanushkumar102@gmail.com. We will respond within 7 business days.
          </Section>
          <Section title="7. Contact">
            For privacy concerns, contact: dhanushkumar102@gmail.com
          </Section>
        </Paper>
      </Container>
    </Box>
  );
}
