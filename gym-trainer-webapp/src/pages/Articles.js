import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const articles = [
  { tag: 'Nutrition', title: 'Top 5 Foods for Muscle Growth', summary: 'The best whole foods to fuel your workouts, maximize protein synthesis, and accelerate muscle gain — no supplements required.', readTime: '4 min read' },
  { tag: 'Training',  title: 'Why Cardio Matters Even for Lifters', summary: "Cardio isn't just for weight loss. How cardiovascular fitness improves recovery, heart health, and your performance in the gym.", readTime: '5 min read' },
  { tag: 'Recovery',  title: 'Stretching: The Key to Injury Prevention', summary: 'Simple mobility and stretching routines that keep you flexible, reduce injury risk, and help you train consistently for years.', readTime: '6 min read' },
  { tag: 'Nutrition', title: 'Eating for Fat Loss vs. Muscle Gain', summary: "Understand the core dietary differences between a cut and a bulk — and how to do both without losing what you've built.", readTime: '7 min read' },
  { tag: 'Training',  title: 'Progressive Overload: The Only Rule That Matters', summary: "If you're not progressively overloading, you're not growing. A practical guide to applying this principle whether you train at home or the gym.", readTime: '5 min read' },
  { tag: 'Mindset',   title: 'How to Stay Consistent When Motivation Disappears', summary: 'Motivation is temporary. This is how to build the systems and habits that make going to the gym feel automatic.', readTime: '4 min read' },
];

const TAG_COLORS = {
  Nutrition: '#4CAF50',
  Training:  '#FFD700',
  Recovery:  '#2196F3',
  Mindset:   '#9C27B0',
};

function ArticleCard({ article }) {
  const color = TAG_COLORS[article.tag] || '#FFD700';
  return (
    <Box sx={{
      bgcolor: '#111',
      border: '1px solid #1A1A1A',
      borderRadius: 3, p: 3,
      display: 'flex', flexDirection: 'column',
      height: '100%',
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: 'pointer',
      '&:hover': { borderColor: 'rgba(255,215,0,0.3)', transform: 'translateY(-2px)' },
    }}>
      <Box sx={{
        display: 'inline-block', mb: 2,
        bgcolor: `${color}18`,
        color, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', px: 1.5, py: 0.4, borderRadius: '6px',
      }}>{article.tag}</Box>

      <Typography sx={{
        fontFamily: 'Montserrat,sans-serif', fontWeight: 800,
        fontSize: 17, color: '#fff', lineHeight: 1.3, mb: 1.5, flex: 0,
      }}>{article.title}</Typography>

      <Typography sx={{ fontSize: 14, color: '#888', lineHeight: 1.7, mb: 3, flex: 1 }}>
        {article.summary}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 12, color: '#555' }}>{article.readTime}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#FFD700', fontSize: 13, fontWeight: 700 }}>
          Read <ArrowForwardIcon sx={{ fontSize: 13 }} />
        </Box>
      </Box>
    </Box>
  );
}

export default function Articles() {
  return (
    <Box sx={{ bgcolor: '#000', pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 16 } }}>
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: 560, mb: { xs: 6, md: 10 } }}>
          <Typography sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#FFD700', mb: 2,
          }}>
            <Box component="span" sx={{ display: 'inline-block', width: 20, height: 1.5, bgcolor: '#FFD700', borderRadius: 1 }} />
            Fitness Knowledge
          </Typography>
          <Typography sx={{
            fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
            fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.1,
            color: '#fff', mb: 2,
          }}>Articles & Guides</Typography>
          <Typography sx={{ fontSize: 16, color: '#888', lineHeight: 1.7 }}>
            Evidence-based content on training, nutrition, recovery, and mindset — written by Coach DK.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {articles.map((article, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <ArticleCard article={article} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
