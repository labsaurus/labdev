import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(0);

  // Handle keyboard shortcut (Ctrl + Alt + L)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l') {
        setShowLogin(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle double touch for mobile
  const handleTouch = () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastTouchTime < 300) { // 300ms between touches
      setShowLogin(true);
    }
    setLastTouchTime(currentTime);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    if (attemptCount >= 5) {
      setIsBlocked(true);
      setTimeout(() => {
        setIsBlocked(false);
        setAttemptCount(0);
      }, 300000); // 5 minutes timeout
      return;
    }

    setError('');
    try {
      await signIn(credentials.email, credentials.password);
      navigate('/dashboard');
      setAttemptCount(0);
    } catch (err) {
      setAttemptCount(prev => prev + 1);
      // Replace Firebase-specific error messages with user-friendly ones
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      if (errorMessage.includes('auth/invalid-email')) {
        setError('Invalid email address');
      } else if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
        setError('Invalid email or password');
      } else if (errorMessage.includes('auth/too-many-requests')) {
        setError('Too many failed attempts. Please try again later');
      } else {
        setError('An error occurred. Please try again');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
        py: 4
      }}
      onTouchStart={handleTouch}
    >
      <Container component="main" maxWidth="xs">
        {!showLogin ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We're working on something awesome!
            </Typography>
          </Paper>
        ) : (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  mb: 4,
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: 1
                }}
              >
                KiwotDev
              </Typography>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    width: '100%',
                    borderRadius: 1
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box 
                component="form" 
                onSubmit={handleSubmit}
                sx={{ width: '100%' }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    }
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      bgcolor: 'white',
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      },
                    }
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 4,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #42a5f5 90%)',
                    }
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Login;