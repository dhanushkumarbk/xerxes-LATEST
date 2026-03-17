import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Container, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorIcon from '@mui/icons-material/Error';
import { API_BASE } from '../api';

const MyPrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { message: 'Please login to view your programs' } });
      return;
    }

    fetchPrograms();
  }, [navigate]);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token); // Debug log
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      const response = await fetch(`${API_BASE}/user-programs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response headers:', response.headers); // Debug log

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { state: { message: 'Session expired. Please login again.' } });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Programs data:', data); // Debug log
        setPrograms(data.programs || []);
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText); // Debug log
        throw new Error('Failed to fetch programs');
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Failed to load your programs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (program) => {
    try {
      const token = localStorage.getItem('token');
      
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

      // Download the PDF - remove /api from the base URL for static files
      const baseUrl = API_BASE.replace('/api', '');
      const response = await fetch(`${baseUrl}${program.pdf_url}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${program.program_name || 'program'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download PDF');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <DownloadIcon sx={{ color: '#4caf50' }} />;
      case 'pending':
        return <CircularProgress size={20} sx={{ color: '#ff9800' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready to Download';
      case 'pending':
        return 'Generating...';
      case 'failed':
        return 'Generation Failed';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'failed':
        return '#f44336';
      default:
        return '#666';
    }
  };

  // Group programs for Combo Plan display
  const groupComboPlans = (programs) => {
    const combos = [];
    const singles = [];
    const usedIds = new Set();
    // Sort by created_at ascending
    const sorted = [...programs].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    for (let i = 0; i < sorted.length; i++) {
      const p1 = sorted[i];
      if (usedIds.has(p1.id)) continue;
      if (p1.program_type === 'diet_plan') {
        // Look for a workout plan within 2 minutes
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
  // Filter combos: only show if at least one plan is 'ready'
  const visibleCombos = combos.filter(combo =>
    combo.diet.status === 'ready' || combo.workout.status === 'ready'
  );

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 2 }}>
        <CircularProgress sx={{ color: '#FFD700', mb: 2 }} size={60} />
        <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700 }}>Loading your programs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, px: 2 }}>
      <Container maxWidth="md">
        <Paper elevation={12} sx={{ p: 5, borderRadius: 5, boxShadow: '0 8px 32px 0 #FFD70033', bgcolor: 'rgba(17,17,17,0.98)', border: '2px solid #FFD700', maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h4" fontWeight={900} align="center" sx={{ color: '#FFD700', mb: 4, fontSize: { xs: 28, sm: 32 } }}>
            My Programs
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3, bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid #f44336' }}>
              {error}
            </Alert>
          )}

          {programs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: '#ccc', mb: 2 }}>
                No programs found
              </Typography>
              <Typography variant="body1" sx={{ color: '#888', mb: 4 }}>
                Generate your first diet or workout plan to get started!
              </Typography>
              <Button
                onClick={() => navigate('/programs')}
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
                BROWSE PROGRAMS
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                    Status: {getStatusText(program.status)}
                  </Typography>
                </Paper>
              ))}
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  onClick={fetchPrograms}
                  startIcon={<RefreshIcon />}
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
                  Refresh Programs
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default MyPrograms; 