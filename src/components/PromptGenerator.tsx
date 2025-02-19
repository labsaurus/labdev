import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Tab,
  Tabs,
  IconButton,
  Snackbar,
  CircularProgress,
} from '@mui/material';

// Hapus import yang tidak digunakan:
// Select,
// MenuItem,
// FormControl,
// InputLabel,
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Add these imports
import { generateDescription } from '../utils/gemini';
import DownloadIcon from '@mui/icons-material/Download';

// Add these interfaces
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface AppDescription {
  short: string;
  long: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PromptGenerator = () => {
  const [tabValue, setTabValue] = useState(0);
  const [theme, setTheme] = useState('');
  const [lighting, setLighting] = useState('');
  const [details, setDetails] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('Your prompt will appear here...');
  
  const [characterEmotion, setCharacterEmotion] = useState('');
  const [background, setBackground] = useState('');
  const [colorTheme, setColorTheme] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [iconPrompt, setIconPrompt] = useState('Your prompt will appear here...');
  
  // Hapus language dari state
  const [appName, setAppName] = useState('');
  const [appDetails, setAppDetails] = useState('');
  const [descriptions, setDescriptions] = useState<AppDescription | null>(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const generateBackgroundPrompt = () => {
    const prompt = `A pixelated Minecraft-style background with the theme '${theme || 'a generic theme'}'. 
    The lighting is ${lighting || 'standard lighting'}. 
    It includes ${details || 'basic features'}. 
    The overall image is simple, colorful, and clearly Minecraft-inspired, 
    keeping the blocky aesthetic intact, without any realistic details. 
    The image is in landscape orientation and does not include any UI elements or text.`;

    setGeneratedPrompt(prompt);
  };

  const generateIconPrompt = () => {
    let prompt = `A square game app icon design featuring a close-up of a Minecraft-style character. The character appears ${characterEmotion || 'neutral'}, taking up most of the frame in a fun and vibrant 3D Minecraft-inspired style. In the background, ${background || 'simple Minecraft scenery'}, creating a dynamic scene. The color palette emphasizes ${colorTheme || 'Minecraft-style colors'} for added atmosphere.`;

    if (additionalDetails) {
      prompt += ` Additional details: ${additionalDetails}.`;
    }

    setIconPrompt(prompt);
  };

  const generateAppDescription = async () => {
    if (!appName || !appDetails) return;
    
    setLoading(true);
    try {
      const result = await generateDescription(appName, appDetails);
      if (!result || !result.short || !result.long) {
        throw new Error('Invalid response format');
      }
      setDescriptions(result);
    } catch (error) {
      console.error('Error generating description:', error);
      setDescriptions(null);
      alert('Failed to generate description. Please try again with more specific details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setOpenSnackbar(true);
  };

  const handleDownload = () => {
    if (!descriptions) return;
    
    const content = `App Name: ${appName}\n\nShort Description:\n${descriptions.short}\n\nLong Description:\n${descriptions.long}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/\s+/g, '-')}-description.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4,
          borderRadius: 2,
          background: 'linear-gradient(145deg, #f5f5f5 0%, #ffffff 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            mb: 4,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF9800 30%, #F57C00 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Minecraft Prompt Generator
        </Typography>

        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 3,
          '& .MuiTabs-root': {
            minHeight: 48,
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 500,
              textTransform: 'none',
              minHeight: 48,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                color: '#FF9800'
              }
            }
          }
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            TabIndicatorProps={{
              style: { backgroundColor: '#FF9800' }
            }}
          >
            <Tab label="Background" />
            <Tab label="Icon" />
            <Tab label="App Description" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Stack spacing={3}>
            <TextField
              label="Theme"
              placeholder="e.g., Borobudur, Medieval"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white'
                }
              }}
            />

        <TextField
          label="Lighting"
          placeholder="e.g., bright, sunset"
          value={lighting}
          onChange={(e) => setLighting(e.target.value)}
          fullWidth
        />

        <TextField
          label="Details"
          placeholder="Describe any additional details..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          multiline
          rows={4}
          fullWidth
        />

        <Button 
          variant="contained" 
          onClick={generateBackgroundPrompt}
          sx={{ 
            alignSelf: 'flex-start',
            bgcolor: '#FF9800',
            '&:hover': {
              bgcolor: '#F57C00'
            },
            borderRadius: 2,
            px: 4
          }}
        >
          Generate Prompt
        </Button>

        <Paper sx={{ 
          p: 3, 
          bgcolor: '#fff8e1',
          borderRadius: 2,
          border: '1px solid #FFE0B2'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 2
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 500,
                color: '#E65100'
              }}
            >
              Generated Prompt:
            </Typography>
            <IconButton 
              onClick={() => handleCopyPrompt(generatedPrompt)} 
              size="small"
              sx={{
                color: '#FF9800',
                '&:hover': {
                  bgcolor: 'rgba(255, 152, 0, 0.1)'
                }
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
          <Typography 
            variant="body1"
            sx={{ 
              color: '#424242',
              lineHeight: 1.6
            }}
          >
            {generatedPrompt}
          </Typography>
        </Paper>
      </Stack>
    </TabPanel>
    
    <TabPanel value={tabValue} index={1}>
      <Stack spacing={3}>
        {/* Mods content */}
        <TextField
          label="Character Emotion"
          placeholder="e.g., scared, happy, angry"
          value={characterEmotion}
          onChange={(e) => setCharacterEmotion(e.target.value)}
          fullWidth
        />

        <TextField
          label="Background Description"
          placeholder="e.g., zombies lurking, peaceful forest"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          fullWidth
        />

        <TextField
          label="Color Theme"
          placeholder="e.g., dark green and red, bright and sunny"
          value={colorTheme}
          onChange={(e) => setColorTheme(e.target.value)}
          fullWidth
        />

        <TextField
          label="Additional Details"
          placeholder="e.g., the character is holding a sword"
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          multiline
          rows={4}
          fullWidth
        />

        <Button 
          variant="contained" 
          onClick={generateIconPrompt}
          sx={{ alignSelf: 'flex-start' }}
        >
          Generate Prompt
        </Button>

        <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" gutterBottom>
              Generated Prompt:
            </Typography>
            <IconButton onClick={() => handleCopyPrompt(iconPrompt)} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Box>
          <Typography variant="body1">
            {iconPrompt}
          </Typography>
        </Paper>
      </Stack>
    </TabPanel>
    
    <TabPanel value={tabValue} index={2}>
      <Stack spacing={3}>
        <TextField
          label="App/Game Name"
          placeholder="Enter your app or game name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          fullWidth
        />

        <TextField
          label="App/Game Details"
          placeholder="Describe your app, its features, and target audience..."
          value={appDetails}
          onChange={(e) => setAppDetails(e.target.value)}
          multiline
          rows={4}
          fullWidth
        />

        <Button 
          variant="contained" 
          onClick={generateAppDescription}
          disabled={loading || !appName || !appDetails}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ alignSelf: 'flex-start' }}
        >
          Generate Description
        </Button>

        {descriptions && (
          <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
            <Stack spacing={2}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Short Description:
                  </Typography>
                  <IconButton onClick={() => handleCopyPrompt(descriptions.short)} size="small">
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1">
                  {descriptions.short}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Long Description:
                  </Typography>
                  <IconButton onClick={() => handleCopyPrompt(descriptions.long)} size="small">
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {descriptions.long}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                sx={{ alignSelf: 'flex-start' }}
              >
                Download as TXT
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </TabPanel>
    
    <TabPanel value={tabValue} index={3}>
      <Stack spacing={3}>
        {/* Tokoh content */}
      </Stack>
    </TabPanel>
    
    <TabPanel value={tabValue} index={4}>
      <Stack spacing={3}>
        {/* Other content */}
      </Stack>
    </TabPanel>

    <Snackbar
      open={openSnackbar}
      autoHideDuration={2000}
      onClose={() => setOpenSnackbar(false)}
      message="Prompt copied to clipboard!"
      sx={{
        '& .MuiSnackbarContent-root': {
          bgcolor: '#FF9800',
          color: 'white'
        }
      }}
    />
      </Paper>
    </Box>
  );
};

export default PromptGenerator;