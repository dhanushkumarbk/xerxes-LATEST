import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, TextField, MenuItem,
  Button, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  createOrder, requestComboPlan, storeUserProgram,
  getToken, getUser, getPdfDownloadUrl
} from '../api';

const FIELD_SX = {
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: '#333' },
    '&:hover fieldset': { borderColor: '#43A047' },
    '&.Mui-focused fieldset': { borderColor: '#43A047' },
  },
  '& .MuiInputLabel-root': { color: '#888' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#43A047' },
  '& .MuiInputBase-input': { color: '#fff', backgroundColor: '#1A1A1A' },
  '& .MuiFormHelperText-root': { color: '#555', fontSize: 11 },
  '& .MuiSelect-icon': { color: '#888' },
};

function SectionLabel({ children }) {
  return (
    <Typography sx={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 1.5, color: '#43A047', mb: 2, mt: 3,
      borderBottom: '1px solid #1A1A1A', pb: 1,
    }}>
      {children}
    </Typography>
  );
}

const FOOD_ALLERGY_OPTIONS = [
  'Milk', 'Eggs', 'Peanuts', 'Soy', 'Wheat', 'Tree Nuts', 'Fish', 'Shellfish',
  'Sesame', 'Gluten', 'Mustard', 'Corn', 'Tomato', 'Potato', 'Garlic', 'Onion',
  'Mushroom', 'Chili', 'Cashew', 'Almond', 'Pistachio', 'Walnut', 'Coconut',
];
const EQUIPMENT_OPTIONS = [
  'Bodyweight Only', 'Resistance Bands', 'Dumbbells', 'Barbell',
  'Kettlebells', 'Gym Access', 'Cardio Equipment', 'Other',
];
const EXERCISE_OPTIONS = [
  'HIIT', 'Weightlifting', 'Yoga', 'Pilates', 'Functional',
  'CrossFit', 'Running', 'Cycling', 'Swimming', 'Other',
];

const PLAN_PRICE = 3499;

export default function ComboPlan() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', age: '', height_cm: '', weight_kg: '', gender: '',
    activity_level: '', days_per_week: '', workout_duration: '',
    primary_goal: '', secondary_goals: '', experience_level: '',
    equipment: [], preferred_exercises: [],
    intensity: '', time_of_day: '',
    goal: '', cuisine_preference: '', specific_goals: '',
    food_allergies: [], dietary_preferences: '', medical_conditions: '',
    meal_frequency: '', water_intake: '', sleep_duration: '', supplement_use: '',
    movement_restrictions: '', sports_enjoyed: '', body_parts: '',
    current_routine: '', additional_notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dietPdfUrl, setDietPdfUrl] = useState(null);
  const [workoutPdfUrl, setWorkoutPdfUrl] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { state: { message: 'Please log in to access this page.' } });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.full_name.trim()) return 'Full name is required.';
    if (!form.age || form.age < 10 || form.age > 100) return 'Age must be 10–100.';
    if (!form.height_cm || form.height_cm < 100 || form.height_cm > 250) return 'Height must be 100–250 cm.';
    if (!form.weight_kg || form.weight_kg < 20 || form.weight_kg > 300) return 'Weight must be 20–300 kg.';
    if (!form.gender) return 'Gender is required.';
    if (!form.activity_level) return 'Activity level is required.';
    if (!form.days_per_week || form.days_per_week < 1 || form.days_per_week > 7) return 'Days per week must be 1–7.';
    if (!form.workout_duration || form.workout_duration < 10) return 'Workout duration required (min 10 min).';
    if (!form.primary_goal) return 'Primary goal is required.';
    if (!form.experience_level) return 'Experience level is required.';
    if (!form.intensity) return 'Intensity is required.';
    if (!form.time_of_day) return 'Time of day is required.';
    if (!form.goal) return 'Diet goal is required.';
    if (!form.cuisine_preference) return 'Cuisine preference is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDietPdfUrl(null);
    setWorkoutPdfUrl(null);

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const user = getUser();
    if (!user) { navigate('/login', { state: { message: 'Please log in.' } }); return; }
    const userId = user.id || user._id || user.email;
    if (!userId) { navigate('/login', { state: { message: 'Session expired.' } }); return; }

    setLoading(true);
    try {
      const orderData = await createOrder({
        amount: PLAN_PRICE, currency: 'INR', user_id: userId, purpose: 'Combo Diet + Workout Plan'
      });
      if (!orderData.id) throw new Error('Failed to create payment order.');

      const payload = {
        ...form,
        food_allergies: form.food_allergies.join(','),
        equipment: form.equipment.join(','),
        preferred_exercises: form.preferred_exercises.join(','),
        user_id: userId,
        workout_frequency: form.days_per_week,
        workout_duration_minutes: form.workout_duration,
      };

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Xerxes Fitness',
        description: 'Combo Diet + Workout Plan',
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const result = await requestComboPlan({
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
                pdf_url: result.dietPdfUrl,
                program_name: `Diet Plan \u2013 ${new Date().toLocaleDateString('en-IN')}`,
              });
              await storeUserProgram({
                program_type: 'workout_plan',
                pdf_url: result.workoutPdfUrl,
                program_name: `Workout Plan \u2013 ${new Date().toLocaleDateString('en-IN')}`,
              });
            }
            setDietPdfUrl(result.dietPdfUrl);
            setWorkoutPdfUrl(result.workoutPdfUrl);
            setSuccess('Your combo plan is ready! Download both PDFs below.');
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
        theme: { color: '#43A047' }
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
              background: 'linear-gradient(90deg, #43A047, #FFD700 50%, #43A047)',
            }
          }}
        >
          <Typography sx={{
            fontFamily: 'Cinzel, serif', fontWeight: 900,
            fontSize: { xs: 18, sm: 22 }, color: '#43A047',
            textAlign: 'center', mb: 0.5, letterSpacing: 1,
          }}>
            Combo: Diet + Workout Plan
          </Typography>
          <Typography sx={{ color: '#888', textAlign: 'center', fontSize: 13, mb: 1 }}>
            The complete transformation package — personalized diet AND workout.
          </Typography>
          <Box sx={{ textAlign: 'center', mb: 3, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Box component="span" sx={{
              bgcolor: 'rgba(67,160,71,0.1)', color: '#43A047', fontWeight: 800,
              fontSize: 18, px: 2, py: 0.5, borderRadius: 1,
              fontFamily: 'Montserrat,sans-serif',
            }}>₹{PLAN_PRICE}</Box>
            <Box component="span" sx={{
              bgcolor: '#FFD700', color: '#000', fontWeight: 800,
              fontSize: 11, px: 1.5, py: 0.3, borderRadius: 1,
              fontFamily: 'Montserrat,sans-serif', textTransform: 'uppercase', letterSpacing: 1,
            }}>Best Value</Box>
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

          {(dietPdfUrl || workoutPdfUrl) && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {dietPdfUrl && (
                <Button
                  href={getPdfDownloadUrl(dietPdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  flex={1}
                  sx={{
                    flex: 1, bgcolor: '#FFD700', color: '#000', fontWeight: 800,
                    fontSize: 13, py: 1.5, borderRadius: 2, letterSpacing: 0.5,
                    fontFamily: 'Montserrat,sans-serif',
                    '&:hover': { bgcolor: '#E6C200' },
                  }}
                >
                  DOWNLOAD DIET PLAN
                </Button>
              )}
              {workoutPdfUrl && (
                <Button
                  href={getPdfDownloadUrl(workoutPdfUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    flex: 1, bgcolor: '#43A047', color: '#fff', fontWeight: 800,
                    fontSize: 13, py: 1.5, borderRadius: 2, letterSpacing: 0.5,
                    fontFamily: 'Montserrat,sans-serif',
                    '&:hover': { bgcolor: '#388E3C' },
                  }}
                >
                  DOWNLOAD WORKOUT PLAN
                </Button>
              )}
            </Box>
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
              <TextField label="Days Per Week *" name="days_per_week" type="number" value={form.days_per_week} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 1, max: 7 }} />
              <TextField label="Duration (min/session) *" name="workout_duration" type="number" value={form.workout_duration} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 10 }} />
            </Box>
            <Box sx={{ mt: 2.5 }}>
              <TextField select label="Experience Level *" name="experience_level" value={form.experience_level} onChange={handleChange} fullWidth required sx={FIELD_SX}>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </Box>

            <SectionLabel>Goals</SectionLabel>
            <TextField select label="Fitness Goal *" name="primary_goal" value={form.primary_goal} onChange={handleChange} fullWidth required sx={FIELD_SX}>
              <MenuItem value="Fat Loss">Fat Loss</MenuItem>
              <MenuItem value="Muscle Gain">Muscle Gain</MenuItem>
              <MenuItem value="Body Recomposition">Body Recomposition</MenuItem>
              <MenuItem value="General Fitness">General Fitness</MenuItem>
              <MenuItem value="Endurance">Endurance</MenuItem>
            </TextField>
            <TextField select label="Diet Goal *" name="goal" value={form.goal} onChange={handleChange} fullWidth required sx={FIELD_SX}>
              <MenuItem value="Fat Loss">Fat Loss</MenuItem>
              <MenuItem value="Weight Gain">Weight Gain</MenuItem>
              <MenuItem value="Lean Muscle Gain">Lean Muscle Gain</MenuItem>
              <MenuItem value="General Health">General Health</MenuItem>
            </TextField>
            <TextField label="Secondary Goals" name="secondary_goals" value={form.secondary_goals} onChange={handleChange} fullWidth sx={FIELD_SX} />
            <TextField label="Specific Goals" name="specific_goals" value={form.specific_goals} onChange={handleChange} fullWidth sx={FIELD_SX} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField select label="Intensity *" name="intensity" value={form.intensity} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }}>
                <MenuItem value="Light">Light</MenuItem>
                <MenuItem value="Moderate">Moderate</MenuItem>
                <MenuItem value="Intense">Intense</MenuItem>
              </TextField>
              <TextField select label="Time of Day *" name="time_of_day" value={form.time_of_day} onChange={handleChange} required sx={{ ...FIELD_SX, mb: 0 }}>
                <MenuItem value="Morning">Morning</MenuItem>
                <MenuItem value="Afternoon">Afternoon</MenuItem>
                <MenuItem value="Evening">Evening</MenuItem>
                <MenuItem value="Flexible">Flexible</MenuItem>
              </TextField>
            </Box>

            <SectionLabel>Diet Preferences</SectionLabel>
            <TextField select label="Cuisine Preference *" name="cuisine_preference" value={form.cuisine_preference} onChange={handleChange} fullWidth required sx={FIELD_SX}>
              <MenuItem value="North Indian">North Indian</MenuItem>
              <MenuItem value="South Indian">South Indian</MenuItem>
              <MenuItem value="Both">Both</MenuItem>
            </TextField>
            <TextField
              select label="Food Allergies" name="food_allergies" value={form.food_allergies}
              onChange={(e) => setForm({ ...form, food_allergies: e.target.value })}
              fullWidth helperText="Select all that apply"
              SelectProps={{ multiple: true, renderValue: (s) => s.join(', ') }}
              sx={FIELD_SX}
            >
              {FOOD_ALLERGY_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField label="Dietary Preferences" name="dietary_preferences" value={form.dietary_preferences} onChange={handleChange} fullWidth sx={FIELD_SX} placeholder="e.g. vegetarian, eggetarian" />

            <SectionLabel>Equipment & Health</SectionLabel>
            <TextField
              select label="Equipment Available" name="equipment" value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              fullWidth SelectProps={{ multiple: true, renderValue: (s) => s.join(', ') }}
              sx={FIELD_SX}
            >
              {EQUIPMENT_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField
              select label="Preferred Exercise Types" name="preferred_exercises" value={form.preferred_exercises}
              onChange={(e) => setForm({ ...form, preferred_exercises: e.target.value })}
              fullWidth SelectProps={{ multiple: true, renderValue: (s) => s.join(', ') }}
              sx={FIELD_SX}
            >
              {EXERCISE_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <TextField label="Medical Conditions" name="medical_conditions" value={form.medical_conditions} onChange={handleChange} fullWidth sx={FIELD_SX} />
            <TextField label="Movement Restrictions" name="movement_restrictions" value={form.movement_restrictions} onChange={handleChange} fullWidth sx={FIELD_SX} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField label="Meal Frequency (meals/day)" name="meal_frequency" type="number" value={form.meal_frequency} onChange={handleChange} sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 1, max: 10 }} />
              <TextField label="Water Intake (liters/day)" name="water_intake" type="number" value={form.water_intake} onChange={handleChange} sx={{ ...FIELD_SX, mb: 0 }} inputProps={{ min: 0, step: 0.5 }} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2.5 }}>
              <TextField label="Sleep Duration (hours/night)" name="sleep_duration" type="number" value={form.sleep_duration} onChange={handleChange} sx={{ ...FIELD_SX, mb: 0 }} />
              <TextField label="Supplement Use" name="supplement_use" value={form.supplement_use} onChange={handleChange} sx={{ ...FIELD_SX, mb: 0 }} />
            </Box>
            <Box sx={{ mt: 2.5 }}>
              <TextField label="Additional Notes" name="additional_notes" value={form.additional_notes} onChange={handleChange} fullWidth multiline rows={2} sx={FIELD_SX} />
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#43A047', color: '#fff', fontWeight: 800,
                fontSize: 15, py: 1.5, borderRadius: 2, letterSpacing: 0.5,
                fontFamily: 'Montserrat,sans-serif', mt: 1,
                '&:hover': { bgcolor: '#388E3C' },
                '&:disabled': { bgcolor: '#333', color: '#666' },
              }}
            >
              {loading
                ? <CircularProgress size={22} sx={{ color: '#fff' }} />
                : `PAY ₹${PLAN_PRICE} & GET MY COMBO PLAN`
              }
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
