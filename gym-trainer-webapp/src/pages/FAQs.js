import React from 'react';
import { Container, Paper, Typography, Box, List, ListItem, ListItemText } from '@mui/material';

export default function FAQs() {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={8} sx={{ width: '100%', p: { xs: 3, sm: 5 }, borderRadius: 5, bgcolor: '#181818', color: '#fff', textAlign: 'center', boxShadow: '0 4px 24px #FFD70033' }}>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#FFD700', mb: 2, letterSpacing: 1.5, fontFamily: 'Montserrat, serif' }}>
          FAQs
        </Typography>
        <List sx={{ mt: 2 }}>
          <ListItem>
            <ListItemText
              primary={<Typography sx={{ color: '#FFD700', fontWeight: 700 }}>How do I sign up?</Typography>}
              secondary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Click the Signup button on the homepage.</Typography>}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={<Typography sx={{ color: '#FFD700', fontWeight: 700 }}>How do I get a diet plan?</Typography>}
              secondary={<Typography sx={{ color: '#fff', fontWeight: 500 }}>Fill out the Personalize Diet form.</Typography>}
            />
          </ListItem>
        </List>
      </Paper>
    </Container>
  );
}
