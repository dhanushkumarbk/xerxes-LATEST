import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, TextField, MenuItem,
  Button, Alert, CircularProgress, Dialog, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

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
  '& .MuiSelect-icon': { color: '#888' },
};

function SectionLabel({ children }) {
  return (
    <Typography sx={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 1.5, color: '#FFD700', mb: 2, mt: 1,
    }}>
      {children}
    </Typography>
  );
}

export default function Signup() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', gender: '', dob: '',
    password: '', confirmPassword: '',
  });
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [warnOpen, setWarnOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/profile', { replace: true });
    }
  }, [navigate]);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  };

  const isFormFilled = () =>
    Object.values(form).some(v => v.trim && v.trim() !== '');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { fullName, email, phone, gender, dob, password, confirmPassword } = form;

    if (!fullName || !email || !phone || !gender || !dob || !password || !confirmPassword || !captchaInput) {
      setError('All fields are required.');
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Phone number must be at least 10 digits.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (captchaInput.toUpperCase() !== captchaCode) {
      setError('Verification code does not match.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        full_name: fullName,
        email,
        phone,
        gender,
        dob,
        password,
      });
      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = '/profile';
      } else {
        setError(result.error || 'Registration failed. Please try again.');
        refreshCaptcha();
      }
    } catch {
      setError('Registration failed. Please check your connection and try again.');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (isFormFilled()) {
      setWarnOpen(true);
    } else {
      navigate('/login');
    }
  };

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { xs: 10, sm: 12 }, pb: 4 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#111',
            border: '1px solid #222',
            borderRadius: 3,
            p: { xs: 3, sm: 5 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(90deg, #FFD700, #fff 50%, #FFD700)',
            }
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img src="/xerxes-logo.png" alt="Xerxes" style={{ height: 48, objectFit: 'contain' }} />
          </Box>

          <Typography sx={{
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: { xs: 22, sm: 26 }, color: '#FFD700',
            textAlign: 'center', mb: 0.5,
          }}>
            Join Xerxes
          </Typography>
          <Typography sx={{ color: '#888', textAlign: 'center', fontSize: 13, mb: 3 }}>
            Start your transformation today
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#F44336', '& .MuiAlert-icon': { color: '#F44336' } }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <SectionLabel>Personal Info</SectionLabel>

            <TextField
              label="Full Name"
              name="fullName"
              fullWidth
              required
              value={form.fullName}
              onChange={handleChange}
              sx={FIELD_SX}
            />
            <TextField
              label="Phone Number"
              name="phone"
              type="tel"
              fullWidth
              required
              value={form.phone}
              onChange={handleChange}
              helperText="10+ digit mobile number"
              sx={FIELD_SX}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                select
                label="Gender"
                name="gender"
                fullWidth
                required
                value={form.gender}
                onChange={handleChange}
                sx={{ ...FIELD_SX, mb: 0 }}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField
                label="Date of Birth"
                name="dob"
                type="date"
                fullWidth
                required
                value={form.dob}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                sx={{ ...FIELD_SX, mb: 0 }}
              />
            </Box>

            <SectionLabel>Account</SectionLabel>

            <TextField
              label="Email Address"
              name="email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange}
              sx={FIELD_SX}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                required
                value={form.password}
                onChange={handleChange}
                helperText="Minimum 8 characters"
                sx={{ ...FIELD_SX, mb: 0 }}
              />
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                fullWidth
                required
                value={form.confirmPassword}
                onChange={handleChange}
                sx={{ ...FIELD_SX, mb: 0 }}
              />
            </Box>

            <SectionLabel>Verification</SectionLabel>

            <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
              <Box sx={{
                flex: 1, bgcolor: '#1A1A1A', border: '1px solid #333',
                borderRadius: 2, py: 2, px: 3, textAlign: 'center', userSelect: 'none',
              }}>
                <Typography sx={{
                  color: '#FFD700', fontFamily: 'monospace', fontSize: 24,
                  fontWeight: 900, letterSpacing: 8,
                  textDecoration: 'line-through',
                  textDecorationColor: 'rgba(255,215,0,0.25)',
                }}>
                  {captchaCode}
                </Typography>
                <Typography sx={{ color: '#555', fontSize: 10, mt: 0.5 }}>
                  verification code
                </Typography>
              </Box>
              <Button
                onClick={refreshCaptcha}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#333', color: '#888', minWidth: 64, py: 1,
                  borderRadius: 2, fontSize: 11, fontWeight: 700,
                  '&:hover': { borderColor: '#FFD700', color: '#FFD700', bgcolor: 'rgba(255,215,0,0.05)' }
                }}
              >
                NEW
              </Button>
            </Box>
            <TextField
              label="Enter Verification Code"
              fullWidth
              required
              value={captchaInput}
              onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
              inputProps={{ maxLength: 6, style: { textTransform: 'uppercase', letterSpacing: 4 } }}
              sx={FIELD_SX}
            />

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#FFD700', color: '#000', fontWeight: 800,
                fontSize: 15, py: 1.5, mt: 1, borderRadius: 2, letterSpacing: 0.5,
                fontFamily: 'Montserrat, sans-serif',
                '&:hover': { bgcolor: '#E6C200' },
                '&:disabled': { bgcolor: '#333', color: '#666' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#000' }} /> : 'CREATE ACCOUNT'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography sx={{ color: '#888', fontSize: 13 }}>
              Already have an account?{' '}
              <Box
                component="span"
                onClick={handleGoToLogin}
                sx={{ color: '#FFD700', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign In
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Container>

      {/* Warn dialog */}
      <Dialog
        open={warnOpen}
        onClose={() => setWarnOpen(false)}
        PaperProps={{ sx: { bgcolor: '#111', border: '1px solid #333', borderRadius: 3 } }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#FFD700', mb: 1 }}>
            Leave this page?
          </Typography>
          <Typography sx={{ color: '#888', fontSize: 14, lineHeight: 1.7 }}>
            You have unsaved information. Are you sure you want to leave?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setWarnOpen(false)}
            sx={{ borderColor: '#333', color: '#888', borderRadius: 2, px: 3,
              border: '1px solid #333', '&:hover': { borderColor: '#FFD700', color: '#FFD700' } }}
          >
            Stay
          </Button>
          <Button
            onClick={() => navigate('/login')}
            sx={{ bgcolor: '#FFD700', color: '#000', fontWeight: 700, borderRadius: 2, px: 3,
              '&:hover': { bgcolor: '#E6C200' } }}
          >
            Leave Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
