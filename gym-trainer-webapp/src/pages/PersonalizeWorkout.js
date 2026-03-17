import React, { useState } from 'react';
import { Box, Container, Typography, TextField, MenuItem, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '../api';

const activityLevels = [
  'Sedentary', 'Active', 'Very Active', 'Athlete'
];
const primaryGoals = [
  'Fat Loss', 'Muscle Gain', 'Body Recomposition', 'General Fitness', 'Endurance', 'Flexibility', 'Sports-Specific'
];
const experienceLevels = [
  'Beginner', 'Intermediate', 'Advanced'
];
const equipmentOptions = [
  'Bodyweight Only', 'Resistance Bands', 'Dumbbells', 'Barbell', 'Kettlebells', 'Gym Access', 'Cardio Equipment (Treadmill/Bike/Row)', 'Other'
];
const exerciseTypes = [
  'HIIT', 'Weightlifting', 'Yoga', 'Pilates', 'Functional', 'CrossFit', 'Running', 'Cycling', 'Swimming', 'Sports', 'Other'
];
const intensityOptions = [
  'Light', 'Moderate', 'Intense'
];
const timeOfDayOptions = [
  'Morning', 'Afternoon', 'Evening', 'Flexible'
];

export default function PersonalizeWorkout() {
  const navigate = useNavigate();
  const reactLocation = useLocation();
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    gender: '',
    activity_level: '',
    days_per_week: '',
    workout_duration: '',
    primary_goal: '',
    secondary_goals: '',
    experience_level: '',
    equipment: [],
    preferred_exercises: [],
    medical_conditions: '',
    movement_restrictions: '',
    sports_enjoyed: '',
    intensity: '',
    time_of_day: '',
    body_parts: '',
    current_routine: '',
    additional_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEquipmentChange = (event) => {
    setForm({ ...form, equipment: event.target.value });
  };

  const handleExerciseChange = (event) => {
    setForm({ ...form, preferred_exercises: event.target.value });
  };

  const validateForm = () => {
    if (!form.full_name.trim()) return 'Full Name is required.';
    if (!form.age || isNaN(form.age) || form.age < 10 || form.age > 100) return 'Valid Age is required (10-100).';
    if (!form.height_cm || isNaN(form.height_cm) || form.height_cm < 100 || form.height_cm > 250) return 'Valid Height (cm) is required (100-250).';
    if (!form.weight_kg || isNaN(form.weight_kg) || form.weight_kg < 20 || form.weight_kg > 250) return 'Valid Weight (kg) is required (20-250).';
    if (!form.gender) return 'Gender is required.';
    if (!form.activity_level) return 'Activity Level is required.';
    if (!form.days_per_week || isNaN(form.days_per_week) || form.days_per_week < 1 || form.days_per_week > 7) return 'Days per week is required (1-7).';
    if (!form.workout_duration || isNaN(form.workout_duration) || form.workout_duration < 10 || form.workout_duration > 300) return 'Workout Duration is required (10-300 minutes).';
    if (!form.primary_goal) return 'Primary Fitness Goal is required.';
    if (!form.experience_level) return 'Experience Level is required.';
    if (!form.intensity) return 'Exercise Intensity Preference is required.';
    if (!form.time_of_day) return 'Time of Day Preferred is required.';
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
      const userId = user.id || user._id || user.email || null;
      if (!userId) {
        setError('User session expired. Please log in again.');
        setTimeout(() => navigate('/login', { state: { premiumError: 'User session expired. Please log in again.' } }), 2000);
        throw new Error('User session expired. Redirecting to login...');
      }
      // Get price from navigation state or default to 499
      const planPrice = (reactLocation && reactLocation.state && reactLocation.state.price) ? reactLocation.state.price : 499;
      const payload = { ...form, equipment: form.equipment.join(','), preferred_exercises: form.preferred_exercises.join(','), user_id: userId };
      // 1. Create order on backend
      const orderRes = await fetch(`${API_BASE}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: planPrice, currency: 'INR', user_id: userId, purpose: 'Personalized Workout Plan' })
      });
      const orderData = await orderRes.json();
      if (!orderData.id) throw new Error('Failed to create payment order.');
      // 2. Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_IPnzfZsdZcGEsa',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Xerxes Gym Trainer',
        description: 'Personalized Workout Plan',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const workoutRes = await fetch(`${API_BASE}/workout-plan-request`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const workoutData = await workoutRes.json();
            if (!workoutData.success) {
              setError('Failed to generate workout plan PDF.');
              setLoading(false);
              return;
            }
            setSuccess('Payment successful! Your personalized workout plan is ready.');
            const pdfUrl = workoutData.pdfUrl;
            
            // Store PDF in user programs
            try {
              const token = localStorage.getItem('token');
              if (token) {
                await fetch(`${API_BASE}/store-user-program`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    program_type: 'workout_plan',
                    pdf_url: pdfUrl,
                    program_name: `Workout Plan - ${new Date().toLocaleDateString()}`
                  })
                });
              }
            } catch (error) {
              console.error('Error storing program:', error);
            }
            
            setPdfUrl(pdfUrl);
            setLoading(false);
          } catch (err) {
            setError('Failed to generate workout plan PDF.');
            setLoading(false);
          }
        },
        prefill: {
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: { color: '#FFD700' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: '100vh', pt: { xs: 14, sm: 18 }, pb: { xs: 4, sm: 6 }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'linear-gradient(135deg, #181818 60%, #2196f311 100%)' }}>
      <Box sx={{
        width: '100%',
        bgcolor: 'rgba(17,17,17,0.98)',
        borderRadius: 5,
        boxShadow: '0 8px 32px 0 #2196f333',
        p: 5,
        border: '2px solid #2196f3',
        maxWidth: 480,
        mx: 'auto',
      }}>
        <Typography variant="h4" align="center" fontWeight={900} sx={{ color: '#2196f3', letterSpacing: 1, mb: 1, fontFamily: 'Cinzel, serif', fontSize: { xs: 28, sm: 32 } }}>
          Personalize Your Workout Plan
        </Typography>
        <Typography align="center" sx={{ color: '#ccc', fontSize: 16, mb: 3, fontWeight: 500 }}>
          Please provide your details for a truly personalized AI-powered workout plan.
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} fullWidth required sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#FFD700' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' }, '&:hover fieldset': { borderColor: '#fff' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }} />
          <TextField label="Age" name="age" value={form.age} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#ccc' } }} />
          <TextField label="Height (cm)" name="height_cm" value={form.height_cm} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#ccc' } }} />
          <TextField label="Weight (kg)" name="weight_kg" value={form.weight_kg} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#ccc' } }} />
          <TextField select label="Gender" name="gender" value={form.gender} onChange={handleChange} fullWidth required sx={{ mb: 2, input: { color: '#fff', bgcolor: '#222' }, label: { color: '#FFD700' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' }, '&:hover fieldset': { borderColor: '#fff' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField select label="Activity Level" name="activity_level" value={form.activity_level} onChange={handleChange} fullWidth required sx={{ mb: 2 }}>
            {activityLevels.map(level => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </TextField>
          <TextField label="Days Available for Workout (per week)" name="days_per_week" value={form.days_per_week} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2 }} />
          <TextField label="Preferred Workout Duration (minutes per session)" name="workout_duration" value={form.workout_duration} onChange={handleChange} type="number" fullWidth required sx={{ mb: 2 }} />
          <TextField select label="Primary Fitness Goal" name="primary_goal" value={form.primary_goal} onChange={handleChange} fullWidth required sx={{ mb: 2 }}>
            {primaryGoals.map(goal => (
              <MenuItem key={goal} value={goal}>{goal}</MenuItem>
            ))}
          </TextField>
          <TextField label="Secondary Goals (if any)" name="secondary_goals" value={form.secondary_goals} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField select label="Workout Experience Level" name="experience_level" value={form.experience_level} onChange={handleChange} fullWidth required sx={{ mb: 2 }}>
            {experienceLevels.map(level => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Equipment Available" name="equipment" value={form.equipment} onChange={handleEquipmentChange} SelectProps={{ multiple: true, renderValue: (selected) => selected.join(', ') }} fullWidth sx={{ mb: 2 }}>
            {equipmentOptions.map(eq => (
              <MenuItem key={eq} value={eq}>{eq}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Preferred Exercise Types" name="preferred_exercises" value={form.preferred_exercises} onChange={handleExerciseChange} SelectProps={{ multiple: true, renderValue: (selected) => selected.join(', ') }} fullWidth sx={{ mb: 2 }}>
            {exerciseTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
          <TextField label="Medical Conditions or Injuries (if any)" name="medical_conditions" value={form.medical_conditions} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Movement Restrictions (joints, flexibility etc)" name="movement_restrictions" value={form.movement_restrictions} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Sports/Activities Enjoyed" name="sports_enjoyed" value={form.sports_enjoyed} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField select label="Exercise Intensity Preference" name="intensity" value={form.intensity} onChange={handleChange} fullWidth required sx={{ mb: 2 }}>
            {intensityOptions.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Time of Day Preferred" name="time_of_day" value={form.time_of_day} onChange={handleChange} fullWidth required sx={{ mb: 2 }}>
            {timeOfDayOptions.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          <TextField label="Body Parts to Prioritize (optional)" name="body_parts" value={form.body_parts} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Current Workout Routine (if any)" name="current_routine" value={form.current_routine} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Additional Notes / Specific Requests" name="additional_notes" value={form.additional_notes} onChange={handleChange} fullWidth sx={{ mb: 3 }} />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {pdfUrl && (
            <Button
              href={`${API_BASE.replace('/api', '')}${pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              color="primary"
              sx={{ mt: 2, fontWeight: 700 }}
            >
              Download Workout Plan PDF
            </Button>
          )}
          <Button type="submit" variant="contained" fullWidth size="large"
            sx={{ fontWeight: 900, fontSize: 20, bgcolor: 'linear-gradient(90deg, #2196f3 60%, #fff 100%)', color: '#111', boxShadow: '0 4px 16px #2196f344', borderRadius: 3, py: 1.5, mt: 2, '&:hover': { bgcolor: 'linear-gradient(90deg, #fff 60%, #2196f3 100%)', color: '#111', boxShadow: '0 8px 32px #2196f366' } }}
            disabled={loading}>
            {loading ? <CircularProgress size={28} color="inherit" /> : 'GENERATE MY WORKOUT PLAN'}
          </Button>
        </form>
      </Box>
    </Container>
  );
}
