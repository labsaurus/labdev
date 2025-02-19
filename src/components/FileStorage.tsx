import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Dialog,
  DialogContent,
  // Add this new import
  DialogContentText,
  ImageList,
  ImageListItem,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CodeIcon from '@mui/icons-material/Code';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { supabase } from '../supabase';
// Add this import near the top with other icons
import LinkIcon from '@mui/icons-material/Link';

interface StorageFile {
  name: string;
  url: string;
  path: string;
  type?: string;
  isImage?: boolean;
  size?: number;  // Add this
}

// Move formatFileSize outside the component
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const FileStorage = () => {
  // Add this new state
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  // Add this new function
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(url);
    setTimeout(() => setCopySuccess(null), 2000);
  };
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .list(`${user?.uid}/`);

      if (error) throw error;

      const fileList = await Promise.all(
        data.map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('files')
            .getPublicUrl(`${user?.uid}/${file.name}`);

          const ext = file.name.toLowerCase().split('.').pop();
          const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');

          return {
            name: file.name,
            url: publicUrl,
            path: `${user?.uid}/${file.name}`,
            isImage,
            size: file.metadata?.size || 0
          };
        })
      );

      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from('files')
        .upload(`${user.uid}/${file.name}`, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (error) {
        console.log('Upload error details:', error); // More detailed error logging
        throw error;
      }
      
      await loadFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
    setUploading(false);
  };

  const handleDelete = async (filePath: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const { error } = await supabase.storage
          .from('files')
          .remove([filePath]);

        if (error) throw error;
        await loadFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const handleDownload = async (_url: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(`${user?.uid}/${fileName}`);
  
      if (error) {
        throw error;
      }
  
      // Create blob URL and trigger download
      const blob = new Blob([data]);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const isPreviewable = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'json', 'txt'].includes(ext || '');
  };

  const handlePreview = async (url: string, fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (['json', 'txt'].includes(ext || '')) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        setTextContent(text);
        setPreviewUrl(url);
      } catch (error) {
        console.error('Error loading text content:', error);
        alert('Failed to load file preview');
      }
    } else {
      setTextContent(null);
      setPreviewUrl(url);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch(ext) {
      case 'pdf':
        return <PictureAsPdfIcon sx={{ width: 40, height: 40, color: '#e94040' }}/> ;
      case 'txt':
        return <TextSnippetIcon sx={{ width: 40, height: 40, color: '#808080' }}/>;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <CodeIcon sx={{ width: 40, height: 40, color: '#f7df1e' }} />;
      default:
        return <InsertDriveFileIcon sx={{ width: 40, height: 40, color: '#808080' }} />;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        File Storage
      </Typography>

      <Stack spacing={3}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
        >
          Upload File
          <input
            type="file"
            hidden
            onChange={handleUpload}
          />
        </Button>

        {uploading && <LinearProgress />}

        <List>
          {files.map((file) => (
            <Box key={file.path}>
              <ListItem
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleCopyUrl(file.url)} 
                      color={copySuccess === file.url ? "success" : "default"}
                      title="Copy URL"
                    >
                      <LinkIcon />
                    </IconButton>
                    {isPreviewable(file.name) && (
                      <IconButton onClick={() => handlePreview(file.url, file.name)} color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleDownload(file.url, file.name)}>
                      <DownloadIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(file.path)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {file.isImage ? (
                    <img 
                      src={file.url} 
                      alt={file.name}
                      style={{ 
                        width: 40, 
                        height: 40, 
                        objectFit: 'cover',
                        borderRadius: 4
                      }}
                    />
                  ) : getFileIcon(file.name)}
                  <ListItemText 
                    primary={file.name}
                    secondary={`${new Date().toLocaleString()} • ${formatFileSize(file.size || 0)}`}
                  />
                </Box>
              </ListItem>
              <Divider />
            </Box>
          ))}
          {files.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No files uploaded yet
            </Typography>
          )}
        </List>
      </Stack>

      <Dialog
        open={Boolean(previewUrl)}
        onClose={() => {
          setPreviewUrl(null);
          setTextContent(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          {textContent ? (
            <DialogContentText
              component="pre"
              sx={{
                p: 2,
                margin: 0,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                maxHeight: '80vh',
                overflow: 'auto'
              }}
            >
              {textContent}
            </DialogContentText>
          ) : previewUrl?.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '80vh', border: 'none' }}
              title="PDF Preview"
            />
          ) : (
            <img
              src={previewUrl || ''}
              alt="Preview"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default FileStorage;
