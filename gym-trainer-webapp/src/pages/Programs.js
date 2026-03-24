import React, { useEffect } from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';

const PLANS = [
  {
    id: 'diet',
    tag: 'Diet',
    label: 'NUTRITION PLAN',
    subtitle: 'Personalized for your body & taste',
    price: 1999,
    accent: '#FFD700',
    gradient: 'linear-gradient(145deg, rgba(255,215,0,0.15), rgba(255,215,0,0.03))',
    borderGrad: 'linear-gradient(145deg, #FFD70044, #FFD70011)',
    barColor: 'linear-gradient(90deg, #FFD700, #B8860B)',
    btnBg: 'linear-gradient(135deg, #FFD700 0%, #FFC200 100%)',
    btnHover: 'linear-gradient(135deg, #FFE033 0%, #FFD700 100%)',
    btnColor: '#000',
    btnShadow: 'rgba(255,215,0,0.35)',
    features: [
      'AI-generated personalized meal plan',
      'North Indian / South Indian / Both',
      'Food allergy customization',
      'Goal-based macros (fat loss / muscle gain)',
      'Instant PDF download',
    ],
    path: '/personalize-diet',
  },
  {
    id: 'workout',
    tag: 'Training',
    label: 'WORKOUT PLAN',
    subtitle: 'Built for your level & equipment',
    price: 2499,
    accent: '#60A5FA',
    gradient: 'linear-gradient(145deg, rgba(96,165,250,0.12), rgba(96,165,250,0.03))',
    borderGrad: 'linear-gradient(145deg, #60A5FA44, #60A5FA11)',
    barColor: 'linear-gradient(90deg, #60A5FA, #2196F3)',
    btnBg: 'linear-gradient(135deg, #60A5FA 0%, #2196F3 100%)',
    btnHover: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)',
    btnColor: '#000',
    btnShadow: 'rgba(96,165,250,0.35)',
    features: [
      'Custom workout program',
      'Beginner / Intermediate / Advanced',
      'Home or gym — your choice',
      'Progressive overload built-in',
      'Instant PDF download',
    ],
    path: '/personalize-workout',
  },
  {
    id: 'combo',
    tag: 'Best Value',
    label: 'COMBO PLAN',
    subtitle: 'Diet + Workout — maximum results',
    price: 3499,
    accent: '#FFD700',
    gradient: 'linear-gradient(145deg, rgba(255,215,0,0.1), rgba(255,215,0,0.02))',
    borderGrad: 'linear-gradient(145deg, #FFD700, #FFF8DC 40%, #B8860B)',
    barColor: 'linear-gradient(90deg, #FFD700, #FFF8DC, #FFD700)',
    btnBg: 'linear-gradient(135deg, #FFD700 0%, #FFC200 100%)',
    btnHover: 'linear-gradient(135deg, #FFE033 0%, #FFD700 100%)',
    btnColor: '#000',
    btnShadow: 'rgba(255,215,0,0.35)',
    bestValue: true,
    features: [
      'Full personalized diet plan',
      'Full personalized workout plan',
      'North/South Indian cuisine',
      'Home or gym workout',
      'Maximum fat loss & muscle gain',
      'Instant PDF download',
    ],
    path: '/personalize-combo',
  },
];

export default function Programs() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { message: 'Please log in to view programs.' } });
    }
  }, [navigate]);

  return (
    <Box sx={{ bgcolor: '#080808', minHeight: '100vh', pt: { xs: 10, md: 14 }, pb: { xs: 10, md: 16 } }}>
      {/* Background glow */}
      <Box sx={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '40vh',
        background: 'radial-gradient(ellipse 80% 50% at 50% -5%, rgba(255,215,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Heading */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1.5 }}>
            — Premium Programs —
          </Typography>
          <Typography sx={{
            fontFamily: 'Cinzel,serif', fontWeight: 900,
            fontSize: { xs: '2rem', md: '3.2rem' }, color: '#fff', mb: 2,
          }}>
            Choose Your Plan
          </Typography>
          <Typography sx={{ color: '#555', fontSize: 15, maxWidth: 440, mx: 'auto', lineHeight: 1.8 }}>
            One-time payment. Instant delivery. 100% personalised — no templates.
          </Typography>
        </Box>

        {/* Plan Cards */}
        <Grid container spacing={3} alignItems="stretch">
          {PLANS.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Box sx={{
                position: 'relative',
                borderRadius: '22px',
                p: '1.5px',
                background: plan.borderGrad,
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 32px 80px ${plan.btnShadow.replace('0.35', '0.2')}`,
                },
              }}>
                {plan.bestValue && (
                  <Box sx={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg, #FFD700, #FFF8DC)',
                    color: '#000', fontSize: 10, fontWeight: 900, letterSpacing: '0.15em',
                    px: 2.5, py: 0.7, borderRadius: '99px',
                    fontFamily: 'Montserrat,sans-serif', whiteSpace: 'nowrap',
                    boxShadow: '0 4px 20px rgba(255,215,0,0.4)', zIndex: 2,
                  }}>✦ BEST VALUE</Box>
                )}

                <Box sx={{
                  background: 'linear-gradient(160deg, #131313 0%, #0c0c0c 100%)',
                  borderRadius: '21px',
                  p: { xs: 3.5, md: 4.5 },
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {/* Top bar */}
                  <Box sx={{ width: 44, height: 3, borderRadius: 1, background: plan.barColor, mb: 3.5 }} />

                  {/* Tag */}
                  <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.8, mb: 2.5,
                    bgcolor: `${plan.accent}12`, border: `1px solid ${plan.accent}28`,
                    px: 1.5, py: 0.6, borderRadius: '8px', alignSelf: 'flex-start',
                  }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: plan.accent }} />
                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: plan.accent, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      {plan.tag}
                    </Typography>
                  </Box>

                  {/* Plan name */}
                  <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 13, color: '#555', letterSpacing: '0.12em', mb: 0.5 }}>
                    {plan.label}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#444', mb: 3 }}>{plan.subtitle}</Typography>

                  {/* Price */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 4 }}>
                    <Typography sx={{ fontSize: 18, color: '#555', fontWeight: 700 }}>₹</Typography>
                    <Typography sx={{
                      fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
                      fontSize: { xs: 52, md: 60 }, lineHeight: 1,
                      background: `linear-gradient(135deg, ${plan.accent}, #fff 70%)`,
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {plan.price.toLocaleString('en-IN')}
                    </Typography>
                  </Box>

                  {/* Divider */}
                  <Box sx={{ height: 1, bgcolor: '#1e1e1e', mb: 3 }} />

                  {/* Features */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.4, mb: 4 }}>
                    {plan.features.map((f, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{
                          width: 18, height: 18, borderRadius: '50%',
                          bgcolor: `${plan.accent}18`, border: `1px solid ${plan.accent}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, mt: 0.15,
                        }}>
                          <CheckIcon sx={{ fontSize: 10, color: plan.accent }} />
                        </Box>
                        <Typography sx={{ fontSize: 13.5, color: '#888', lineHeight: 1.5 }}>{f}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* CTA */}
                  <Button
                    fullWidth
                    onClick={() => navigate(plan.path)}
                    sx={{
                      background: plan.btnBg,
                      color: plan.btnColor,
                      fontWeight: 800, py: 1.7, fontSize: 14,
                      borderRadius: '14px',
                      fontFamily: 'Montserrat,sans-serif', letterSpacing: '0.04em',
                      boxShadow: `0 6px 28px ${plan.btnShadow}`,
                      transition: 'all 0.25s',
                      '&:hover': {
                        background: plan.btnHover,
                        boxShadow: `0 10px 40px ${plan.btnShadow.replace('0.35', '0.5')}`,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >BUY NOW →</Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Trust strip */}
        <Box sx={{
          mt: 6, p: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)',
          border: '1px solid #1e1e1e', borderRadius: '18px',
          display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center',
        }}>
          {[
            { icon: '⚡', text: 'Plan generated in 2–5 minutes' },
            { icon: '🔒', text: 'Secure Razorpay payments' },
            { icon: '📄', text: 'Instant PDF download' },
            { icon: '🎯', text: '100% personalised — no templates' },
          ].map(({ icon, text }) => (
            <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 16 }}>{icon}</Typography>
              <Typography sx={{ fontSize: 13, color: '#666' }}>{text}</Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
