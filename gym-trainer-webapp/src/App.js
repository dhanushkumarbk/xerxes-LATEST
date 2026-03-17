import React, { Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Container, Dialog, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, CircularProgress } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Home from './pages/Home';
import PersonalizeDiet from './pages/PersonalizeDiet';
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
import PersonalizeWorkout from './pages/PersonalizeWorkout';
import ComboPlan from './pages/ComboPlan';
import MyPrograms from './pages/MyPrograms';
import './App.css';
import './global-input-fix.css';

import PremiumButton from './components/PremiumButton';
import Footer from './components/Footer';
import { colors } from './theme';

const darkMuiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000',
      paper: '#000',
    },
    text: {
      primary: '#fff',
      secondary: '#C0C0C0',
    },
    primary: {
      main: '#FFD700',
      contrastText: '#000',
    },
    secondary: {
      main: '#C0C0C0',
      contrastText: '#000',
    },
  },
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#fff',
          backgroundColor: '#000',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          color: '#fff',
          backgroundColor: '#000',
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        input: {
          color: '#fff',
          backgroundColor: '#000',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
      },
    },
  },
});

// Modern Loading Component
const LoadingSpinner = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)'
  }}>
    <Box sx={{ textAlign: 'center' }}>
      <CircularProgress sx={{ color: '#FFD700', mb: 2 }} size={60} />
      <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700 }}>
        Loading...
      </Typography>
    </Box>
  </Box>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          bgcolor: 'linear-gradient(135deg, #181818 60%, #FFD70011 100%)'
        }}>
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" sx={{ color: '#FFD700', mb: 2, fontWeight: 900 }}>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" sx={{ color: '#ccc', mb: 3 }}>
              We're working to fix this issue. Please try refreshing the page.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{
                fontWeight: 700,
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
              Refresh Page
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/about' },
    { label: 'Programs', to: '/programs' },
    { label: 'Articles', to: '/articles' },
  ];
  const [openLogoDialog, setOpenLogoDialog] = React.useState(false);
  // Get user from localStorage (if logged in)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  return (
    <ThemeProvider theme={darkMuiTheme}>
      <Box sx={{ bgcolor: '#000', minHeight: '100vh', width: '100vw', overflowX: 'hidden' }}>
      <Dialog
        open={openLogoDialog}
        onClose={() => setOpenLogoDialog(false)}
        PaperProps={{
          sx: {
            background: '#111',
            color: '#fff',
            borderRadius: 4,
            p: { xs: 2, sm: 4 },
            maxWidth: 600,
            mx: 'auto',
            textAlign: 'center',
            boxShadow: '0 6px 36px 0 #FFD70055',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
          <Box sx={{ minWidth: 90, display: 'flex', justifyContent: 'center' }}>
            <img
              src="/xerxes-gold.png"
              alt="Xerxes"
              style={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: '50%',
                border: '3px solid #FFD700',
                background: '#222',
                boxShadow: '0 2px 18px #FFD70044',
                margin: 0,
              }}
            />
          </Box>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h6" fontWeight={900} sx={{ color: '#FFD700 !important', mb: 1, fontFamily: 'UnifrakturCook, Fraktur, serif', letterSpacing: 1, textShadow: '0 2px 8px #000', fontSize: { xs: 22, sm: 26, md: 28 } }}>
              King Xerxes I
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#FFD700 !important',
                fontFamily: 'UnifrakturCook, Fraktur, serif',
                fontWeight: 700,
                fontSize: { xs: 18, sm: 22, md: 26 },
                letterSpacing: 1,
                lineHeight: 1.5,
                textShadow: '0 2px 12px #000',
                mb: 1.5,
              }}
            >
              “King Xerxes I, the ruler of the Persian Empire, was known for his discipline and rigorous training of his armies. His preparation and endurance symbolized strength and resilience—qualities we embrace in modern physical training.”
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" onClick={() => setOpenLogoDialog(false)} sx={{ color: '#FFD700', borderColor: '#FFD700', borderRadius: 8, px: 4, py: 1, fontWeight: 700, '&:hover': { background: '#181818', borderColor: '#fff', color: '#fff' }, mt: 2 }}>
          Close
        </Button>
      </Dialog>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <AppBar position="fixed" elevation={0} sx={{ bgcolor: '#000', boxShadow: 'none', borderBottom: '1.5px solid #222', width: '100vw', zIndex: 1100 }}>
            <Toolbar disableGutters sx={{ minHeight: { xs: 60, sm: 70, md: 80 }, px: { xs: 1, sm: 2, md: 0 } }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <img
                  src="/xerxes-logo.png"
                  alt="Xerxes Logo"
                  style={{
                    height: 'clamp(48px, 12vw, 120px)',
                    maxHeight: '18vw',
                    width: 'auto',
                    marginLeft: 0,
                    marginRight: 20,
                    display: 'block',
                    filter: 'brightness(1.2) grayscale(1)',
                    marginTop: '-8px',
                    marginBottom: '-8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setOpenLogoDialog(true)}
                />
              </Box>
              {/* Desktop Nav */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', alignItems: 'center', flexGrow: 1 }}>
                {navLinks.map(link => (
                  <Button key={link.label} component={Link} to={link.to} sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Montserrat, Work Sans', px: 2, fontSize: 16, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '2px solid transparent', '&:hover': { color: '#C0C0C0', borderBottom: '2px solid #C0C0C0' } }}>{link.label}</Button>
                ))}
                {!user && (
                  <>
                    <Button component={Link} to="/login" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Montserrat, Work Sans', px: 2, fontSize: 16, letterSpacing: 1, textTransform: 'uppercase', border: '1.5px solid #C0C0C0', ml: 2, borderRadius: '32px', '&:hover': { color: '#C0C0C0', borderColor: '#fff', background: '#111' } }}>Login</Button>
                    <Button component={Link} to="/signup" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Montserrat, Work Sans', px: 3, fontSize: 16, letterSpacing: 1, textTransform: 'uppercase', border: '1.5px solid #C0C0C0', ml: 2, borderRadius: '32px', background: '#111', '&:hover': { color: '#C0C0C0', borderColor: '#fff', background: '#222' } }}>Sign Up</Button>
                  </>
                )}
                {user && (
                  <Button
                    component={Link}
                    to="/profile"
                    sx={{
                      color: '#fff',
                      minWidth: 0,
                      p: 1.2,
                      ml: 2,
                      mr: 0,
                      borderRadius: '50%',
                      border: '1.5px solid #C0C0C0',
                      background: '#111',
                      '&:hover': {
                        color: '#C0C0C0',
                        borderColor: '#fff',
                        background: '#222',
                      },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24" width="32" fill="white"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
                    </span>
                  </Button>
                )}
              </Box>
              {/* Mobile Hamburger */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
                <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                  <MenuIcon sx={{ fontSize: 32 }} />
                </IconButton>
                <Drawer
                  anchor="right"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  PaperProps={{ sx: { bgcolor: '#111', color: '#fff', minWidth: 220 } }}
                >
                  <Box sx={{ width: 240, pt: 2 }} role="presentation" onClick={handleDrawerToggle}>
                    <List>
                      {navLinks.map(link => (
                        <ListItem key={link.label} disablePadding>
                          <ListItemButton component={Link} to={link.to}>
                            <ListItemText primary={link.label} sx={{ textAlign: 'center', fontWeight: 700, fontFamily: 'Montserrat, Work Sans', fontSize: 18, letterSpacing: 1, textTransform: 'uppercase' }} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                      {!user && (
                        <>
                          <ListItem disablePadding>
                            <ListItemButton component={Link} to="/login">
                              <ListItemText primary="Login" sx={{ textAlign: 'center', fontWeight: 700, fontFamily: 'Montserrat, Work Sans', fontSize: 18, letterSpacing: 1, textTransform: 'uppercase' }} />
                            </ListItemButton>
                          </ListItem>
                          <ListItem disablePadding>
                            <ListItemButton component={Link} to="/signup">
                              <ListItemText primary="Sign Up" sx={{ textAlign: 'center', fontWeight: 700, fontFamily: 'Montserrat, Work Sans', fontSize: 18, letterSpacing: 1, textTransform: 'uppercase' }} />
                            </ListItemButton>
                          </ListItem>
                        </>
                      )}
                      {user && (
                        <ListItem disablePadding>
                          <ListItemButton component={Link} to="/profile">
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 0 24 24" width="32" fill="white"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
                            </span>
                          </ListItemButton>
                        </ListItem>
                      )}
                    </List>
                  </Box>
                </Drawer>
              </Box>
            </Toolbar>
          </AppBar>
          <Toolbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/personalize-diet" element={<PersonalizeDiet />} />
            <Route path="/personalize-workout" element={<PersonalizeWorkout />} />
<Route path="/personalize-combo" element={<ComboPlan />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/motive" element={<Motive />} />
            <Route path="/my-programs" element={<MyPrograms />} />
          </Routes>
        </Suspense>
      </Router>
      </Box>
      <Footer />
    </ThemeProvider>
  );
}

export default App;
