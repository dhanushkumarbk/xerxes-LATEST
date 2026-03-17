import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Button, Paper, Grid, CircularProgress, Container, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Email, Phone, Wc, Cake, Person, Logout, ExitToApp } from '@mui/icons-material';
import { API_BASE } from '../api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrograms, setShowPrograms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { message: 'Please login to view your profile' } });
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { state: { message: 'Session expired. Please login again.' } });
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          throw new Error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        navigate('/login', { state: { message: 'Failed to load profile. Please login again.' } });
      }
    };

    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/user-programs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setPrograms(data.programs || []);
        } else {
          setError('Failed to load programs');
        }
      } catch (err) {
        setError('Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchPrograms();
  }, [navigate]);

  // Combo Plan grouping logic (same as MyPrograms.js)
  const groupComboPlans = (programs) => {
    const combos = [];
    const singles = [];
    const usedIds = new Set();
    const sorted = [...programs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    for (let i = 0; i < sorted.length; i++) {
      const p1 = sorted[i];
      if (usedIds.has(p1.id)) continue;
      if (p1.program_type === 'diet_plan') {
        const match = sorted.find(p2 =>
          p2.program_type === 'workout_plan' &&
          !usedIds.has(p2.id) &&
          Math.abs(new Date(p1.created_at) - new Date(p2.created_at)) < 2 * 60 * 1000
        );
        if (match) {
          combos.push({ diet: p1, workout: match });
          usedIds.add(p1.id);
          usedIds.add(match.id);
          continue;
        }
      }
      if (!usedIds.has(p1.id)) singles.push(p1);
    }
    return { combos, singles };
  };
  const { combos, singles } = groupComboPlans(programs);
  const visibleCombos = combos.filter(combo => combo.diet.status === 'ready' || combo.workout.status === 'ready');

  const handleDownload = async (program) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Log the download
        await fetch(`${API_BASE}/log-pdf-download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            program_id: program.id,
            pdf_url: program.pdf_url
          })
        });
      }
      
      // Download the PDF
      const response = await fetch(`${API_BASE.replace('/api', '')}${program.pdf_url}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${program.program_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('signup_otp');
    localStorage.removeItem('signup_email');
    localStorage.removeItem('login_otp');
    localStorage.removeItem('login_email');
    
    // Redirect to login page
    navigate('/login', { state: { message: 'Successfully logged out' } });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)' }}>
        <Typography variant="h6" sx={{ color: '#FFD700' }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={12} sx={{ p: 5, borderRadius: 5, boxShadow: '0 8px 32px 0 #FFD70033', bgcolor: 'rgba(17,17,17,0.98)', border: '2px solid #FFD700', maxWidth: 600, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#FFD700', color: '#111', fontSize: 32, fontWeight: 900, boxShadow: '0 8px 32px #FFD70044' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={900} sx={{ color: '#FFD700', fontSize: { xs: 28, sm: 32 }, mb: 1, letterSpacing: 1 }}>My Profile</Typography>
            <Typography variant="body1" sx={{ color: '#ccc', fontSize: 16, fontWeight: 500, opacity: 0.8 }}>Welcome back, {user.full_name || 'User'}!</Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 20 }} />Account Details
            </Typography>
            
            <Box sx={{ bgcolor: 'rgba(255,215,0,0.05)', borderRadius: 3, p: 3, mb: 3 }}>
              <Typography variant="body1" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                <span style={{ color: '#FFD700' }}>Name:</span> {user.full_name || 'Not provided'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                <span style={{ color: '#FFD700' }}>Email:</span> {user.email || 'Not provided'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                <span style={{ color: '#FFD700' }}>Phone:</span> {user.phone || 'Not provided'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                <span style={{ color: '#FFD700' }}>Gender:</span> {user.gender || 'Not provided'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                <span style={{ color: '#FFD700' }}>Date of Birth:</span> {user.dob || 'Not provided'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: '#FFD700', opacity: 0.3 }} />

          {/* Combo Plans */}
          {visibleCombos.map((combo, idx) => {
            const bothReady = combo.diet.status === 'ready' && combo.workout.status === 'ready';
            const oneReady = (combo.diet.status === 'ready' && combo.workout.status === 'failed') || (combo.diet.status === 'failed' && combo.workout.status === 'ready');
            return (
              <Paper key={`combo-${combo.diet.id}-${combo.workout.id}`} elevation={8} sx={{ mb: 4, p: 4, borderRadius: 4, bgcolor: 'rgba(67,160,71,0.08)', border: '2px solid #43a047', boxShadow: '0 4px 16px #43a04722' }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: '#43a047', mb: 2 }}>
                  Combo Plan - {new Date(combo.diet.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
                  Created: {new Date(combo.diet.created_at).toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ fontWeight: 700, borderRadius: 3 }}
                    onClick={() => handleDownload(combo.diet)}
                    disabled={combo.diet.status !== 'ready'}
                  >
                    Download Diet Plan
                  </Button>
                  {combo.diet.status === 'failed' && (
                    <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 700, alignSelf: 'center' }}>
                      Diet Plan Failed
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ fontWeight: 700, borderRadius: 3 }}
                    onClick={() => handleDownload(combo.workout)}
                    disabled={combo.workout.status !== 'ready'}
                  >
                    Download Workout Plan
                  </Button>
                  {combo.workout.status === 'failed' && (
                    <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 700, alignSelf: 'center' }}>
                      Workout Plan Failed
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: bothReady ? '#43a047' : oneReady ? '#ff9800' : '#888', fontWeight: 700 }}>
                  Status: {bothReady ? 'Ready' : oneReady ? 'Partially Ready' : 'Generating...'}
                </Typography>
              </Paper>
            );
          })}

          {/* Single Plans */}
          {singles.map((program) => (
            <Paper key={program.id} elevation={6} sx={{ mb: 4, p: 4, borderRadius: 4, bgcolor: 'rgba(255,215,0,0.08)', border: '2px solid #FFD700', boxShadow: '0 4px 16px #FFD70022' }}>
              <Typography variant="h5" fontWeight={900} sx={{ color: '#FFD700', mb: 2 }}>
                {program.program_type === 'diet_plan' ? 'Diet Plan' : 'Workout Plan'} - {new Date(program.created_at).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
                Created: {new Date(program.created_at).toLocaleString()}
              </Typography>
              <Button
                variant="contained"
                color={program.program_type === 'diet_plan' ? 'primary' : 'secondary'}
                sx={{ fontWeight: 700, borderRadius: 3, mb: 2 }}
                onClick={() => handleDownload(program)}
                disabled={program.status !== 'ready'}
              >
                Download PDF
              </Button>
              <Typography variant="body2" sx={{ color: program.status === 'ready' ? '#4caf50' : '#ff9800', fontWeight: 700 }}>
                Status: {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
              </Typography>
            </Paper>
          ))}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              onClick={() => navigate('/my-programs')}
              sx={{
                fontWeight: 900,
                fontSize: 18,
                py: 1.5,
                px: 4,
                borderRadius: 3,
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
              MY PROGRAMS
            </Button>

            <Button
              onClick={handleLogout}
              variant="outlined"
              sx={{
                fontWeight: 700,
                fontSize: 16,
                py: 1.5,
                px: 4,
                borderRadius: 3,
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  bgcolor: 'rgba(244,67,54,0.1)',
                  boxShadow: '0 4px 16px rgba(244,67,54,0.3)'
                }
              }}
              startIcon={<Logout />}
            >
              LOGOUT
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: '#888', fontSize: 12 }}>
              Session active • Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
