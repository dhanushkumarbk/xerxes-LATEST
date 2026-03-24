import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Button,
  Chip, CircularProgress, Alert, Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  fetchProfile, fetchUserPrograms, clearSession, downloadPdf
} from '../api';

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
      icon={<CircularProgress size={12} sx={{ color: '#FF9800 !important', mr: 0.5 }} />}
      label="Generating..."
      size="small"
      sx={{ bgcolor: 'rgba(255,152,0,0.1)', color: '#FF9800', fontWeight: 700, fontSize: 11 }}
    />
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', py: 1.5, borderBottom: '1px solid #1A1A1A', alignItems: 'flex-start' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: '#888', width: 130, flexShrink: 0, pt: 0.2 }}>
        {label}
      </Typography>
      <Typography sx={{ color: '#fff', fontSize: 14 }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadError, setDownloadError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { message: 'Please log in to view your profile.' } });
      return;
    }

    const load = async () => {
      try {
        const profileData = await fetchProfile();
        if (!profileData.user) {
          clearSession();
          navigate('/login', { state: { message: 'Session expired. Please log in again.' } });
          return;
        }
        setUser(profileData.user);
      } catch {
        clearSession();
        navigate('/login', { state: { message: 'Failed to load profile. Please log in again.' } });
        return;
      }

      try {
        const progData = await fetchUserPrograms();
        if (progData.success) setPrograms(progData.programs || []);
      } catch {
        // silently fail for programs
      }

      setLoading(false);
    };

    load();
  }, [navigate]);

  const handleDownload = async (program) => {
    setDownloadError('');
    try {
      await downloadPdf(program);
    } catch {
      setDownloadError('Download failed. Please try again.');
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login', { state: { message: 'You have been logged out.' } });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#000', gap: 2 }}>
        <CircularProgress sx={{ color: '#FFD700' }} />
        <Typography sx={{ color: '#888', fontSize: 14 }}>Loading your profile...</Typography>
      </Box>
    );
  }

  if (!user) return null;

  const { combos, singles } = groupComboPlans(programs);
  const recentPrograms = [...combos, ...singles].slice(0, 3);

  return (
    <Box sx={{ bgcolor: '#000', minHeight: '100vh', pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">

        {downloadError && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', color: '#F44336' }} onClose={() => setDownloadError('')}>
            {downloadError}
          </Alert>
        )}

        {/* Profile Card */}
        <Paper elevation={0} sx={{
          bgcolor: '#111', border: '1px solid #222', borderRadius: 3,
          p: { xs: 3, sm: 5 }, mb: 3, position: 'relative', overflow: 'hidden',
          '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #FFD700, #fff 50%, #FFD700)' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,215,0,0.15)', border: '2px solid rgba(255,215,0,0.3)' }}>
              <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: 24, color: '#FFD700' }}>
                {(user.full_name || 'U')[0].toUpperCase()}
              </Typography>
            </Avatar>
            <Box>
              <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: { xs: 20, sm: 24 }, color: '#fff' }}>
                {user.full_name || 'User'}
              </Typography>
              <Typography sx={{ color: '#888', fontSize: 13 }}>
                Xerxes Member
              </Typography>
            </Box>
          </Box>

          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="Gender" value={user.gender} />
          <InfoRow label="Date of Birth" value={user.dob} />
          <InfoRow label="Member Since" value={user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : null} />
        </Paper>

        {/* Programs Preview */}
        {recentPrograms.length > 0 && (
          <Paper elevation={0} sx={{
            bgcolor: '#111', border: '1px solid #222', borderRadius: 3,
            p: { xs: 3, sm: 4 }, mb: 3,
          }}>
            <Typography sx={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 800, color: '#fff', fontSize: 16, mb: 2 }}>
              Recent Programs
            </Typography>

            {combos.slice(0, 2).map((combo, idx) => (
              <Box key={`combo-${idx}`} sx={{ border: '1px solid rgba(67,160,71,0.3)', borderRadius: 2, p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: '#43A047', fontSize: 14 }}>
                    Combo Plan — {new Date(combo.diet.created_at).toLocaleDateString('en-IN')}
                  </Typography>
                  <StatusChip status={combo.diet.status === 'ready' && combo.workout.status === 'ready' ? 'ready' : combo.diet.status === 'pending' || combo.workout.status === 'pending' ? 'pending' : 'ready'} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button size="small" disabled={combo.diet.status !== 'ready'} onClick={() => handleDownload(combo.diet)}
                    sx={{ bgcolor: 'rgba(255,215,0,0.1)', color: '#FFD700', fontWeight: 700, fontSize: 12, borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(255,215,0,0.2)' }, '&:disabled': { color: '#555' } }}>
                    Diet Plan PDF
                  </Button>
                  <Button size="small" disabled={combo.workout.status !== 'ready'} onClick={() => handleDownload(combo.workout)}
                    sx={{ bgcolor: 'rgba(67,160,71,0.1)', color: '#43A047', fontWeight: 700, fontSize: 12, borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(67,160,71,0.2)' }, '&:disabled': { color: '#555' } }}>
                    Workout Plan PDF
                  </Button>
                </Box>
              </Box>
            ))}

            {singles.slice(0, 2).map((program) => (
              <Box key={program.id} sx={{
                border: `1px solid ${program.program_type === 'diet_plan' ? 'rgba(255,215,0,0.2)' : 'rgba(33,150,243,0.2)'}`,
                borderRadius: 2, p: 2, mb: 2,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: program.program_type === 'diet_plan' ? '#FFD700' : '#2196F3', fontSize: 14 }}>
                    {program.program_name || (program.program_type === 'diet_plan' ? 'Diet Plan' : 'Workout Plan')}
                  </Typography>
                  <StatusChip status={program.status} />
                </Box>
                <Typography sx={{ color: '#555', fontSize: 11, mb: 1.5 }}>
                  {new Date(program.created_at).toLocaleDateString('en-IN')}
                </Typography>
                <Button size="small" disabled={program.status !== 'ready'} onClick={() => handleDownload(program)}
                  sx={{
                    bgcolor: program.program_type === 'diet_plan' ? 'rgba(255,215,0,0.1)' : 'rgba(33,150,243,0.1)',
                    color: program.program_type === 'diet_plan' ? '#FFD700' : '#2196F3',
                    fontWeight: 700, fontSize: 12, borderRadius: 1.5,
                    '&:hover': { bgcolor: program.program_type === 'diet_plan' ? 'rgba(255,215,0,0.2)' : 'rgba(33,150,243,0.2)' },
                    '&:disabled': { color: '#555' }
                  }}>
                  Download PDF
                </Button>
              </Box>
            ))}
          </Paper>
        )}

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            onClick={() => navigate('/my-programs')}
            variant="outlined"
            sx={{
              flex: 1, minWidth: 160,
              borderColor: 'rgba(255,215,0,0.3)', color: '#FFD700',
              fontWeight: 700, py: 1.5, borderRadius: 2,
              fontFamily: 'Montserrat,sans-serif', fontSize: 13,
              '&:hover': { borderColor: '#FFD700', bgcolor: 'rgba(255,215,0,0.05)' }
            }}
          >
            VIEW ALL PROGRAMS
          </Button>
          <Button
            onClick={handleLogout}
            variant="outlined"
            sx={{
              flex: 1, minWidth: 160,
              borderColor: '#333', color: '#888',
              fontWeight: 700, py: 1.5, borderRadius: 2,
              fontFamily: 'Montserrat,sans-serif', fontSize: 13,
              '&:hover': { borderColor: '#F44336', color: '#F44336', bgcolor: 'rgba(244,67,54,0.05)' }
            }}
          >
            LOG OUT
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
