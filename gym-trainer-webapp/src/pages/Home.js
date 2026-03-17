import React from 'react';
import { Box, Typography, Button, Grid, Card, Container, Link, Stack, Dialog } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AppleIcon from '@mui/icons-material/Apple';
import { useNavigate } from 'react-router-dom';

const offers = [
  {
    desc: 'On all annual plans. Limited period offer.',
    icon: <LocalOfferIcon color="#C0C0C0" sx={{ fontSize: 36 }} />,
    cta: 'Join Now',
    highlight: true
  },
  {
    title: 'FREE 1.5 Months Extension + Extra ₹750 OFF',
    desc: 'On select plans. Get more value for your fitness journey!',
    icon: <LocalOfferIcon color="#C0C0C0" sx={{ fontSize: 32 }} />,
    cta: 'View Plans',
    highlight: false
  },
  {
    title: 'FREE ₹750 Amazon Voucher + 1 Month Extension',
    desc: 'Special reward on premium memberships.',
    icon: <LocalOfferIcon color="#C0C0C0" sx={{ fontSize: 32 }} />,
    cta: 'Get Offer',
    highlight: false
  }
];

// const programs = [
//   {
//     name: 'Personal Training',
//     desc: '1-on-1 sessions with expert trainers for faster results.',
//     icon: <FitnessCenterIcon color="#C0C0C0" sx={{ fontSize: 32 }} />,
//     link: '/programs'
//   },
//   {
//     name: 'Nutrition & Wellness',
//     desc: 'Personalized meal plans and holistic wellness guidance.',
//     icon: <FitnessCenterIcon color="#C0C0C0" sx={{ fontSize: 32 }} />,
//     link: '/programs'
//   }
// ];

const quickLinks = [
  { label: 'Contact Us', url: '/about' },
  { label: 'Privacy Policy', url: '#' },
  { label: 'Terms & Conditions', url: '#' },
  { label: 'Careers', url: '#' },
  { label: 'Download App', url: '#' }
];

// const faqs = [
//   {
//     q: 'How will I get support? Who will monitor my progress?',
//     a: 'You will have direct access to me for support and regular progress check-ins.'
//   },
//   {
//     q: 'Do I need to take supplements?',
//     a: 'Supplements are optional. Your meal plan will be designed using whole foods, but I can provide a supplement guide if desired.'
//   },
//   {
//     q: 'Will I get results if I’m vegetarian?',
//     a: 'Absolutely! I will create a meal plan that fits your dietary preferences and ensures you get all the nutrients you need.'
//   },
//   {
//     q: 'What equipment do I need for home workouts?',
//     a: 'A pair of dumbbells is recommended for home workouts. I will tailor your plan to your available equipment.'
//   },
//   {
//     q: 'Can I sign up now and start later?',
//     a: 'Yes, you can sign up now and start your plan whenever you’re ready.'
//   }
// ];


const Home = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#000', height: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Hero Section */}
      <Box sx={{
        background: '#000',
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 4 },
        py: { xs: 6, sm: 8 },
        boxSizing: 'border-box',
      }}>

        <img
          src="/xerxes-logo.png"
          alt="Xerxes Logo"
          style={{
            height: 'clamp(160px, 30vw, 340px)',
            maxWidth: 'min(92vw, 400px)',
            margin: '0 auto 2vw auto',
            display: 'block',
            filter: 'brightness(1.18) grayscale(1)',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            borderRadius: 0,
            padding: 0,
            cursor: 'pointer',
          }}
          onClick={() => setOpen(true)}
        />
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            sx: {
              background: '#111',
              color: '#fff',
              borderRadius: 4,
              p: { xs: 2, sm: 4 },
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center',
              boxShadow: '0 6px 36px 0 #FFD70055',
            },
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
            <Box sx={{ minWidth: 90, display: 'flex', justifyContent: 'center' }}>
              <img
                src="/xerxes-gold.png"
                alt="Xerxes"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid #FFD700',
                  background: '#222',
                  boxShadow: '0 2px 18px #FFD70044',
                  margin: 0,
                }}
              />
            </Box>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h6" fontWeight={900} sx={{ color: '#FFD700 !important', mb: 1, fontFamily: 'Cinzel, serif', letterSpacing: 1, textShadow: '0 2px 8px #000', fontSize: { xs: 22, sm: 26, md: 28 } }}>
                King Xerxes I
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#FFD700 !important',
                  fontFamily: 'Cinzel, serif',
                  fontWeight: 700,
                  fontSize: { xs: 18, sm: 22, md: 26 },
                  letterSpacing: 1,
                  lineHeight: 1.5,
                  textShadow: '0 2px 12px #000',
                  mb: 1.5,
                }}
              >
                “King Xerxes I, the ruler of the Persian Empire, was known for his discipline and rigorous training of his armies. His preparation and endurance symbolized strength and resilience—qualities we embrace in modern physical training.”
              </Typography>
            </Box>
          </Box>
          <Button variant="outlined" onClick={() => setOpen(false)} sx={{ color: '#FFD700', borderColor: '#FFD700', borderRadius: 8, px: 4, py: 1, fontWeight: 700, '&:hover': { background: '#181818', borderColor: '#fff', color: '#fff' }, mt: 2 }}>
            Close
          </Button>
        </Dialog>
        <Typography variant="h2" fontWeight={900} sx={{
          color: '#fff',
          mt: { xs: 2, sm: 3, md: 5 },
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: 'clamp(1.6rem, 6vw, 2.2rem)', sm: 'clamp(2.1rem, 6vw, 2.8rem)', md: 'clamp(2.7rem, 6vw, 3.4rem)', lg: 'clamp(3.2rem, 6vw, 3.8rem)' },
          letterSpacing: 1,
          fontFamily: 'Inter, Arial, sans-serif',
          lineHeight: 1.13,
          textShadow: '0 2px 12px #000',
          textAlign: 'center',
          width: '100%',
          maxWidth: '90vw',
          mx: 'auto',
        }}>
          Transform Your Body. Elevate Your Life.
        </Typography>
      </Box>

      {/* Transformation Plan Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 10 }, mb: 2, flexShrink: 0 }}>
        <Card sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 6,
          background: '#111',
          boxShadow: 4,
          textAlign: 'center',
          color: '#fff'
        }}>
          <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', mb: 2 }}>
            12 Week Muscle Gain & Fat Loss Transformation Plan
          </Typography>
          <Typography variant="h6" sx={{ color: '#C0C0C0', mb: 3 }}>
            Personalized workouts and meal plans designed for guaranteed results.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              background: '#111',
              color: '#fff',
              fontWeight: 800,
              fontSize: 20,
              borderRadius: 6,
              px: 5,
              boxShadow: '0 4px 12px 0 rgba(0,0,0,0.08)'
            }}
            onClick={() => {
              const user = (() => {
                try {
                  return JSON.parse(localStorage.getItem('user'));
                } catch {
                  return null;
                }
              })();
              if (user) {
                navigate('/programs');
              } else {
                navigate('/login');
              }
            }}
          >
            {(() => {
              const user = (() => {
                try {
                  return JSON.parse(localStorage.getItem('user'));
                } catch {
                  return null;
                }
              })();
              return user ? 'Learn More' : 'Learn More & Sign Up';
            })()}
          </Button>
        </Card>
      </Container>



      {/* Program Offerings Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 6, md: 10 }, mb: 6 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 4, color: '#fff', textAlign: 'center' }}>
          Choose Your Path to Fitness
        </Typography>
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Card sx={{ width: '100%', height: '100%', borderRadius: 6, boxShadow: 6, background: '#111', p: { xs: 2, sm: 3, md: 4 }, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { boxShadow: 12, transform: 'scale(1.025)' }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff' }}>
              <Typography variant="h6" fontWeight={800} color="#fff" gutterBottom>Diet Plan</Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#C0C0C0' }}>Personalized meal plans for your goals. Starting at <b>₹199/month</b>.</Typography>
              <Button variant="contained" size="large" sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 900, fontSize: 20, mt: 2, color: '#181818', background: 'linear-gradient(90deg, #FFD700 60%, #C0C0C0 100%)', boxShadow: '0 2px 12px #FFD70044', '&:hover': { color: '#fff', background: 'linear-gradient(90deg, #C0C0C0 60%, #FFD700 100%)', boxShadow: '0 8px 24px #FFD70055' } }} onClick={() => navigate('/personalize-diet')}>
                Buy Now
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Card sx={{ width: '100%', height: '100%', borderRadius: 6, boxShadow: 6, background: '#111', p: { xs: 2, sm: 3, md: 4 }, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { boxShadow: 12, transform: 'scale(1.025)' }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff' }}>
              <Typography variant="h6" fontWeight={800} color="#fff" gutterBottom>Workout Plan</Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#C0C0C0' }}>Premium workout routines for all levels. Starting at <b>₹249/month</b>.</Typography>
              <Button variant="outlined" size="large" sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 700, fontSize: 20, mt: 2, color: '#fff', border: '2px solid #C0C0C0', background: '#111', '&:hover': { color: '#C0C0C0', borderColor: '#fff', background: '#181818' } }} onClick={() => navigate('/programs?type=workout')}>
                Learn More
              </Button>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4} sx={{ height: '100%' }}>
            <Card sx={{ width: '100%', height: '100%', borderRadius: 6, boxShadow: 6, background: '#111', p: { xs: 2, sm: 3, md: 4 }, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { boxShadow: 12, transform: 'scale(1.025)' }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff' }}>
              <Typography variant="h6" fontWeight={800} color="#fff" gutterBottom>Combo: Workout + Diet Plan</Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#C0C0C0' }}>Get both workout and diet plans for total transformation. Starting at <b>₹399/month</b>.</Typography>
              <Button variant="outlined" size="large" sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 700, fontSize: 20, mt: 2, color: '#fff', border: '2px solid #C0C0C0', background: '#111', '&:hover': { color: '#C0C0C0', borderColor: '#fff', background: '#181818' } }} onClick={() => navigate('/programs?type=combo')}>
                Learn More
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>
      {/* Founder/Brand Message Section */}
      <Container maxWidth="md" sx={{ mt: { xs: 6, md: 10 }, mb: 6, flexShrink: 0 }}>
        <Card sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 6,
          background: '#111',
          boxShadow: 3,
          textAlign: 'center',
          color: '#fff'
        }}>
          <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', mb: 2 }}>
            Give your body the respect it deserves.
          </Typography>
          <Typography variant="body1" sx={{ color: '#C0C0C0', mb: 2 }}>
            Premium training and nutrition, created for those who refuse to sacrifice on quality. Our programs are designed to help you build the ultimate physique, with science-backed methods and unwavering support.
          </Typography>
          <Typography variant="body2" sx={{ color: '#C0C0C0', mb: 1 }}>
            "I'm here to give you the tools you need to build your dream physique, crush your goals and conquer your mindset. Fitness is a lifestyle, not a temporary fix. If you promise to give it your all, I'll meet you halfway and help you reach your goals."
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#C0C0C0', fontWeight: 700 }}>
            — Your Coach DK
          </Typography>
        </Card>
      </Container>




    </Box>
  );
};

export default Home;
