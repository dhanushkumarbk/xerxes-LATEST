import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, Button, Paper, Chip, CircularProgress, Alert
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { fetchUserPrograms, clearSession, downloadPdf } from '../api';

const groupComboPlans = (programs) => {
  const combos = [], singles = [], usedIds = new Set();
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

function StatusChip({ status }) {
  if (status === 'ready') return (
    <Chip label="Ready" size="small" sx={{ bgcolor: 'rgba(76,175,80,0.1)', color: '#4CAF50', fontWeight: 700, fontSize: 11 }} />
  );
  if (status === 'failed') return (
    <Chip label="Failed" size="small" sx={{ bgcolor: 'rgba(244,67,54,0.1)', color: '#F44336', fontWeight: 700, fontSize: 11 }} />
  );
  return (
    <Chip
      icon={<CircularProgress size={12} sx={{ color: '#FF9800 !important' }} />}
      label="Generating..."
      size="small"
      sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#FF9800', fontWeight: 700, fontSize: 11 }}
    />
  );
}

export default function MyPrograms() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadError, setDownloadError] = useState('');

  const load = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { message: 'Please log in to view your programs.' } });
      return;
    }
    setError('');
    try {
      const data = await fetchUserPrograms();
      if (data.success) {
        setPrograms(data.programs || []);
      } else if (data.status === 401 || data.status === 403) {
        clearSession();
        navigate('/login', { state: { message: 'Session expired.' } });
      } else {
        setError('Failed to load programs.');
      }
    } catch {
      setError('Failed to load programs. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login', { state: { message: 'Please log in to view your programs.' } });
      return;
    }
    load();
  }, [load, navigate]);

  // Auto-refresh every 30s if any program is pending
  useEffect(() => {
    const hasPending = programs.some(p => p.status === 'pending');
    if (!hasPending) return;
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [programs, load]);

  const handleDownload = async (program) => {
    setDownloadError('');
    try {
      await downloadPdf(program);
    } catch {
      setDownloadError('Download failed. Please try again.');
    }
  };

  const { combos, singles } = groupComboPlans(programs);
  const hasPrograms = combos.length > 0 || singles.length > 0;

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 4, md: 6 }, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{
              fontFamily: 'Montserrat, sans-serif', fontWeight: 900,
              fontSize: { xs: 24, md: 32 }, color: '#FFD700', letterSpacing: 2,
            }}>
              MY PROGRAMS
            </Typography>
            <Typography sx={{ color: '#888', fontSize: 13, mt: 0.5 }}>
              Your purchased fitness plans
            </Typography>
          </Box>
          <Button
            onClick={load}
            variant="outlined"
            startIcon={<RefreshIcon />}
            sx={{
              borderColor: 'rgba(255,215,0,0.3)', color: '#FFD700',
              fontWeight: 700, borderRadius: 2, fontSize: 13,
              '&:hover': { borderColor: '#FFD700', bgcolor: 'rgba(255,215,0,0.05)' }
            }}
          >
            REFRESH
          </Button>
        </Box>

        {downloadError && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#F44336' }} onClose={() => setDownloadError('')}>
            {downloadError}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#F44336' }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress sx={{ color: '#FFD700' }} size={28} />
            <Typography sx={{ color: '#888' }}>Loading programs...</Typography>
          </Box>
        )}

        {!loading && !hasPrograms && (
          <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
            <Typography sx={{ color: '#555', fontSize: 40, mb: 2 }}>📋</Typography>
            <Typography sx={{ color: '#888', fontSize: 16, mb: 1 }}>No programs yet.</Typography>
            <Typography sx={{ color: '#555', fontSize: 13, mb: 4 }}>
              Purchase a plan to get started on your transformation journey.
            </Typography>
            <Button
              onClick={() => navigate('/programs')}
              sx={{
                bgcolor: '#FFD700', color: '#000', fontWeight: 800,
                px: 4, py: 1.5, borderRadius: 2, fontSize: 14,
                fontFamily: 'Montserrat,sans-serif',
                '&:hover': { bgcolor: '#E6C200' }
              }}
            >
              BROWSE PLANS
            </Button>
          </Box>
        )}

        {/* Combo Plans */}
        {combos.map((combo, idx) => (
          <Paper key={`combo-${idx}`} elevation={0} sx={{
            bgcolor: '#111', border: '1px solid rgba(67,160,71,0.3)',
            borderRadius: 3, p: { xs: 3, sm: 4 }, mb: 3, position: 'relative', overflow: 'hidden',
            '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #43A047, #FFD700 50%, #43A047)' }
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: '#43A047', fontSize: 16 }}>
                  Combo Plan
                </Typography>
                <Typography sx={{ color: '#555', fontSize: 12, mt: 0.3 }}>
                  {new Date(combo.diet.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
              </Box>
              <StatusChip status={
                combo.diet.status === 'ready' && combo.workout.status === 'ready' ? 'ready' :
                (combo.diet.status === 'pending' || combo.workout.status === 'pending') ? 'pending' : 'failed'
              } />
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                size="small"
                disabled={combo.diet.status !== 'ready'}
                onClick={() => handleDownload(combo.diet)}
                sx={{
                  bgcolor: 'rgba(255,215,0,0.1)', color: '#FFD700', fontWeight: 700,
                  fontSize: 12, borderRadius: 1.5,
                  '&:hover': { bgcolor: 'rgba(255,215,0,0.2)' },
                  '&:disabled': { color: '#555' }
                }}
              >
                Download Diet Plan PDF
              </Button>
              <Button
                size="small"
                disabled={combo.workout.status !== 'ready'}
                onClick={() => handleDownload(combo.workout)}
                sx={{
                  bgcolor: 'rgba(67,160,71,0.1)', color: '#43A047', fontWeight: 700,
                  fontSize: 12, borderRadius: 1.5,
                  '&:hover': { bgcolor: 'rgba(67,160,71,0.2)' },
                  '&:disabled': { color: '#555' }
                }}
              >
                Download Workout Plan PDF
              </Button>
            </Box>
          </Paper>
        ))}

        {/* Single Plans */}
        {singles.map((program) => {
          const isDiet = program.program_type === 'diet_plan';
          const accentColor = isDiet ? '#FFD700' : '#2196F3';
          const barGradient = isDiet
            ? 'linear-gradient(90deg, #FFD700, #fff 50%, #FFD700)'
            : 'linear-gradient(90deg, #2196F3, #fff 50%, #2196F3)';
          return (
            <Paper key={program.id} elevation={0} sx={{
              bgcolor: '#111',
              border: `1px solid ${isDiet ? 'rgba(255,215,0,0.25)' : 'rgba(33,150,243,0.25)'}`,
              borderRadius: 3, p: { xs: 3, sm: 4 }, mb: 3, position: 'relative', overflow: 'hidden',
              '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: barGradient }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: accentColor, fontSize: 16 }}>
                    {program.program_name || (isDiet ? 'Diet Plan' : 'Workout Plan')}
                  </Typography>
                  <Typography sx={{ color: '#555', fontSize: 12, mt: 0.3 }}>
                    {new Date(program.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                </Box>
                <StatusChip status={program.status} />
              </Box>
              <Button
                size="small"
                disabled={program.status !== 'ready'}
                onClick={() => handleDownload(program)}
                sx={{
                  bgcolor: isDiet ? 'rgba(255,215,0,0.1)' : 'rgba(33,150,243,0.1)',
                  color: accentColor, fontWeight: 700, fontSize: 12, borderRadius: 1.5,
                  '&:hover': { bgcolor: isDiet ? 'rgba(255,215,0,0.2)' : 'rgba(33,150,243,0.2)' },
                  '&:disabled': { color: '#555' }
                }}
              >
                Download PDF
              </Button>
            </Paper>
          );
        })}

        {!loading && hasPrograms && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              onClick={() => navigate('/programs')}
              variant="outlined"
              sx={{
                borderColor: 'rgba(255,215,0,0.3)', color: '#FFD700', fontWeight: 700,
                borderRadius: 2, px: 4, py: 1.2, fontSize: 13,
                '&:hover': { borderColor: '#FFD700', bgcolor: 'rgba(255,215,0,0.05)' }
              }}
            >
              BUY ANOTHER PLAN
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
