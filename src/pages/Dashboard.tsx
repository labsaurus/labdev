import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  CircularProgress,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

// Keep existing component imports
import KanbanBoard from '../components/KanbanBoard';
import KeywordSaver from '../components/KeywordSaver';
import PromptGenerator from '../components/PromptGenerator';
import Notes from '../components/Notes';
import AsoSpy from '../components/AsoSpy';
import FileStorage from '../components/FileStorage';

// Keep existing icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import KeywordIcon from '@mui/icons-material/Key';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import NotesIcon from '@mui/icons-material/Notes';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

// Add new icon import
import ImageIcon from '@mui/icons-material/Image';

// Add this with other component imports
import AssetMaker from '../components/AssetMaker';

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 48,
  flexDirection: 'row',
  gap: theme.spacing(1),
}));

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard. Please try again.');
        console.error('Dashboard error:', err);
      }
    };

    initializeDashboard();
  }, [user, navigate]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Add to your tabs array
  const tabs = [
    { icon: <DashboardIcon />, label: 'Kanban Board', component: <KanbanBoard /> },
    { icon: <KeywordIcon />, label: 'Keyword Saver', component: <KeywordSaver /> },
    { icon: <SmartToyIcon />, label: 'AI Generator', component: <PromptGenerator /> },
    { icon: <NotesIcon />, label: 'Notes', component: <Notes /> },
    { icon: <SearchIcon />, label: 'ASO Spy', component: <AsoSpy /> },
    { icon: <StorageIcon />, label: 'Storage', component: <FileStorage /> },
    { icon: <ImageIcon />, label: 'Asset Maker', component: <AssetMaker /> }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'repeating-linear-gradient(to right, #FF9800 0%, #FF9800 20%, #4CAF50 20%, #4CAF50 40%, #2196F3 40%, #2196F3 60%, #9C27B0 60%, #9C27B0 80%, #F44336 80%, #F44336 100%)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 0.5,
              background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            KiwotDev
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2}>
            {!isMobile && (
              <Typography 
                variant="body2"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {user?.email}
              </Typography>
            )}
            <IconButton 
              onClick={handleMenuOpen} 
              size="small"
              sx={{
                border: '2px solid rgba(255,255,255,0.2)',
                transition: 'all 0.2s',
                '&:hover': {
                  border: '2px solid rgba(255,255,255,0.4)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Avatar
                sx={{ 
                  bgcolor: 'primary.dark',
                  color: 'white',
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  fontWeight: 600,
                  fontSize: isMobile ? 16 : 20
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5
                }
              }
            }}
          >
            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                '&:hover': {
                  bgcolor: 'error.lighter'
                }
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main content and Footer remain the same ... */}
      {/* Main content with flex-grow */}
      <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={tabIndex}
            onChange={(_, newValue) => setTabIndex(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map((tab, index) => (
              <StyledTab
                key={index}
                icon={tab.icon}
                label={!isMobile ? tab.label : undefined}
                iconPosition="start"
              />
            ))}
          </Tabs>
          <Box sx={{ mt: 2 }}>
            <ErrorBoundary fallback={<Typography color="error">Failed to load content</Typography>}>
              {tabs[tabIndex].component}
            </ErrorBoundary>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[100],
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} KiwotDev. All rights reserved.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton
                size="small"
                color="inherit"
                href="https://github.com/labsaurus"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                size="small"
                color="inherit"
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;