import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Dialog, DialogContent } from '@mui/material';

interface AppData {
  title: string;
  icon: string;
  developer: string;
  category: string;
  rating: string;
  downloads: string;
  description: string;
  screenshots: string[];
}

// Remove the google-play-scraper import
const AsoSpy = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<AppData[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'store-apps.p.rapidapi.com',
          'x-rapidapi-key': 'b27ac9523amsh4e72b6eec963109p1edc52jsncb4794438129'
        }
      };

      const response = await fetch(
        `https://store-apps.p.rapidapi.com/search?q=${encodeURIComponent(searchQuery || 'popular')}&region=us&language=en`,
        options
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.status === "OK" && result.data && result.data.apps && result.data.apps.length > 0) {

        const appList = result.data.apps.map((app: any) => ({
          title: app.app_name || 'Unknown',
          icon: app.app_icon || '', // Changed from app.photos?.app_icon to app.app_icon
          developer: app.app_developer || 'Unknown',
          category: app.app_category || 'Unknown',
          rating: (app.rating || 0).toString(),
          downloads: app.num_downloads || 'Unknown',
          description: app.app_description || '',
          screenshots: app.photos || [] // Changed from app.photos?.screenshots to app.photos
        }));
        
        setApps(appList);
        setSelectedApp(null);
      } else {
        setApps([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ASO Spy
      </Typography>

      <Stack spacing={3}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Search App"
            placeholder="Enter app name or package ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
          >
            {searchQuery.trim() ? 'Search' : 'Load Apps'}
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}

        {apps.length > 0 && (
          <Grid container spacing={2}>
            {apps.map((app, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <img 
                        src={app.icon} 
                        alt={app.title}
                        style={{ width: 48, height: 48, objectFit: 'contain' }}
                      />
                      <Box>
                        <Typography variant="subtitle1" noWrap>
                          {app.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {app.developer}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={`★ ${app.rating}`} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={app.downloads} 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {selectedApp && (
          <Card>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <CardMedia
                  component="img"
                  image={selectedApp.icon}
                  alt={selectedApp.title}
                  sx={{ objectFit: 'contain', p: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedApp.title}
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Developer
                      </Typography>
                      <Typography>{selectedApp.developer}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip label={`Rating: ${selectedApp.rating}`} />
                      <Chip label={`Downloads: ${selectedApp.downloads}`} />
                      <Chip label={selectedApp.category} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {selectedApp.description}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Screenshots
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                        {selectedApp.screenshots.map((screenshot, index) => (
                          <img
                            key={index}
                            src={screenshot}
                            alt={`Screenshot ${index + 1}`}
                            style={{ height: 200, objectFit: 'contain' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = selectedApp.icon; // Use app icon as fallback
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
        )}
      </Stack>
      <Dialog 
        open={Boolean(selectedApp)} 
        onClose={() => setSelectedApp(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          {selectedApp && (
            <Card>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <CardMedia
                    component="img"
                    image={selectedApp.icon}
                    alt={selectedApp.title}
                    sx={{ objectFit: 'contain', p: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {selectedApp.title}
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Developer
                        </Typography>
                        <Typography>{selectedApp.developer}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Chip label={`Rating: ${selectedApp.rating}`} />
                        <Chip label={`Downloads: ${selectedApp.downloads}`} />
                        <Chip label={selectedApp.category} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body2">
                          {selectedApp.description}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Screenshots
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                          {selectedApp.screenshots.map((screenshot, index) => (
                            <img
                              key={index}
                              src={screenshot}
                              alt={`Screenshot ${index + 1}`}
                              style={{ height: 200, objectFit: 'contain' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default AsoSpy;