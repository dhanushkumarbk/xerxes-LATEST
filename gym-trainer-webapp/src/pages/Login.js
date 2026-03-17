import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Container, Paper, InputBase } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Person, Email, Phone, Lock, Cake, Wc, Security } from '@mui/icons-material';

// Email validation function
const validateEmail = (email) => {
  // More comprehensive email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Additional checks for common invalid patterns
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address (e.g., user@example.com)';
  }
  
  // Check for repeated characters (like hdhdhhdh)
  const localPart = email.split('@')[0];
  if (/(.)\1{3,}/.test(localPart)) {
    return 'Email contains too many repeated characters';
  }
  
  // Check for valid domain structure
  const domain = email.split('@')[1];
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return 'Invalid domain format in email address';
  }
  
  // Check for reasonable length
  if (localPart.length > 64 || domain.length > 253) {
    return 'Email address is too long';
  }
  
  // Check for valid TLD (top-level domain)
  const tld = domain.split('.').pop();
  if (tld.length < 2 || tld.length > 6) {
    return 'Invalid domain extension';
  }
  
  return null;
};

const validateCaptcha = (captcha, userInput) => {
  if (!userInput) {
    return 'Please enter the verification code';
  }
  if (userInput.toLowerCase() !== captcha.toLowerCase()) {
    return 'Verification code does not match';
  }
  return null;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();

  // Generate CAPTCHA code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
  };

  // Generate CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Check for messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      if (location.state.message.includes('Successfully logged out')) {
        setSuccessMessage(location.state.message);
      } else {
        setError(location.state.message);
      }
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!email || !password || !captchaInput) {
      setError('Email, password, and verification code are required.');
      return;
    }
    
    // Email validation
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    // CAPTCHA validation (now required)
    const captchaError = validateCaptcha(captchaCode, captchaInput);
    if (captchaError) {
      setError(captchaError);
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const result = await import('../api').then(api => api.loginUser({ email, password }));
      if (result.success) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = '/profile';
      } else {
        setError(result.error || 'Login failed.');
      }
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time email validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && validateEmail(value)) {
      // Clear error if user is typing and it's valid
      if (!error.includes('email')) {
        setError('');
      }
    }
  };

  const handleCaptchaChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCaptchaInput(value);
    if (value && validateCaptcha(captchaCode, value)) {
      if (!error.includes('verification')) {
        setError('');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={12} sx={{ p: 5, borderRadius: 5, boxShadow: '0 8px 32px 0 #FFD70033', bgcolor: 'rgba(17,17,17,0.98)', border: '2px solid #FFD700', maxWidth: 480, mx: 'auto' }}>
          <Typography variant="h4" fontWeight={900} align="center" gutterBottom sx={{ color: '#FFD700', fontSize: { xs: 28, sm: 32 } }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" align="center" sx={{ color: '#ccc', mb: 4, fontSize: 16 }}>
            Sign in to continue your fitness journey
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50' }}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid #f44336' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={handleEmailChange}
              required
              variant="outlined"
              placeholder="user@example.com"
              helperText="Enter a valid email address"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: 18,
                  boxShadow: '0 2px 8px #FFD70022',
                  '& fieldset': { borderColor: '#FFD700' },
                  '&:hover fieldset': { borderColor: '#fff' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                },
                '& .MuiFormHelperText-root': { color: '#888', fontSize: 12 }
              }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              variant="outlined"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: 18,
                  boxShadow: '0 2px 8px #FFD70022',
                  '& fieldset': { borderColor: '#FFD700' },
                  '&:hover fieldset': { borderColor: '#fff' },
                  '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                },
                '& .MuiFormHelperText-root': { color: '#888', fontSize: 12 }
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <Box sx={{ 
                flex: 1, 
                bgcolor: '#222', 
                borderRadius: 3, 
                p: 2, 
                textAlign: 'center',
                border: '2px solid #FFD700',
                boxShadow: '0 2px 8px #FFD70022'
              }}>
                <Typography variant="h5" sx={{ 
                  color: '#FFD700', 
                  fontWeight: 900, 
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                  textShadow: '0 0 10px #FFD700'
                }}>
                  {captchaCode}
                </Typography>
                <Typography variant="caption" sx={{ color: '#888', fontSize: 10 }}>
                  Enter this code
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={generateCaptcha}
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: 14,
                  py: 1.5,
                  px: 2,
                  borderColor: '#FFD700',
                  color: '#FFD700',
                  minWidth: 'auto',
                  '&:hover': {
                    borderColor: '#fff',
                    color: '#fff',
                    bgcolor: 'rgba(255,215,0,0.1)'
                  }
                }}
              >
                NEW
              </Button>
            </Box>

            <TextField
              label="Verification Code"
              type="text"
              fullWidth
              value={captchaInput}
              onChange={handleCaptchaChange}
              required
              variant="outlined"
              placeholder="Enter the code above"
              helperText="Enter the 6-character code shown above"
              InputProps={{
                startAdornment: <Security sx={{ color: '#FFD700', mr: 1 }} />
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: 16,
                  boxShadow: '0 2px 8px #FFD70022',
                  '& fieldset': { borderColor: '#FFD700' },
                  '&:hover fieldset': { borderColor: '#fff' },
                  '&:focus fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                },
                '& .MuiInputLabel-root': { color: '#ccc' },
                '& .MuiInputBase-input': { color: '#fff', textTransform: 'uppercase' },
                '& .MuiFormHelperText-root': { color: '#888', fontSize: 12 }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 2,
                borderRadius: 3,
                fontWeight: 900,
                fontSize: 20,
                py: 1.5,
                boxShadow: '0 4px 16px #FFD70044',
                bgcolor: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)',
                color: '#111',
                '&:hover': {
                  bgcolor: 'linear-gradient(90deg, #fff 60%, #FFD700 100%)',
                  color: '#111',
                  boxShadow: '0 8px 32px #FFD70066'
                }
              }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/signup')}
                sx={{ 
                  fontWeight: 700,
                  color: '#FFD700',
                  textTransform: 'none',
                  fontSize: 14,
                  '&:hover': {
                    color: '#fff',
                    bgcolor: 'rgba(255,215,0,0.1)'
                  }
                }}
              >
                Don't have an account? Create one
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
