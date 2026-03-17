import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const articles = [
  {
    title: 'Top 5 Foods for Muscle Growth',
    summary: 'Discover the best foods to fuel your workouts and maximize muscle gain.',
  },
  {
    title: 'Why Cardio Matters',
    summary: 'Learn how cardiovascular exercise benefits your heart, body, and mind.',
  },
  {
    title: 'Stretching: The Key to Injury Prevention',
    summary: 'Simple stretching routines to keep you flexible and injury-free.',
  },
];

const Articles = () => (
  <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box sx={{ width: '100%', py: { xs: 3, sm: 6 } }}>
      <Typography variant="h3" fontWeight={900} sx={{ color: '#FFD700', mb: 4, letterSpacing: 1.5, fontFamily: 'Montserrat, serif', textAlign: 'center', fontSize: { xs: 28, sm: 34 } }}>
        Fitness & Nutrition Articles
      </Typography>
      <Box display="flex" flexDirection="column" gap={3}>
        {articles.map((article, idx) => (
          <Paper key={idx} elevation={8} sx={{ bgcolor: '#181818', color: '#fff', borderRadius: 4, p: { xs: 2.5, sm: 4 }, boxShadow: '0 2px 18px #FFD70022', border: '1.5px solid #FFD700' }}>
            <Typography variant="h5" fontWeight={800} sx={{ color: '#FFD700', mb: 1, fontFamily: 'Montserrat, serif', fontSize: { xs: 19, sm: 22 } }}>{article.title}</Typography>
            <Typography variant="body1" sx={{ color: '#C0C0C0', fontWeight: 500, fontSize: { xs: 15, sm: 17 } }}>{article.summary}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  </Container>
);

export default Articles;
