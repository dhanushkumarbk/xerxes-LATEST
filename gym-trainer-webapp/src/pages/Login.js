import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, TextField,
  Button, Alert, CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from '../api';

const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const validateEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
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
  '& .MuiFormHelperText-root': { color: '#555', fontSize: 11 },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/profile', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMsg(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !captchaInput) {
      setError('All fields are required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (captchaInput.toUpperCase() !== captchaCode) {
      setError('Verification code does not match.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser({ email, password });
      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = '/profile';
      } else {
        if (result.error && (result.error.includes('Invalid') || result.error.includes('password') || result.error.includes('credentials'))) {
          setError('Invalid email or password.');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
        refreshCaptcha();
      }
    } catch {
      setError('Login failed. Please check your connection and try again.');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: 10, pb: 4 }}>
      <Container maxWidth="xs">
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
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img src="/xerxes-logo.png" alt="Xerxes" style={{ height: 48, objectFit: 'contain' }} />
          </Box>

          <Typography sx={{
            fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
            fontSize: { xs: 22, sm: 26 }, color: '#FFD700',
            textAlign: 'center', mb: 0.5,
          }}>
            Welcome Back
          </Typography>
          <Typography sx={{ color: '#888', textAlign: 'center', fontSize: 13, mb: 3 }}>
            Sign in to continue your fitness journey
          </Typography>

          {successMsg && (
            <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', color: '#4CAF50', '& .MuiAlert-icon': { color: '#4CAF50' } }}>
              {successMsg}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#F44336', '& .MuiAlert-icon': { color: '#F44336' } }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              sx={FIELD_SX}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              sx={FIELD_SX}
            />

            {/* Captcha */}
            <Box sx={{ mb: 2 }}>
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
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
                required
                inputProps={{ maxLength: 6, style: { textTransform: 'uppercase', letterSpacing: 4 } }}
                sx={FIELD_SX}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                bgcolor: '#FFD700', color: '#000', fontWeight: 800,
                fontSize: 15, py: 1.5, borderRadius: 2, letterSpacing: 0.5,
                fontFamily: 'Montserrat, sans-serif',
                '&:hover': { bgcolor: '#E6C200' },
                '&:disabled': { bgcolor: '#333', color: '#666' },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#000' }} /> : 'SIGN IN'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography sx={{ color: '#888', fontSize: 13 }}>
              Don't have an account?{' '}
              <Box
                component="span"
                onClick={() => navigate('/signup')}
                sx={{ color: '#FFD700', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign Up
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
