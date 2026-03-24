import React from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import BoltIcon from '@mui/icons-material/Bolt';
import VerifiedIcon from '@mui/icons-material/Verified';
import DownloadIcon from '@mui/icons-material/Download';

const getUser = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };

/* ── Reusable gradient text ─────────────────────────────────────── */
function GoldText({ children, sx = {} }) {
  return (
    <Box component="span" sx={{
      background: 'linear-gradient(135deg, #FFD700 0%, #FFF8DC 45%, #FFD700 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      ...sx,
    }}>{children}</Box>
  );
}

/* ── Plan Card ──────────────────────────────────────────────────── */
function PlanCard({ tag, title, price, features, ctaLabel, ctaPath, accent = '#FFD700', gradient, highlighted = false }) {
  const navigate = useNavigate();
  return (
    <Box sx={{
      position: 'relative',
      borderRadius: '20px',
      p: '1.5px',
      background: highlighted
        ? 'linear-gradient(145deg, #FFD700, #FFF8DC 40%, #B8860B)'
        : `linear-gradient(145deg, ${accent}44, ${accent}11)`,
      height: '100%',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-6px)',
        boxShadow: highlighted
          ? '0 24px 64px rgba(255,215,0,0.25)'
          : `0 24px 64px ${accent}22`,
      },
    }}>
      {highlighted && (
        <Box sx={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #FFD700, #FFF8DC)',
          color: '#000', fontSize: 10, fontWeight: 900,
          letterSpacing: '0.15em', px: 2.5, py: 0.7, borderRadius: '99px',
          fontFamily: 'Montserrat,sans-serif', whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(255,215,0,0.4)',
        }}>✦ BEST VALUE</Box>
      )}
      <Box sx={{
        bgcolor: '#0D0D0D',
        borderRadius: '18.5px',
        p: { xs: 3, md: 4 },
        height: '100%',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(160deg, #141414 0%, #0a0a0a 100%)',
      }}>
        {/* Top accent bar */}
        <Box sx={{ width: 40, height: 3, borderRadius: 1, background: gradient || `linear-gradient(90deg, ${accent}, ${accent}88)`, mb: 3 }} />

        <Box sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.8, mb: 2,
          bgcolor: `${accent}12`, border: `1px solid ${accent}30`,
          px: 1.5, py: 0.5, borderRadius: '6px', alignSelf: 'flex-start',
        }}>
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: accent }} />
          <Typography sx={{ fontSize: 10, fontWeight: 800, color: accent, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {tag}
          </Typography>
        </Box>

        <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 21, color: '#fff', mb: 0.5 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 3 }}>
          <Typography sx={{ fontSize: 11, color: '#555', fontWeight: 600 }}>₹</Typography>
          <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 44, color: '#fff', lineHeight: 1 }}>
            {price}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#555' }}>one-time</Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.2, mb: 3.5 }}>
          {features.map((f, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CheckIcon sx={{ fontSize: 14, color: accent, mt: 0.35, flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13.5, color: '#999', lineHeight: 1.5 }}>{f}</Typography>
            </Box>
          ))}
        </Box>

        <Button
          fullWidth
          onClick={() => navigate(ctaPath)}
          sx={{
            background: highlighted
              ? 'linear-gradient(135deg, #FFD700 0%, #FFC200 100%)'
              : `${accent}18`,
            color: highlighted ? '#000' : accent,
            fontWeight: 800, py: 1.5, fontSize: 13.5,
            borderRadius: '12px',
            fontFamily: 'Montserrat,sans-serif',
            letterSpacing: '0.05em',
            border: highlighted ? 'none' : `1px solid ${accent}30`,
            boxShadow: highlighted ? '0 4px 24px rgba(255,215,0,0.3)' : 'none',
            transition: 'all 0.2s',
            '&:hover': {
              background: highlighted
                ? 'linear-gradient(135deg, #FFE033 0%, #FFD700 100%)'
                : `${accent}28`,
              boxShadow: highlighted ? '0 6px 32px rgba(255,215,0,0.45)' : 'none',
              transform: 'translateY(-1px)',
            },
          }}
        >{ctaLabel}</Button>
      </Box>
    </Box>
  );
}

/* ── Testimonial ────────────────────────────────────────────────── */
function Testimonial({ quote, name, result, city }) {
  return (
    <Box sx={{
      background: 'linear-gradient(160deg, #141414 0%, #0d0d0d 100%)',
      border: '1px solid #1e1e1e',
      borderRadius: '16px', p: 3.5,
      transition: 'border-color 0.2s, transform 0.2s',
      '&:hover': { borderColor: 'rgba(255,215,0,0.2)', transform: 'translateY(-3px)' },
    }}>
      <Box sx={{ display: 'flex', gap: 0.4, mb: 2.5 }}>
        {[...Array(5)].map((_, i) => (
          <Box key={i} component="span" sx={{ color: '#FFD700', fontSize: 14 }}>★</Box>
        ))}
      </Box>
      <Typography sx={{ fontSize: 14, color: '#888', lineHeight: 1.8, mb: 3, fontStyle: 'italic' }}>
        "{quote}"
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{name}</Typography>
          <Typography sx={{ fontSize: 11, color: '#555' }}>{city}</Typography>
        </Box>
        <Box sx={{
          background: 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))',
          border: '1px solid rgba(76,175,80,0.2)',
          color: '#4CAF50', fontSize: 11, fontWeight: 700,
          px: 1.5, py: 0.5, borderRadius: '8px',
        }}>{result}</Box>
      </Box>
    </Box>
  );
}

/* ── FAQ ────────────────────────────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Box onClick={() => setOpen(o => !o)} sx={{
      borderBottom: '1px solid #1a1a1a', py: 2.5, cursor: 'pointer',
      '&:last-child': { borderBottom: 'none' },
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: open ? '#fff' : '#aaa', transition: 'color 0.2s' }}>{q}</Typography>
        <Box sx={{
          width: 28, height: 28, borderRadius: '50%',
          border: `1px solid ${open ? 'rgba(255,215,0,0.4)' : '#2a2a2a'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'all 0.2s', transform: open ? 'rotate(45deg)' : 'none',
          bgcolor: open ? 'rgba(255,215,0,0.08)' : 'transparent',
        }}>
          <Box component="span" sx={{ color: open ? '#FFD700' : '#555', fontSize: 20, lineHeight: 1, mt: '-2px' }}>+</Box>
        </Box>
      </Box>
      {open && (
        <Typography sx={{ fontSize: 14, color: '#666', mt: 1.5, lineHeight: 1.8, pr: 4 }}>{a}</Typography>
      )}
    </Box>
  );
}

/* ── Home Page ──────────────────────────────────────────────────── */
export default function Home({ onLogoClick }) {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <Box sx={{ bgcolor: '#080808' }}>

      {/* ═══════ HERO ═══════════════════════════════════════════════ */}
      <Box sx={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        pt: { xs: 10, md: 12 }, pb: { xs: 8, md: 12 },
        overflow: 'hidden',
      }}>
        {/* Background radial glow */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(255,215,0,0.07) 0%, transparent 65%)',
        }} />
        {/* Subtle grid overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.025,
          backgroundImage: 'linear-gradient(rgba(255,215,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 780 }}>
            {/* Pill badge */}
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1.2,
              background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,215,0,0.04))',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: '99px', px: 2.2, py: 0.9, mb: 4,
            }}>
              <Box sx={{
                width: 7, height: 7, borderRadius: '50%', bgcolor: '#FFD700',
                boxShadow: '0 0 8px rgba(255,215,0,0.8)',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.4 },
                },
              }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#FFD700', letterSpacing: '0.07em' }}>
                Elite Fitness Coaching · Since 2019
              </Typography>
            </Box>

            {/* Main heading */}
            <Typography variant="h1" sx={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900,
              fontSize: { xs: '3rem', sm: '4rem', md: '5.5rem', lg: '6.5rem' },
              lineHeight: 1,
              letterSpacing: '0.02em',
              color: '#fff',
              mb: 2,
            }}>
              TRAIN LIKE<br />
              <GoldText>A KING.</GoldText>
            </Typography>

            <Typography sx={{
              fontSize: { xs: 15, md: 18 }, color: '#666',
              maxWidth: 520, lineHeight: 1.8, mb: 5,
            }}>
              AI-generated, fully personalized workout and diet plans — built by Coach DK with 6+ years of transformation coaching.
            </Typography>

            {/* CTA buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 5 }}>
              <Button
                onClick={() => navigate(user ? '/programs' : '/signup')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFC200 100%)',
                  color: '#000', fontWeight: 800,
                  px: 4, py: 1.6, fontSize: 14, borderRadius: '12px',
                  fontFamily: 'Montserrat,sans-serif', letterSpacing: '0.04em',
                  boxShadow: '0 8px 32px rgba(255,215,0,0.35)',
                  transition: 'all 0.25s',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFE033 0%, #FFD700 100%)',
                    boxShadow: '0 12px 40px rgba(255,215,0,0.5)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {user ? 'View Programs' : 'Get My Plan'}
              </Button>
              <Button
                component={Link} to="/about"
                sx={{
                  color: '#888', fontWeight: 600, px: 3.5, py: 1.6,
                  fontSize: 14, borderRadius: '12px',
                  border: '1px solid #2a2a2a',
                  transition: 'all 0.2s',
                  '&:hover': { border: '1px solid #444', color: '#ccc', bgcolor: 'rgba(255,255,255,0.02)' },
                }}
              >Meet the Coach</Button>
            </Box>

            {/* Trust signals */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{ display: 'flex' }}>
                  {['#E8956D','#6DB5D4','#FFD700','#94C47D'].map((c,i) => (
                    <Box key={i} sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: c, border: '2px solid #080808', ml: i > 0 ? -1 : 0 }} />
                  ))}
                </Box>
                <Typography sx={{ fontSize: 12, color: '#555' }}>500+ transformed</Typography>
              </Box>
              <Box sx={{ width: 1, height: 18, bgcolor: '#1e1e1e' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {[...Array(5)].map((_,i) => <Box key={i} component="span" sx={{ color: '#FFD700', fontSize: 13 }}>★</Box>)}
                <Typography sx={{ fontSize: 12, color: '#555', ml: 0.5 }}>4.9 / 5</Typography>
              </Box>
              <Box sx={{ width: 1, height: 18, bgcolor: '#1e1e1e' }} />
              <Typography sx={{ fontSize: 12, color: '#555' }}>🔒 Secured by Razorpay</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ═══════ STATS BAR ══════════════════════════════════════════ */}
      <Box sx={{
        borderTop: '1px solid #161616', borderBottom: '1px solid #161616',
        background: 'linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)',
        py: { xs: 6, md: 8 },
      }}>
        <Container maxWidth="lg">
          <Grid container justifyContent="center" alignItems="center" spacing={{ xs: 3, md: 0 }}>
            {[
              { value: '500+', label: 'Clients Transformed' },
              { value: '98%',  label: 'Satisfaction Rate' },
              { value: '6+',   label: 'Years Experience' },
              { value: 'Pan-India', label: 'Reach' },
            ].map((s, i) => (
              <React.Fragment key={i}>
                <Grid item xs={6} md={3} sx={{ textAlign: 'center' }}>
                  <Typography sx={{
                    fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
                    fontSize: { xs: '2rem', md: '2.8rem' },
                    background: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', lineHeight: 1,
                  }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#555', mt: 0.8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</Typography>
                </Grid>
                {i < 3 && <Grid item sx={{ display: { xs: 'none', md: 'block' } }}>
                  <Box sx={{ width: 1, height: 50, bgcolor: '#1a1a1a', mx: 2 }} />
                </Grid>}
              </React.Fragment>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════ HOW IT WORKS ═══════════════════════════════════════ */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1.5 }}>
              — Process —
            </Typography>
            <Typography sx={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.6rem' }, color: '#fff' }}>
              Simple. Fast. Powerful.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {[
              { step: '01', icon: <VerifiedIcon sx={{ fontSize: 28, color: '#FFD700' }} />, title: 'Create Account', desc: 'Sign up in 60 seconds. Share your goals, body stats, dietary preferences, and fitness level.' },
              { step: '02', icon: <BoltIcon sx={{ fontSize: 28, color: '#FFD700' }} />, title: 'Pay & Personalise', desc: 'One-time Razorpay payment. Fill your personalisation form. AI generates your custom plan in minutes.' },
              { step: '03', icon: <DownloadIcon sx={{ fontSize: 28, color: '#FFD700' }} />, title: 'Download & Transform', desc: 'Get your premium PDF instantly. Follow your personalised plan and see real results.' },
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Box sx={{
                  background: 'linear-gradient(160deg, #121212 0%, #0d0d0d 100%)',
                  border: '1px solid #1e1e1e',
                  borderRadius: '20px', p: { xs: 3, md: 4 },
                  height: '100%',
                  transition: 'border-color 0.3s, transform 0.3s',
                  position: 'relative', overflow: 'hidden',
                  '&:hover': { borderColor: 'rgba(255,215,0,0.25)', transform: 'translateY(-4px)' },
                  '&::before': {
                    content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)',
                    opacity: 0, transition: 'opacity 0.3s',
                  },
                  '&:hover::before': { opacity: 1 },
                }}>
                  <Typography sx={{
                    fontFamily: 'Montserrat,sans-serif', fontWeight: 900,
                    fontSize: 72, color: 'rgba(255,215,0,0.05)',
                    lineHeight: 0.9, position: 'absolute', top: 20, right: 24,
                    userSelect: 'none',
                  }}>{item.step}</Typography>
                  <Box sx={{
                    width: 52, height: 52,
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,215,0,0.04))',
                    border: '1px solid rgba(255,215,0,0.2)',
                    borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mb: 3,
                  }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, fontSize: 17, color: '#fff', mb: 1.5 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════ PLANS ══════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 10, md: 16 }, background: 'linear-gradient(180deg, #080808 0%, #0d0d0d 50%, #080808 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1.5 }}>
              — Programs —
            </Typography>
            <Typography sx={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.6rem' }, color: '#fff', mb: 1.5 }}>
              Pick Your Plan
            </Typography>
            <Typography sx={{ fontSize: 15, color: '#555', maxWidth: 480, mx: 'auto' }}>
              No templates. No guesswork. 100% personalised to your body and goals.
            </Typography>
          </Box>

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <PlanCard
                tag="Diet" title="Nutrition Plan" price="1999"
                features={['AI-generated personalized meal plan','North / South Indian cuisine','Food allergy customization','Goal-based macros','Instant PDF download']}
                ctaLabel="Get Diet Plan" ctaPath="/personalize-diet"
                accent="#FFD700" gradient="linear-gradient(90deg, #FFD700, #B8860B)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PlanCard
                tag="Training" title="Workout Plan" price="2499"
                features={['Custom workout program','Beginner / Intermediate / Advanced','Home or gym — your choice','Progressive overload built-in','Instant PDF download']}
                ctaLabel="Get Workout Plan" ctaPath="/personalize-workout"
                accent="#60A5FA" gradient="linear-gradient(90deg, #60A5FA, #2196F3)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <PlanCard
                tag="Combo" title="Full Transformation" price="3499"
                features={['Full personalized diet plan','Full personalized workout plan','North/South Indian cuisine','Home or gym workout','Maximum fat loss & muscle gain','Instant PDF download']}
                ctaLabel="Get Combo Plan" ctaPath="/personalize-combo"
                highlighted gradient="linear-gradient(90deg, #FFD700, #FFF8DC)"
              />
            </Grid>
          </Grid>

          {/* Trust strip */}
          <Box sx={{
            mt: 5, p: { xs: 2.5, md: 3.5 },
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)',
            border: '1px solid #1e1e1e', borderRadius: '16px',
            display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center',
          }}>
            {[
              { icon: '⚡', text: 'Plan ready in 2–5 minutes' },
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

      {/* ═══════ TESTIMONIALS ═══════════════════════════════════════ */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: { xs: 6, md: 10 } }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1.5 }}>
              — Results —
            </Typography>
            <Typography sx={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.6rem' }, color: '#fff' }}>
              Real People. Real Results.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {[
              { quote: "Coach DK's diet plan completely changed how I eat. Down 8kg in 3 months without starving — the South Indian plan was so practical.", name: 'Kavya S.', result: '−8 kg in 3 months', city: 'Chennai' },
              { quote: "I tried generic YouTube routines for years. Having a workout plan made specifically for my gym setup is a completely different experience.", name: 'Arjun M.', result: '+5 kg muscle', city: 'Bangalore' },
              { quote: "The combo plan is insane value. Both plans complement each other perfectly. I went from 28% to 19% body fat in 12 weeks.", name: 'Priya R.', result: '−9% body fat', city: 'Mumbai' },
            ].map((t, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Testimonial {...t} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══════ COACH ══════════════════════════════════════════════ */}
      <Box sx={{
        py: { xs: 10, md: 16 },
        background: 'linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)',
        borderTop: '1px solid #161616', borderBottom: '1px solid #161616',
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 10 }} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box sx={{
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #141414, #0d0d0d)',
                border: '1px solid #1e1e1e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 360, position: 'relative', overflow: 'hidden',
                p: 4,
              }}>
                {/* Glow behind logo */}
                <Box sx={{
                  position: 'absolute', inset: 0,
                  background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,215,0,0.06) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <img src="/xerxes-logo.png" alt="Coach DK"
                  style={{ width: '65%', objectFit: 'contain', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 24px rgba(255,215,0,0.2))' }}
                />
                <Box sx={{
                  position: 'absolute', bottom: 20, left: 20,
                  background: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  borderRadius: '12px', px: 2.5, py: 1.5,
                }}>
                  <Typography sx={{ fontSize: 10, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.3 }}>Transformations</Typography>
                  <Typography sx={{
                    fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 26,
                    background: 'linear-gradient(135deg, #FFD700, #FFF8DC)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text', lineHeight: 1,
                  }}>500+</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1.5 }}>
                — About the Coach —
              </Typography>
              <Typography sx={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: { xs: '2rem', md: '3rem' }, color: '#fff', mb: 3 }}>
                Coach DK
              </Typography>
              <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.9, mb: 2 }}>
                With over 6 years of hands-on coaching experience, I've helped 500+ people genuinely transform — not just for events, but for life.
              </Typography>
              <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.9, mb: 4 }}>
                No templates. No guesswork. Every plan I build is specific to your body, your goals, and your lifestyle — backed by science, built for real-world execution.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 4 }}>
                {['Muscle Gain', 'Fat Loss', 'Nutrition', 'South Indian Diet', 'Home Workouts', 'Athlete Training'].map(tag => (
                  <Box key={tag} sx={{
                    background: 'rgba(255,215,0,0.06)',
                    border: '1px solid rgba(255,215,0,0.15)',
                    borderRadius: '8px', px: 1.8, py: 0.6,
                    fontSize: 12, color: '#aaa', fontWeight: 600,
                  }}>{tag}</Box>
                ))}
              </Box>
              <Button component={Link} to="/about" variant="outlined"
                sx={{
                  borderColor: 'rgba(255,215,0,0.3)', color: '#FFD700', fontWeight: 700,
                  px: 3.5, py: 1.3, borderRadius: '12px', fontSize: 14,
                  '&:hover': { borderColor: '#FFD700', bgcolor: 'rgba(255,215,0,0.05)' },
                }}
              >Read full story</Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════ FAQ ════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 10, md: 16 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 8 }}>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1.5 }}>
                — FAQ —
              </Typography>
              <Typography sx={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: '#fff', mb: 2 }}>
                Common Questions
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>
                Have more questions? Reach out — we respond within 24 hours.
              </Typography>
              <Button component={Link} to="/contact"
                sx={{ mt: 3, color: '#FFD700', fontWeight: 700, fontSize: 14, pl: 0,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                endIcon={<ArrowForwardIcon sx={{ fontSize: '14px !important' }} />}
              >Contact us</Button>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{
                background: 'linear-gradient(160deg, #121212 0%, #0d0d0d 100%)',
                border: '1px solid #1e1e1e', borderRadius: '20px',
                px: { xs: 3, md: 4.5 }, py: 1,
              }}>
                {[
                  { q: 'How will I receive my plan?', a: 'After payment and completing the personalisation form, your plan is generated instantly and available as a PDF download — usually within 2–5 minutes.' },
                  { q: 'Do I need supplements?', a: 'Supplements are optional. Your nutrition plan is built using whole, accessible Indian foods. No supplements required.' },
                  { q: "What if I'm vegetarian?", a: 'All diet plans are fully customizable — vegetarian, eggetarian, or non-vegetarian. Just select your preference in the form.' },
                  { q: 'Can I follow the workout at home?', a: 'Yes. You choose home or gym in the form. Your plan is built around whatever equipment you have.' },
                  { q: 'Is payment secure?', a: 'Yes. All payments are processed by Razorpay — the most trusted payment gateway in India. We never store your card details.' },
                ].map((faq, i) => <FAQItem key={i} {...faq} />)}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══════ CTA BANNER ═════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 12, md: 18 }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,215,0,0.06) 0%, transparent 70%)',
        }} />
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,215,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.8) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#FFD700', letterSpacing: '0.15em', textTransform: 'uppercase', mb: 2 }}>
            — Begin —
          </Typography>
          <Typography sx={{
            fontFamily: 'Cinzel,serif', fontWeight: 900,
            fontSize: { xs: '2rem', md: '3.5rem' },
            color: '#fff', lineHeight: 1.1, mb: 2,
          }}>
            Your Best Shape Is<br /><GoldText>One Program Away.</GoldText>
          </Typography>
          <Typography sx={{ fontSize: 16, color: '#555', mb: 5, maxWidth: 420, mx: 'auto', lineHeight: 1.8 }}>
            Join 500+ members who chose personalization over guesswork.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={() => navigate(user ? '/programs' : '/signup')}
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFC200 100%)',
                color: '#000', fontWeight: 800,
                px: 5, py: 1.8, fontSize: 15, borderRadius: '14px',
                fontFamily: 'Montserrat,sans-serif',
                boxShadow: '0 8px 40px rgba(255,215,0,0.35)',
                transition: 'all 0.25s',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFE033 0%, #FFD700 100%)',
                  boxShadow: '0 12px 50px rgba(255,215,0,0.5)',
                  transform: 'translateY(-3px)',
                },
              }}
            >{user ? 'Browse Programs' : 'Create Free Account'}</Button>
            <Button
              component={Link} to="/programs"
              size="large"
              sx={{
                borderColor: 'rgba(255,215,0,0.25)', color: '#888',
                fontWeight: 600, px: 4, py: 1.8, fontSize: 15,
                borderRadius: '14px', border: '1px solid rgba(255,215,0,0.2)',
                transition: 'all 0.2s',
                '&:hover': { border: '1px solid rgba(255,215,0,0.4)', color: '#FFD700' },
              }}
            >View Plans</Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
