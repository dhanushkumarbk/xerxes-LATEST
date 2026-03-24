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

export default function RefundPolicy() {
  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 16 } }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: { xs: 26, md: 36 }, color: '#FFD700', letterSpacing: 2, mb: 1 }}>
            Refund Policy
          </Typography>
          <Typography sx={{ color: '#555', fontSize: 13 }}>Last updated: January 2025</Typography>
        </Box>

        <Paper elevation={0} sx={{ bgcolor: '#111', border: '1px solid #222', borderRadius: 3, p: { xs: 3, sm: 5 } }}>
          <Section title="Eligibility for Refund">
            We offer a full refund within 7 days of purchase if you are not satisfied with your plan. To be eligible, you must contact us within 7 days of the transaction date with your registered email address and order/payment ID.
          </Section>
          <Section title="Non-Refundable Cases">
            Refunds will not be issued if: the plan has been downloaded more than once; more than 7 days have passed since purchase; the request is made without a valid reason; or the plan generation failed due to incomplete or incorrect information provided in the form (in which case we will regenerate your plan).
          </Section>
          <Section title="How to Request a Refund">
            Email us at dhanushkumar102@gmail.com with the subject line "Refund Request — [your registered email]". Include your payment ID or Razorpay transaction reference. We will review and process your request within 5 business days.
          </Section>
          <Section title="Refund Processing">
            Approved refunds will be credited to your original payment method via Razorpay within 5–7 business days. The exact timeline depends on your bank or payment provider.
          </Section>
          <Section title="Plan Regeneration">
            If your plan was not generated due to a technical error on our end, we will regenerate your plan at no extra charge — regardless of the 7-day window.
          </Section>
          <Section title="Contact">
            Refund requests: dhanushkumar102@gmail.com
          </Section>
        </Paper>
      </Container>
    </Box>
  );
}
