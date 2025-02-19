import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Paper,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ASSET_TYPES = [
  { type: 'icon', width: 512, height: 512, label: 'App Icon', description: 'Main app icon for Play Store listing' },
  { type: 'feature', width: 1024, height: 500, label: 'Featured Image', description: 'Feature graphic displayed at the top of your store listing' },
  { type: 'screenshot', width: 1920, height: 1080, label: 'Screenshot', description: 'High-resolution screenshots of your app' }
];

const AssetMaker = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [processedImages, setProcessedImages] = useState<{ [key: string]: string }>({});

  const resizeImage = (file: File, width: number, height: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(blob as Blob);
          }, 'image/png');
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(type);
    try {
      const assetType = ASSET_TYPES.find(a => a.type === type);
      if (!assetType) return;

      const resizedBlob = await resizeImage(file, assetType.width, assetType.height);
      const url = URL.createObjectURL(resizedBlob);
      
      setProcessedImages(prev => ({ ...prev, [type]: url }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${assetType.width}x${assetType.height}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = (type: string) => {
    const url = processedImages[type];
    if (!url) return;

    const assetType = ASSET_TYPES.find(a => a.type === type);
    if (!assetType) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_${assetType.width}x${assetType.height}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h4" gutterBottom>
          PlayStore Asset Maker
        </Typography>
        <Typography variant="subtitle1">
          Create perfectly sized images for your Play Store listing
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {ASSET_TYPES.map((asset) => (
          <Grid item xs={12} md={4} key={asset.type}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" color="primary">
                  {asset.label}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {asset.width} x {asset.height}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {asset.description}
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={loading === asset.type ? <CircularProgress size={24} /> : <CloudUploadIcon />}
                  disabled={loading !== null}
                  fullWidth
                  sx={{
                    mt: 'auto',
                    py: 1.5,
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    }
                  }}
                >
                  {loading === asset.type ? 'Processing...' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleUpload(e, asset.type)}
                  />
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Image processed and downloaded successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssetMaker;
