import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Container, Paper, Dialog, Avatar, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person, Email, Phone, Lock, Cake, Wc, Security } from '@mui/icons-material';

// Validation functions
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

const validatePhone = (phone) => {
  // Accepts formats: +91-1234567890, 1234567890, 123-456-7890, (123) 456-7890
  const phoneRegex = /^(\+?[\d\s\-\(\)]{10,15})$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number (10-15 digits)';
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

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [showWarning, setShowWarning] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!email || !password || !confirmPassword || !fullName || !phone || !gender || !dob || !captchaInput) {
      setError('Please fill all required fields including verification code.');
      return;
    }
    
    // Email validation
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    // Phone validation
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    // CAPTCHA validation
    const captchaError = validateCaptcha(captchaCode, captchaInput);
    if (captchaError) {
      setError(captchaError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setError('');
    try {
      const result = await import('../api').then(api => api.registerUser({ email, password, full_name: fullName, phone, gender, dob }));
      if (result.success) {
        setError('');
        localStorage.setItem('user', JSON.stringify({ email, full_name: fullName, phone, gender, dob }));
        window.location.href = '/profile';
      } else {
        setError(result.error || 'Signup failed.');
      }
    } catch (err) {
      setError('Signup failed.');
    }
  };

  // Real-time validation handlers
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

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (value && validatePhone(value)) {
      // Clear error if user is typing and it's valid
      if (!error.includes('phone')) {
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

  const navigate = useNavigate();

  const isFormFilled = () => {
    return email || password || confirmPassword || fullName || phone || gender || dob;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      pt: { xs: 15, sm: 18 },
      pb: { xs: 4, sm: 6 }
    }}>
      <Container maxWidth="sm">
        <Paper elevation={16} sx={{ 
          p: { xs: 4, sm: 6 }, 
          borderRadius: 4, 
          boxShadow: '0 16px 64px 0 #FFD70033',
          bgcolor: 'rgba(17,17,17,0.98)',
          border: '2px solid #FFD700',
          maxWidth: 600,
          mx: 'auto',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #FFD700, #fff, #FFD700)',
            borderRadius: '4px 4px 0 0'
          }
        }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2, 
              bgcolor: '#FFD700',
              color: '#111',
              fontSize: 32,
              fontWeight: 900,
              boxShadow: '0 8px 32px #FFD70044'
            }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={900} sx={{ 
              color: '#FFD700', 
              fontSize: { xs: 28, sm: 32 },
              mb: 1,
              letterSpacing: 1
            }}>
              Create Your Account
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#ccc', 
              fontSize: 16, 
              fontWeight: 500,
              opacity: 0.8
            }}>
              Join Xerxes and start your fitness journey today
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ 
              mb: 3, 
              borderRadius: 3,
              bgcolor: 'rgba(244,67,54,0.1)',
              border: '1px solid #f44336'
            }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                color: '#FFD700', 
                mb: 3, 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Person sx={{ fontSize: 20 }} />
                Personal Information
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  label="Full Name"
                  type="text"
                  fullWidth
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: 16,
                      boxShadow: '0 2px 8px #FFD70022',
                      '& fieldset': { borderColor: '#FFD700' },
                      '&:hover fieldset': { borderColor: '#fff' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                    },
                    '& .MuiInputLabel-root': { color: '#ccc' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                />
                
                <TextField
                  label="Phone Number"
                  type="tel"
                  fullWidth
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  variant="outlined"
                  placeholder="e.g., 1234567890 or +91-1234567890"
                  helperText="Enter 10 digit phone number"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: 16,
                      boxShadow: '0 2px 8px #FFD70022',
                      '& fieldset': { borderColor: '#FFD700' },
                      '&:hover fieldset': { borderColor: '#fff' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                    },
                    '& .MuiInputLabel-root': { color: '#ccc' },
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiFormHelperText-root': { color: '#888', fontSize: 12 }
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mt: 3 }}>
                <TextField
                  select
                  label="Gender"
                  fullWidth
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: 16,
                      boxShadow: '0 2px 8px #FFD70022',
                      '& fieldset': { borderColor: '#FFD700' },
                      '&:hover fieldset': { borderColor: '#fff' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                    },
                    '& .MuiInputLabel-root': { color: '#ccc' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </TextField>
                
                <TextField
                  label="Date of Birth"
                  type="date"
                  fullWidth
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: 16,
                      boxShadow: '0 2px 8px #FFD70022',
                      '& fieldset': { borderColor: '#FFD700' },
                      '&:hover fieldset': { borderColor: '#fff' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                    },
                    '& .MuiInputLabel-root': { color: '#ccc' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 4, borderColor: '#FFD700', opacity: 0.3 }} />

            {/* Account Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ 
                color: '#FFD700', 
                mb: 3, 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Lock sx={{ fontSize: 20 }} />
                Account Information
              </Typography>
              
              <TextField
                label="Email Address"
                type="email"
                fullWidth
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
                    fontSize: 16,
                    boxShadow: '0 2px 8px #FFD70022',
                    '& fieldset': { borderColor: '#FFD700' },
                    '&:hover fieldset': { borderColor: '#fff' },
                    '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                  },
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiInputBase-input': { color: '#fff' },
                  '& .MuiFormHelperText-root': { color: '#888', fontSize: 12 }
                }}
              />
              
              <TextField
                label="Phone Number"
                type="tel"
                fullWidth
                value={phone}
                onChange={handlePhoneChange}
                required
                variant="outlined"
                placeholder="e.g., 1234567890 or +91-1234567890"
                helperText="Enter 10 digit phone number"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontSize: 16,
                    boxShadow: '0 2px 8px #FFD70022',
                    '& fieldset': { borderColor: '#FFD700' },
                    '&:hover fieldset': { borderColor: '#fff' },
                    '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                  },
                  '& .MuiInputLabel-root': { color: '#ccc' },
                  '& .MuiInputBase-input': { color: '#fff' },
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

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: 16,
                      boxShadow: '0 2px 8px #FFD70022',
                      '& fieldset': { borderColor: '#FFD700' },
                      '&:hover fieldset': { borderColor: '#fff' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                    },
                    '& .MuiInputLabel-root': { color: '#ccc' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                />
                
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: 16,
                      boxShadow: '0 2px 8px #FFD70022',
                      '& fieldset': { borderColor: '#FFD700' },
                      '&:hover fieldset': { borderColor: '#fff' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700', boxShadow: '0 0 0 2px #FFD70044' }
                    },
                    '& .MuiInputLabel-root': { color: '#ccc' },
                    '& .MuiInputBase-input': { color: '#fff' }
                  }}
                />
              </Box>
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              size="large" 
              sx={{ 
                mt: 2, 
                borderRadius: 3, 
                fontWeight: 900, 
                fontSize: 18, 
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
              CREATE ACCOUNT
            </Button>
            
            <Typography align="center" sx={{ mt: 4, color: '#ccc', fontSize: 14 }}>
              Already have an account?{' '}
              <Button 
                variant="text" 
                size="small" 
                onClick={() => {
                  if (isFormFilled()) {
                    setShowWarning(true);
                  } else {
                    navigate('/login');
                  }
                }} 
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
                Sign In
              </Button>
            </Typography>
          </form>
          
          <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#181818', color: '#fff' }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#FFD700' }}>
                Complete Your Registration
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#ccc' }}>
                Please complete the signup form and click "Create Account" to register.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setShowWarning(false)}
                sx={{
                  fontWeight: 700,
                  borderRadius: 3,
                  boxShadow: '0 2px 8px #FFD70044',
                  bgcolor: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)',
                  color: '#111',
                  '&:hover': {
                    bgcolor: 'linear-gradient(90deg, #fff 60%, #FFD700 100%)',
                    color: '#111',
                    boxShadow: '0 4px 16px #FFD70066'
                  }
                }}
              >
                OK
              </Button>
            </Box>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
