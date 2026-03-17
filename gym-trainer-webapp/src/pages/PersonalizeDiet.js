import React, { useState } from 'react';
import { Box, Container, Typography, TextField, MenuItem, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '../api';

const cuisineOptions = [
  { value: 'North Indian', label: 'North Indian' },
  { value: 'South Indian', label: 'South Indian' },
  { value: 'Both', label: 'Both' },
];
const goalOptions = [
  { value: 'Fat Loss', label: 'Fat Loss' },
  { value: 'Weight Gain', label: 'Weight Gain' },
  { value: 'Lean Muscle Gain', label: 'Lean Muscle Gain' }
];
const foodAllergyOptions = [
  'Milk', 'Eggs', 'Peanuts', 'Soy', 'Wheat', 'Tree Nuts', 'Fish', 'Shellfish', 'Sesame',
  'Gluten', 'Mustard', 'Lupin', 'Celery', 'Buckwheat', 'Corn', 'Tomato', 'Potato', 'Garlic',
  'Onion', 'Mushroom', 'Chili', 'Coriander', 'Cumin', 'Fenugreek', 'Lentils', 'Chana Dal',
  'Urad Dal', 'Moong Dal', 'Toor Dal', 'Rice', 'Oats', 'Barley', 'Cashew', 'Almond', 'Pistachio',
  'Walnut', 'Hazelnut', 'Pecan', 'Brazil Nut', 'Pine Nut', 'Coconut'
];


export default function PersonalizeDiet() {
  const navigate = useNavigate();
  const reactLocation = useLocation();
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    gender: '',
    activity_level: '',
    workout_frequency: '',
    workout_duration_minutes: '',
    food_allergies: [],
    dietary_preferences: '',
    medical_conditions: '',
    meal_frequency: '',
    water_intake: '',
    supplement_use: '',
    sleep_duration: '',
    goal: '',
    specific_goals: '',
    cuisine_preference: '', // <-- added
  });
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [generatedPlanId, setGeneratedPlanId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  
  const [debugBackendError, setDebugBackendError] = useState(null);
  // const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAllergyChange = (event) => {
    setForm({ ...form, food_allergies: event.target.value });
  };

  const validateForm = () => {
    if (!form.full_name.trim()) return 'Full Name is required.';
    if (!form.age || isNaN(form.age) || form.age < 10 || form.age > 100) return 'Valid Age is required (10-100).';
    if (!form.height_cm || isNaN(form.height_cm) || form.height_cm < 100 || form.height_cm > 250) return 'Valid Height (cm) is required (100-250).';
    if (!form.weight_kg || isNaN(form.weight_kg) || form.weight_kg < 20 || form.weight_kg > 250) return 'Valid Weight (kg) is required (20-250).';
    if (!form.gender) return 'Gender is required.';
    if (!form.activity_level) return 'Activity Level is required.';
    if (!form.workout_frequency || isNaN(form.workout_frequency) || form.workout_frequency < 0) return 'Workout Frequency is required.';
    if (!form.workout_duration_minutes || isNaN(form.workout_duration_minutes) || form.workout_duration_minutes < 0) return 'Workout Duration is required.';
    if (!form.goal) return 'Goal is required.';
    if (!form.cuisine_preference) return 'Cuisine Preference is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPdfUrl(null);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('You must be logged in.');
      // Try multiple possible keys for user ID
      const userId = user.id || user._id || user.email || null;
      if (!userId) {
        setDebugBackendError('User session expired. Please log in again.');
        setTimeout(() => {
          navigate('/login', { state: { premiumError: 'User session expired. Please log in again.' } });
        }, 2000);
        throw new Error('User session expired. Redirecting to login...');
      }
      const payload = { ...form, food_allergies: form.food_allergies.join(','), user_id: userId };

      // 1. Create order on backend
      // Get price from navigation state or default to 299
      const planPrice = (reactLocation && reactLocation.state && reactLocation.state.price) ? reactLocation.state.price : 299;
      const orderRes = await fetch(`${API_BASE}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: planPrice, currency: 'INR', user_id: userId, purpose: 'Personalized Diet Plan' })
      });
      const orderData = await orderRes.json();
      if (!orderData.id) throw new Error('Failed to create payment order.');
      // 2. Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_IPnzfZsdZcGEsa', // Replace with your actual Razorpay test key
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Xerxes Gym Trainer',
        description: 'Personalized Diet Plan',
        order_id: orderData.id,
        handler: async function (response) {
          // 3. On payment success, call backend to verify payment and generate programs
          try {
            console.log('[PAYMENT SUCCESS] Razorpay response:', response);
            console.log('[PAYMENT SUCCESS] Calling verify-payment with:', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: userId,
              program_id: 1,
              amount: planPrice
            });
            
            const verifyRes = await fetch(`${API_BASE}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: userId,
                program_id: 1, // Default program ID
                amount: planPrice
              })
            });
            const verifyData = await verifyRes.json();
            console.log('[PAYMENT SUCCESS] Verify response:', verifyData);
            
            if (!verifyData.success) {
              setDebugBackendError(verifyData.error || 'Failed to verify payment.');
              setError(verifyData.error || 'Failed to verify payment.');
              setLoading(false);
              return;
            }
            setSuccess('Payment successful! Your personalized diet plan is ready.');
            setPaymentSuccess(true);
            setGeneratedPlanId(verifyData.diet_program_id);
            setPdfUrl(verifyData.pdf_url || verifyData.pdfUrl); // <-- ensure this is set
            setDebugBackendError(null);
          } catch (err) {
            console.error('[PAYMENT SUCCESS ERROR]', err);
            setError('Payment succeeded, but program generation failed. Please contact support.');
            setLoading(false);
          }
          setLoading(false);
        },
        prefill: {
          name: user.full_name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#FFD700'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setError('Payment was cancelled.');
            setPdfUrl(null);
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', pt: { xs: 14, sm: 18 }, pb: { xs: 4, sm: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)' }}>
      <Box sx={{
        width: '100%',
        bgcolor: 'rgba(17,17,17,0.98)',
        borderRadius: 5,
        boxShadow: '0 8px 32px 0 #FFD70033',
        p: 5,
        border: '2px solid #FFD700',
        maxWidth: 480,
        mx: 'auto',
      }}>
        <Typography variant="h4" align="center" fontWeight={900} sx={{ color: '#FFD700', letterSpacing: 1, mb: 1, fontFamily: 'Cinzel, serif', fontSize: { xs: 28, sm: 32 } }}>
          Personalize Your Diet Plan
        </Typography>
        <Typography align="center" sx={{ color: '#ccc', fontSize: 16, mb: 3, fontWeight: 500 }}>
          Please provide your details for a truly personalized Plan.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} fullWidth required 
            sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#ccc' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ccc' }, '&:hover fieldset': { borderColor: '#fff' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}
          />
          <TextField label="Age" name="age" value={form.age} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#ccc' } }} />
          <TextField label="Height (cm)" name="height_cm" value={form.height_cm} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#ccc' } }} />
          <TextField label="Weight (kg)" name="weight_kg" value={form.weight_kg} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#ccc' } }} />
          <TextField select label="Gender" name="gender" value={form.gender} onChange={handleChange} fullWidth required 
            sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#FFD700' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' }, '&:hover fieldset': { borderColor: '#fff' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField select label="Activity Level" name="activity_level" value={form.activity_level} onChange={handleChange} fullWidth required sx={{ mb: 2 }}>
            <MenuItem value="Sedentary">Sedentary</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
          </TextField>
          <TextField label="Workout Frequency (per week)" name="workout_frequency" value={form.workout_frequency} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2 }} />
          <TextField label="Workout Duration (minutes per session)" name="workout_duration_minutes" value={form.workout_duration_minutes} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2 }} />
          <TextField
            select
            label="Food Allergies"
            name="food_allergies"
            value={form.food_allergies}
            onChange={handleAllergyChange}
            SelectProps={{ multiple: true, renderValue: (selected) => selected.join(', ') }}
            fullWidth
            sx={{ mb: 2 }}
            helperText="Select all that apply"
          >
            {foodAllergyOptions.map((food) => (
              <MenuItem key={food} value={food}>{food}</MenuItem>
            ))}
          </TextField>
          <TextField label="Dietary Preferences (vegan, etc)" name="dietary_preferences" value={form.dietary_preferences} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Medical Conditions (if any)" name="medical_conditions" value={form.medical_conditions} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Meal Frequency (meals/day)" name="meal_frequency" value={form.meal_frequency} onChange={handleChange} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="Water Intake (liters/day)" name="water_intake" value={form.water_intake} onChange={handleChange} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField label="Supplement Use (protein, etc)" name="supplement_use" value={form.supplement_use} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Sleep Duration (hours/night)" name="sleep_duration" value={form.sleep_duration} onChange={handleChange} type="number" fullWidth sx={{ mb: 2 }} />
          <TextField
            select
            label="Cuisine Preference"
            name="cuisine_preference"
            value={form.cuisine_preference}
            onChange={handleChange}
            fullWidth
            required
            SelectProps={{
              displayEmpty: true,
              renderValue: selected => {
                if (!selected) return <span style={{ color: '#888' }}>Select Cuisine Preference…</span>;
                const icon = selected === 'North Indian' ? '🥘' : selected === 'South Indian' ? '🍛' : '🍽️';
                return <span>{icon} {selected}</span>;
              }
            }}
            sx={{
              mb: 2,
              input: { color: '#fff', bgcolor: '#222' },
              label: { color: '#FFD700', fontWeight: 700 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                fontSize: 18,
                boxShadow: '0 2px 8px #FFD70022',
                '& fieldset': { borderColor: '#FFD700' },
                '&:hover fieldset': { borderColor: '#fff' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
              }
            }}
          >
            {cuisineOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.value === 'North Indian' && '🥘 '}
                {option.value === 'South Indian' && '🍛 '}
                {option.value === 'Both' && '🍽️ '}
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Goal" name="goal" value={form.goal} onChange={handleChange} fullWidth required sx={{ mb: 3 }}>
            {goalOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Specific Health Goals" name="specific_goals" value={form.specific_goals} onChange={handleChange} fullWidth sx={{ mb: 3 }} />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          {paymentSuccess && pdfUrl && (
            <Button
              href={`${API_BASE.replace('/api', '')}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="success"
              fullWidth
              sx={{
                fontWeight: 900,
                fontSize: 20,
                borderRadius: 3,
                mb: 3,
                py: 1.5,
                bgcolor: 'linear-gradient(90deg, #4caf50 60%, #fff 100%)',
                color: '#111',
                boxShadow: '0 4px 16px #4caf5044',
                '&:hover': {
                  bgcolor: 'linear-gradient(90deg, #fff 60%, #4caf50 100%)',
                  color: '#111',
                  boxShadow: '0 8px 32px #4caf5066'
                }
              }}
            >
              DOWNLOAD PDF
            </Button>
          )}
          {debugBackendError && (
            <div style={{ color: 'red', marginTop: 8 }}><b>Backend Error:</b> {debugBackendError}</div>
          )}
          <Button type="submit" variant="contained" fullWidth size="large"
            sx={{ fontWeight: 900, fontSize: 20, bgcolor: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', color: '#111', boxShadow: '0 4px 16px #FFD70044', borderRadius: 3, py: 1.5, mt: 2, '&:hover': { bgcolor: 'linear-gradient(90deg, #fff 60%, #FFD700 100%)', color: '#111', boxShadow: '0 8px 32px #FFD70066' } }}
            disabled={loading}>
            {loading ? <CircularProgress size={28} color="inherit" /> : 'GENERATE MY DIET PLAN'}
          </Button>
        </form>
      </Box>
    </Container>
  );
}
