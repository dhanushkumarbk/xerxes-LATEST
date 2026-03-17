import React, { useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '../api';


const dietPlans = [
  { id: 1, duration: '1 Month', price: 1, description: 'Personalized diet plan for 1 month.' }
];

const workoutPlans = [
  { id: 1, duration: '1 Month', price: 1, description: 'Premium workout plan for 1 month.' }
];

const comboPlans = [
  { id: 1, duration: '1 Month', price: 1, description: 'Get both workout & diet plans for 1 month.' }
];

const Programs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if not logged in
  useEffect(() => {
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return null;
      }
    })();
    if (!user) navigate('/login');
  }, [navigate]);

  const handleBuy = async (plan) => {
    console.log('BUY NOW clicked for plan:', plan);
    if (!window.Razorpay) {
      console.error('Razorpay SDK not loaded. Please check your internet connection or contact support.');
      console.error('window.Razorpay is not available!');
      return;
    }
    // Call backend to create order
    let order;
    try {
      const res = await fetch(`${API_BASE}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.price, currency: 'INR' })
      });
      order = await res.json();
      console.log('Order from backend:', order);
    } catch (e) {
      console.error('Failed to create order. Please try again.');
      console.error('Order creation error:', e);
      return;
    }
    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return {};
      }
    })();
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_IPnzfZsdZcGEsa', // <-- PUT YOUR RAZORPAY KEY ID HERE
      amount: order.amount,
      currency: order.currency,
      name: 'Gym Trainer',
      description: plan.description,
      order_id: order.id,
      handler: function (response) {
        // TODO: Optionally notify backend of payment success
        // TODO: Show in-app notification or redirect on payment success
      },
      prefill: {
        email: user.email || '',
        contact: user.phone || ''
      },
      theme: { color: '#3399cc' }
    };
    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
      console.log('Razorpay checkout opened.');
    } catch (e) {
      console.error('Failed to open Razorpay. See console for details.');
      console.error('Razorpay open error:', e);
    }
  };

  // Read ?type= from URL
  const params = new URLSearchParams(location.search);
  const type = params.get('type');

  return (
    <Container maxWidth="lg" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', py: { xs: 14, sm: 18 } }}>
        <Typography variant="h3" fontWeight={900} sx={{ color: '#FFD700', mb: 4, letterSpacing: 1.5, fontFamily: 'Montserrat, serif', textAlign: 'center', fontSize: { xs: 28, sm: 34 } }}>
          Premium Fitness Programs
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {(type === 'diet' || !type) && dietPlans.map((plan, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper elevation={12} sx={{
                bgcolor: 'rgba(24,24,24,0.98)',
                background: 'linear-gradient(135deg, #181818 80%, #FFD70022 100%)',
                color: '#fff',
                borderRadius: 5,
                p: { xs: 3, sm: 5 },
                boxShadow: '0 8px 32px 0 #FFD70033',
                border: '2px solid #FFD700',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.03)',
                  boxShadow: '0 16px 48px 0 #FFD70066',
                  borderColor: '#fff',
                },
              }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#FFD700', mb: 0.5, fontFamily: 'Montserrat, serif', fontSize: { xs: 22, sm: 26 }, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span role="img" aria-label="Diet" style={{ marginRight: 8 }}>🍎</span>Diet Plan
                </Typography>
                <Box sx={{ width: 40, height: 4, bgcolor: '#FFD700', borderRadius: 2, mb: 1.5 }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: '#FFD700', mb: 1, fontFamily: 'Montserrat, serif', fontSize: { xs: 20, sm: 24 } }}>{plan.duration}</Typography>
                <Typography variant="h4" color="success.main" fontWeight={900} sx={{ mb: 1, fontSize: { xs: 24, sm: 28 } }}>₹{plan.price}</Typography>
                <Typography variant="body1" sx={{ color: '#C0C0C0', fontWeight: 500, fontSize: { xs: 16, sm: 18 }, textAlign: 'center', mb: 2 }}>{plan.description}</Typography>
                <Button variant="contained" color="success" fullWidth sx={{ mt: 2, fontWeight: 900, fontSize: 18, borderRadius: 3, py: 1.2, boxShadow: '0 2px 8px #FFD70044', background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', color: '#111', '&:hover': { background: 'linear-gradient(90deg, #fff 60%, #FFD700 100%)', color: '#111' } }} onClick={() => navigate('/personalize-diet', { state: { price: plan.price } })}>
                  BUY NOW
                </Button>
              </Paper>
            </Grid>
          ))}
          {(type === 'workout' || !type) && workoutPlans.map((plan, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper elevation={12} sx={{
                bgcolor: 'rgba(24,24,24,0.98)',
                background: 'linear-gradient(135deg, #181818 80%, #2196f322 100%)',
                color: '#fff',
                borderRadius: 5,
                p: { xs: 3, sm: 5 },
                boxShadow: '0 8px 32px 0 #2196f333',
                border: '2px solid #2196f3',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.03)',
                  boxShadow: '0 16px 48px 0 #2196f366',
                  borderColor: '#fff',
                },
              }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#2196f3', mb: 0.5, fontFamily: 'Montserrat, serif', fontSize: { xs: 22, sm: 26 }, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span role="img" aria-label="Workout" style={{ marginRight: 8 }}>🏋️</span>Workout Plan
                </Typography>
                <Box sx={{ width: 40, height: 4, bgcolor: '#2196f3', borderRadius: 2, mb: 1.5 }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: '#FFD700', mb: 1, fontFamily: 'Montserrat, serif', fontSize: { xs: 20, sm: 24 } }}>{plan.duration}</Typography>
                <Typography variant="h4" color="primary.main" fontWeight={900} sx={{ mb: 1, fontSize: { xs: 24, sm: 28 } }}>₹{plan.price}</Typography>
                <Typography variant="body1" sx={{ color: '#C0C0C0', fontWeight: 500, fontSize: { xs: 16, sm: 18 }, textAlign: 'center', mb: 2 }}>{plan.description}</Typography>
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: 900, fontSize: 18, borderRadius: 3, py: 1.2, boxShadow: '0 2px 8px #2196f344', background: 'linear-gradient(90deg, #2196f3 60%, #fff 100%)', color: '#111', '&:hover': { background: 'linear-gradient(90deg, #fff 60%, #2196f3 100%)', color: '#111' } }} onClick={() => navigate('/personalize-workout', { state: { price: plan.price } })}>
                  BUY NOW
                </Button>
              </Paper>
            </Grid>
          ))}
          {(type === 'combo' || !type) && comboPlans.map((plan, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper elevation={12} sx={{
                bgcolor: 'rgba(24,24,24,0.98)',
                background: 'linear-gradient(135deg, #181818 80%, #43a04722 100%)',
                color: '#fff',
                borderRadius: 5,
                p: { xs: 3, sm: 5 },
                boxShadow: '0 8px 32px 0 #43a04733',
                border: '2px solid #43a047',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.03)',
                  boxShadow: '0 16px 48px 0 #43a04766',
                  borderColor: '#fff',
                },
              }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#43a047', mb: 0.5, fontFamily: 'Montserrat, serif', fontSize: { xs: 22, sm: 26 }, letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span role="img" aria-label="Combo" style={{ marginRight: 8 }}>🔀</span>Combo Plan
                </Typography>
                <Box sx={{ width: 40, height: 4, bgcolor: '#43a047', borderRadius: 2, mb: 1.5 }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: '#FFD700', mb: 1, fontFamily: 'Montserrat, serif', fontSize: { xs: 20, sm: 24 } }}>{plan.duration}</Typography>
                <Typography variant="h4" color="warning.main" fontWeight={900} sx={{ mb: 1, fontSize: { xs: 24, sm: 28 } }}>₹{plan.price}</Typography>
                <Typography variant="body1" sx={{ color: '#C0C0C0', fontWeight: 500, fontSize: { xs: 16, sm: 18 }, textAlign: 'center', mb: 2 }}>{plan.description}</Typography>
                <Button variant="contained" color="success" fullWidth sx={{ mt: 2, fontWeight: 900, fontSize: 18, borderRadius: 3, py: 1.2, boxShadow: '0 2px 8px #43a04744', background: 'linear-gradient(90deg, #43a047 60%, #fff 100%)', color: '#111', '&:hover': { background: 'linear-gradient(90deg, #fff 60%, #43a047 100%)', color: '#111' } }} onClick={() => navigate('/personalize-combo', { state: { price: plan.price } })}>
                  BUY NOW
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Programs;
