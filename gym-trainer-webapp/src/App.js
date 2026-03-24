import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Container, Button, IconButton, Drawer, Typography,
  Dialog, DialogContent, Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';

// Pages
import Home from './pages/Home';
import PersonalizeDiet from './pages/PersonalizeDiet';
import PersonalizeWorkout from './pages/PersonalizeWorkout';
import ComboPlan from './pages/ComboPlan';
import About from './pages/About';
import Programs from './pages/Programs';
import Articles from './pages/Articles';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ContactUs from './pages/ContactUs';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RefundPolicy from './pages/RefundPolicy';
import Motive from './pages/Motive';
import FAQs from './pages/FAQs';
import MyPrograms from './pages/MyPrograms';
import Footer from './components/Footer';

import './App.css';
import './index.css';

// ── MUI Dark Theme ───────────────────────────────────────────────────────────
const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#080808', paper: '#111' },
    text: { primary: '#fff', secondary: '#C0C0C0' },
    primary: { main: '#FFD700', contrastText: '#000' },
    secondary: { main: '#C0C0C0', contrastText: '#000' },
    error: { main: '#F44336' },
    success: { main: '#4CAF50' },
    warning: { main: '#FF9800' },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { background: '#080808' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': { borderColor: '#333' },
          '&:hover fieldset': { borderColor: '#FFD700' },
          '&.Mui-focused fieldset': { borderColor: '#FFD700' },
        },
        input: { color: '#fff', backgroundColor: '#1A1A1A' }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: '#888', '&.Mui-focused': { color: '#FFD700' } }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { bgcolor: '#111', '&:hover': { bgcolor: '#1A1A1A' } }
      }
    },
  }
});

// ── King Xerxes Dialog ───────────────────────────────────────────────────────
function XerxesDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#111',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: 3,
          p: 1,
        }
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Avatar
            src="/xerxes-gold.png"
            alt="King Xerxes I"
            sx={{
              width: 80, height: 80,
              border: '2px solid #FFD700',
              flexShrink: 0,
            }}
          />
          <Box>
            <Typography sx={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 900, fontSize: { xs: 18, sm: 22 },
              color: '#FFD700', letterSpacing: 1,
            }}>
              King Xerxes I
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#888', letterSpacing: 1 }}>
              Persian Empire · 486–465 BC
            </Typography>
          </Box>
        </Box>
        <Typography sx={{
          fontFamily: 'Cinzel, serif',
          fontSize: { xs: 14, sm: 16 },
          color: '#C0C0C0',
          lineHeight: 1.8,
          fontStyle: 'italic',
          borderLeft: '3px solid #FFD700',
          pl: 2,
          mb: 3,
        }}>
          "A man's greatest victory is the conquest of himself. Discipline forges the warrior that no enemy can break."
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#555', mb: 3, lineHeight: 1.7 }}>
          Xerxes I ruled the Persian Empire at its peak — commanding armies, demanding excellence, embodying the principle that strength is built through discipline and sacrifice. This spirit lives in every program we build.
        </Typography>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            borderColor: 'rgba(255,215,0,0.3)',
            color: '#FFD700',
            fontWeight: 700,
            py: 1,
            '&:hover': { borderColor: '#FFD700', bgcolor: 'rgba(255,215,0,0.05)' }
          }}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── NavBar ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'About',    to: '/about' },
  { label: 'Programs', to: '/programs' },
  { label: 'Articles', to: '/articles' },
];

function NavBar({ onLogoClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const token = localStorage.getItem('token');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <Box
        component="header"
        sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
          height: { xs: 60, md: 80 },
          bgcolor: '#000',
          borderBottom: scrolled ? '1px solid #222' : '1px solid transparent',
          transition: 'border-color 0.3s',
          display: 'flex', alignItems: 'center',
        }}
      >
        <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {/* Logo — click opens King Xerxes dialog */}
          <Box
            onClick={onLogoClick}
            sx={{ display: 'flex', alignItems: 'center', mr: 'auto', cursor: 'pointer', textDecoration: 'none' }}
          >
            <img
              src="/xerxes-logo.png"
              alt="Xerxes"
              style={{ height: 44, width: 'auto', objectFit: 'contain' }}
            />
          </Box>

          {/* Desktop nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            {NAV_LINKS.map(({ label, to }) => (
              <Button
                key={to}
                component={Link}
                to={to}
                sx={{
                  color: isActive(to) ? '#FFD700' : 'rgba(255,255,255,0.65)',
                  fontWeight: 500,
                  fontSize: 14,
                  px: 2, py: 1,
                  fontFamily: '"Inter", sans-serif',
                  '&:hover': { color: '#fff' },
                  borderBottom: isActive(to) ? '2px solid #FFD700' : '2px solid transparent',
                  borderRadius: 0,
                }}
              >{label}</Button>
            ))}
          </Box>

          {/* Auth buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, ml: 3 }}>
            {token ? (
              <IconButton
                component={Link}
                to="/profile"
                sx={{
                  border: '1px solid rgba(255,215,0,0.3)',
                  color: '#FFD700',
                  width: 40, height: 40,
                  '&:hover': { border: '1px solid #FFD700', bgcolor: 'rgba(255,215,0,0.08)' },
                }}
              >
                <PersonIcon sx={{ fontSize: 20 }} />
              </IconButton>
            ) : (
              <>
                <Button
                  component={Link} to="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#333', color: '#C0C0C0', fontWeight: 600,
                    px: 2.5, fontSize: 13, borderRadius: '99px',
                    '&:hover': { borderColor: '#FFD700', color: '#FFD700', bgcolor: 'transparent' },
                  }}
                >Log In</Button>
                <Button
                  component={Link} to="/signup"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: 'rgba(255,215,0,0.4)', color: '#FFD700', fontWeight: 700,
                    px: 2.5, fontSize: 13, borderRadius: '99px',
                    '&:hover': { borderColor: '#FFD700', bgcolor: 'rgba(255,215,0,0.08)' },
                  }}
                >Sign Up</Button>
              </>
            )}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff', ml: 1 }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { bgcolor: '#111', width: 280, borderLeft: '1px solid #222' } }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box onClick={() => { onLogoClick(); setDrawerOpen(false); }} sx={{ cursor: 'pointer' }}>
              <img src="/xerxes-logo.png" alt="Xerxes" style={{ height: 36 }} />
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#888' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {NAV_LINKS.map(({ label, to }) => (
              <Button
                key={to}
                component={Link}
                to={to}
                fullWidth
                sx={{
                  justifyContent: 'flex-start', px: 2, py: 1.2,
                  color: isActive(to) ? '#FFD700' : '#C0C0C0',
                  fontWeight: isActive(to) ? 700 : 400,
                  fontSize: 15,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', color: '#fff' },
                }}
              >{label}</Button>
            ))}
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #222', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {token ? (
              <Button
                component={Link} to="/profile"
                variant="outlined" fullWidth
                sx={{
                  borderColor: 'rgba(255,215,0,0.3)', color: '#FFD700',
                  fontWeight: 700, borderRadius: '99px',
                  '&:hover': { borderColor: '#FFD700', bgcolor: 'rgba(255,215,0,0.05)' }
                }}
              >
                {user?.full_name?.split(' ')[0] || 'My Profile'}
              </Button>
            ) : (
              <>
                <Button
                  component={Link} to="/login" fullWidth
                  sx={{
                    color: '#C0C0C0', border: '1px solid #333',
                    borderRadius: '99px', fontWeight: 500,
                    '&:hover': { border: '1px solid #555', color: '#fff' }
                  }}
                >Log In</Button>
                <Button
                  component={Link} to="/signup" fullWidth
                  sx={{
                    borderColor: 'rgba(255,215,0,0.4)', color: '#FFD700',
                    border: '1px solid rgba(255,215,0,0.4)',
                    borderRadius: '99px', fontWeight: 700,
                    '&:hover': { border: '1px solid #FFD700', bgcolor: 'rgba(255,215,0,0.05)' }
                  }}
                >Sign Up</Button>
              </>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}

// ── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (this.state.err) return (
      <Box sx={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',bgcolor:'#000',flexDirection:'column',gap:2,p:4 }}>
        <Typography sx={{ color:'#fff', fontSize:20, fontWeight:700, fontFamily:'Montserrat,sans-serif' }}>Something went wrong</Typography>
        <Typography sx={{ color:'#888', fontSize:14 }}>Please refresh the page</Typography>
        <Button
          onClick={() => window.location.reload()}
          variant="outlined"
          sx={{ borderColor:'rgba(255,215,0,0.4)', color:'#FFD700', mt:1,
            '&:hover': { borderColor:'#FFD700', bgcolor:'rgba(255,215,0,0.05)' } }}
        >Refresh</Button>
      </Box>
    );
    return this.props.children;
  }
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [xerxesOpen, setXerxesOpen] = useState(false);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <Box sx={{ bgcolor: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <NavBar onLogoClick={() => setXerxesOpen(true)} />
            <XerxesDialog open={xerxesOpen} onClose={() => setXerxesOpen(false)} />
            <Box component="main" sx={{ flex: 1 }}>
              <Routes>
                <Route path="/"                    element={<Home onLogoClick={() => setXerxesOpen(true)} />} />
                <Route path="/programs"            element={<Programs />} />
                <Route path="/personalize-diet"    element={<PersonalizeDiet />} />
                <Route path="/personalize-workout" element={<PersonalizeWorkout />} />
                <Route path="/personalize-combo"   element={<ComboPlan />} />
                <Route path="/articles"            element={<Articles />} />
                <Route path="/about"               element={<About />} />
                <Route path="/login"               element={<Login />} />
                <Route path="/signup"              element={<Signup />} />
                <Route path="/profile"             element={<Profile />} />
                <Route path="/contact"             element={<ContactUs />} />
                <Route path="/terms"               element={<Terms />} />
                <Route path="/privacy"             element={<Privacy />} />
                <Route path="/refund-policy"       element={<RefundPolicy />} />
                <Route path="/faqs"                element={<FAQs />} />
                <Route path="/motive"              element={<Motive />} />
                <Route path="/my-programs"         element={<MyPrograms />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
