import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, TextField, MenuItem,
  Button, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  createOrder, requestDietPlan, storeUserProgram,
  getToken, getUser, getPdfDownloadUrl
} from '../api';

const FIELD_SX = {
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: '#333' },
    '&:hover fieldset': { borderColor: '#FFD700' },
    '&.Mui-focused fieldset': { borderColor: '#FFD700' },
  },
  '& .MuiInputLabel-root': { color: '#888' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
  '& .MuiInputBase-input': { color: '#fff', backgroundColor: '#1A1A1A' },
  '& .MuiFormHelperText-root': { color: '#555', fontSize: 11 },
  '& .MuiSelect-icon': { color: '#888' },
};

function SectionLabel({ children }) {
  return (
    <Typography sx={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 1.5, color: '#FFD700', mb: 2, mt: 3,
      borderBottom: '1px solid #1A1A1A', pb: 1,
    }}>
      {children}
    </Typography>
  );
}

const FOOD_ALLERGY_OPTIONS = [
  'Milk', 'Eggs', 'Peanuts', 'Soy', 'Wheat', 'Tree Nuts', 'Fish', 'Shellfish',
  'Sesame', 'Gluten', 'Mustard', 'Lupin', 'Celery', 'Buckwheat', 'Corn', 'Tomato',
  'Potato', 'Garlic', 'Onion', 'Mushroom', 'Chili', 'Coriander', 'Cumin', 'Fenugreek',
  'Lentils', 'Cashew', 'Almond', 'Pistachio', 'Walnut', 'Coconut',
];

const PLAN_PRICE = 1999;

export default function PersonalizeDiet() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', age: '', height_cm: '', weight_kg: '', gender: '',
    activity_level: '', workout_frequency: '', workout_duration_minutes: '',
    food_allergies: [], dietary_preferences: '', medical_conditions: '',
    meal_frequency: '', water_intake: '', supplement_use: '', sleep_duration: '',
    goal: '', specific_goals: '', cuisine_preference: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { state: { message: 'Please log in to access this page.' } });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAllergyChange = (e) => {
    setForm({ ...form, food_allergies: e.target.value });
  };

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.age || form.age < 10 || form.age > 100) return 'Age must be between 10 and 100.';
    if (!form.height_cm || form.height_cm < 100 || form.height_cm > 250) return 'Height must be 100–250 cm.';
    if (!form.weight_kg || form.weight_kg < 20 || form.weight_kg > 300) return 'Weight must be 20–300 kg.';
    if (!form.gender) return 'Gender is required.';
    if (!form.activity_level) return 'Activity level is required.';
    if (!form.workout_frequency) return 'Workout frequency is required.';
    if (!form.workout_duration_minutes) return 'Workout duration is required.';
    if (!form.goal) return 'Goal is required.';
    if (!form.cuisine_preference) return 'Cuisine preference is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPdfUrl(null);

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const user = getUser();
    if (!user) { navigate('/login', { state: { message: 'Please log in.' } }); return; }
    const userId = user.id || user._id || user.email;
    if (!userId) { navigate('/login', { state: { message: 'Session expired. Please log in again.' } }); return; }

    setLoading(true);
    try {
      const orderData = await createOrder({
        amount: PLAN_PRICE, currency: 'INR', user_id: userId, purpose: 'Personalized Diet Plan'
      });
      if (!orderData.id) throw new Error('Failed to create payment order.');

      const payload = {
        ...form,
        food_allergies: form.food_allergies.join(','),
        user_id: userId,
      };

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Xerxes Fitness',
        description: 'Personalized Diet Plan',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const result = await requestDietPlan({
              ...payload,
              payment_id: response.razorpay_payment_id,
            });
            if (!result.success) {
              setError('Plan generation failed. Please contact support at dhanushkumar102@gmail.com');
              setLoading(false);
              return;
            }
            const token = getToken();
            if (token) {
              await storeUserProgram({
                program_type: 'diet_plan',
                pdf_url: result.pdf_url,
                program_name: `Diet Plan \u2013 ${new Date().toLocaleDateString('en-IN')}`,
              });
            }
            setPdfUrl(result.pdf_url);
            setSuccess('Your diet plan is ready! Click below to download.');
            setLoading(false);
          } catch {
            setError('Plan generation failed. Please contact support at dhanushkumar102@gmail.com');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled.');
            setLoading(false);
          }
        },
        prefill: {
          name: user.full_name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: { color: '#FFD700' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', pt: { xs: 10, md: 12 }, pb: { xs: 4, md: 8 } }}>
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#111', border: '1px solid #222', borderRadius: 3,
            p: { xs: 3, sm: 5 }, position: 'relative', overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(90deg, #FFD700, #fff 50%, #FFD700)',
            }
          }}
        >
          <Typography sx={{
            fontFamily: 'Cinzel, serif', fontWeight: 900,
            fontSize: { xs: 20, sm: 24 }, color: '#FFD700',
            textAlign: 'center', mb: 0.5, letterSpacing: 1,
          }}>
            Personalize Your Diet Plan
          </Typography>
          <Typography sx={{ color: '#888', textAlign: 'center', fontSize: 13, mb: 1 }}>
            Fill in your details for a truly personalized AI-generated plan.
          </Typography>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box component="span" sx={{
              bgcolor: 'rgba(255,215,0,0.1)', color: '#FFD700', fontWeight: 800,
              fontSize: 18, px: 2, py: 0.5, borderRadius: 1,
              fontFamily: 'Montserrat,sans-serif',
            }}>₹{PLAN_PRICE}</Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#F44336', '& .MuiAlert-icon': { color: '#F44336' } }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', color: '#4CAF50', '& .MuiAlert-icon': { color: '#4CAF50' } }}>
              {success}
            </Alert>
          )}

          {pdfUrl && (
            <Button
              href={getPdfDownloadUrl(pdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              sx={{
                bgcolor: '#FFD700', color: '#000', fontWeight: 800, fontSize: 14,
                py: 1.5, borderRadius: 2, mb: 2, letterSpacing: 0.5,
                fontFamily: 'Montserrat,sans-serif',
                '&:hover': { bgcolor: '#E6C200' },
              }}
            >
              DOWNLOAD YOUR DIET PLAN
            </Button>
          )}

          <form onSubmit={handleSubmit}>
            <SectionLabel>Personal Info</SectionLabel>
            <TextField label="Full Name *" name="full_name" value={form.full_name} onChange={handleChange} fullWidth required sx={FIELD_SX} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Age *" name="age" type="number" value={form.age} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 10, max: 100 }} />
              <TextField label="Height (cm) *" name="height_cm" type="number" value={form.height_cm} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 100, max: 250 }} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2.5 }}>
              <TextField label="Weight (kg) *" name="weight_kg" type="number" value={form.weight_kg} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 20, max: 300 }} />
              <TextField select label="Gender *" name="gender" value={form.gender} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Box>
            <Box sx={{ mt: 2.5 }}>
              <TextField select label="Activity Level *" name="activity_level" value={form.activity_level} onChange={handleChange} fullWidth required sx={FIELD_SX}>
                <MenuItem value="Sedentary">Sedentary</MenuItem>
                <MenuItem value="Lightly Active">Lightly Active</MenuItem>
                <MenuItem value="Moderately Active">Moderately Active</MenuItem>
                <MenuItem value="Very Active">Very Active</MenuItem>
                <MenuItem value="Athlete">Athlete</MenuItem>
              </TextField>
            </Box>

            <SectionLabel>Workout Details</SectionLabel>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Workout Frequency (days/week) *" name="workout_frequency" type="number" value={form.workout_frequency} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 0, max: 7 }} />
              <TextField label="Workout Duration (min/session) *" name="workout_duration_minutes" type="number" value={form.workout_duration_minutes} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 0 }} />
            </Box>

            <SectionLabel>Goals & Preferences</SectionLabel>
            <TextField select label="Goal *" name="goal" value={form.goal} onChange={handleChange} fullWidth required sx={FIELD_SX}>
              <MenuItem value="Fat Loss">Fat Loss</MenuItem>
              <MenuItem value="Weight Gain">Weight Gain</MenuItem>
              <MenuItem value="Lean Muscle Gain">Lean Muscle Gain</MenuItem>
              <MenuItem value="General Health">General Health</MenuItem>
            </TextField>
            <TextField select label="Cuisine Preference *" name="cuisine_preference" value={form.cuisine_preference} onChange={handleChange} fullWidth required sx={FIELD_SX}>
              <MenuItem value="North Indian">North Indian</MenuItem>
              <MenuItem value="South Indian">South Indian</MenuItem>
              <MenuItem value="Both">Both</MenuItem>
            </TextField>
            <TextField label="Specific Goals" name="specific_goals" value={form.specific_goals} onChange={handleChange} fullWidth multiline rows={2} sx={FIELD_SX} placeholder="e.g. lose 5kg in 3 months" />

            <SectionLabel>Diet & Health</SectionLabel>
            <TextField
              select
              label="Food Allergies"
              name="food_allergies"
              value={form.food_allergies}
              onChange={handleAllergyChange}
              fullWidth
              helperText="Select all that apply"
              SelectProps={{
                multiple: true,
                renderValue: (selected) => selected.join(', '),
              }}
              sx={FIELD_SX}
            >
              {FOOD_ALLERGY_OPTIONS.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
            <TextField label="Dietary Preferences" name="dietary_preferences" value={form.dietary_preferences} onChange={handleChange} fullWidth sx={FIELD_SX} placeholder="e.g. vegetarian, vegan, eggetarian" />
            <TextField label="Medical Conditions" name="medical_conditions" value={form.medical_conditions} onChange={handleChange} fullWidth sx={FIELD_SX} placeholder="e.g. diabetes, hypertension" />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Meal Frequency (meals/day)" name="meal_frequency" type="number" value={form.meal_frequency} onChange={handleChange} sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 1, max: 10 }} />
              <TextField label="Water Intake (liters/day)" name="water_intake" type="number" value={form.water_intake} onChange={handleChange} sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 0, step: 0.5 }} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2.5 }}>
              <TextField label="Sleep Duration (hours/night)" name="sleep_duration" type="number" value={form.sleep_duration} onChange={handleChange} sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 1, max: 12 }} />
              <TextField label="Supplement Use" name="supplement_use" value={form.supplement_use} onChange={handleChange} sx={{ ...FIELD_SX, mb: 0 }} placeholder="e.g. protein, creatine" />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: '#FFD700', color: '#000', fontWeight: 800,
                  fontSize: 15, py: 1.5, borderRadius: 2, letterSpacing: 0.5,
                  fontFamily: 'Montserrat,sans-serif',
                  '&:hover': { bgcolor: '#E6C200' },
                  '&:disabled': { bgcolor: '#333', color: '#666' },
                }}
              >
                {loading
                  ? <CircularProgress size={22} sx={{ color: '#000' }} />
                  : `PAY ₹${PLAN_PRICE} & GET MY DIET PLAN`
                }
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
