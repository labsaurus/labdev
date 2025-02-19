import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Chip, 
  Paper, 
  Typography,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, doc, setDoc, onSnapshot, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  Select,
  MenuItem as SelectMenuItem,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';

interface Keyword {
  id: string;
  text: string;
  category: string;
  createdAt: Date;
}

// Change this line
const CATEGORIES = ['Addon', 'Mods', 'World', 'Tokoh', 'Other'];

const categoryColors = {
  'Addon': '#fce4ec', // soft pink
  'Mods': '#e8f5e9', // soft green
  'World': '#e3f2fd', // soft blue
  'Tokoh': '#fff3e0', // soft orange
  'Other': '#f3e5f5', // soft purple
};

const categoryTextColors = {
  'Addon': '#d81b60', // darker pink
  'Mods': '#43a047', // darker green
  'World': '#1976d2', // darker blue
  'Tokoh': '#f57c00', // darker orange
  'Other': '#8e24aa', // darker purple
};

const KeywordSaver = () => {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [category, setCategory] = useState('General');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('All'); // Add this state

  // Add this function
  const handleKeywordClick = (keyword: string) => {
    const encodedKeyword = encodeURIComponent(keyword);
    window.open(`https://trends.google.com/trends/explore?date=today%203-m&q=${encodedKeyword}`, '_blank');
  };

  // Add this function
  const handleDeleteKeyword = async (keywordId: string) => {
const isConfirmed = window.confirm('Are you sure you want to delete this keyword?');
if (!isConfirmed) {
  console.log('Delete cancelled');
  return;
}

try {
  await deleteDoc(doc(db, 'keywords', keywordId));
  console.log('Keyword deleted successfully');
} catch (error) {
  console.error('Error deleting keyword:', error);
}

  };

  useEffect(() => {
    if (!user) return;

    try {
      const keywordsRef = collection(db, 'keywords');
      const q = query(keywordsRef, where('userId', '==', user.uid));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const keywordData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Keyword[];
        setKeywords(keywordData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching keywords:', error);
      setLoading(false);
    }
  }, [user]);

  const handleAddKeyword = async () => {
    if (!user || !newKeyword.trim()) return;

    const keywordDoc = doc(collection(db, 'keywords'));
    const newKeywordItem: Keyword & { userId: string } = {
      id: keywordDoc.id,
      text: newKeyword.trim(),
      category,
      createdAt: new Date(),
      userId: user.uid
    };

    try {
      await setDoc(keywordDoc, newKeywordItem);
      setNewKeyword('');
    } catch (error) {
      console.error('Error adding keyword:', error);
    }
  };

  const _sortedKeywords = [...keywords].sort((a, b) => {

    if (sortBy === 'date') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    return a.text.localeCompare(b.text);
  });

  // Add this filtered keywords logic before the return statement
  const filteredAndSortedKeywords = [...keywords]
    .filter(keyword => filterCategory === 'All' || keyword.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return a.text.localeCompare(b.text);
    });

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ 
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
            background: 'linear-gradient(45deg, #2196F3 30%, #00BCD4 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Keyword Manager
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter a keyword for ASO"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'white'
                  }
                }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ borderRadius: 2, bgcolor: 'white' }}
                >
                  {CATEGORIES.map(cat => (
                    <SelectMenuItem key={cat} value={cat}>{cat}</SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                onClick={handleAddKeyword}
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  background: 'linear-gradient(45deg, #2196F3 30%, #00BCD4 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #0097A7 90%)',
                  }
                }}
              >
                Add
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              mb={3}
              gap={2}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Saved Keywords ({filteredAndSortedKeywords.length})
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                width={{ xs: '100%', sm: 'auto' }}
              >
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Category"
                    onChange={(e) => setFilterCategory(e.target.value)}
                    sx={{ borderRadius: 2, bgcolor: 'white' }}
                  >
                    <SelectMenuItem value="All">All Categories</SelectMenuItem>
                    {CATEGORIES.map(cat => (
                      <SelectMenuItem key={cat} value={cat}>{cat}</SelectMenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort by"
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ borderRadius: 2, bgcolor: 'white' }}
                  >
                    <SelectMenuItem value="date">Date</SelectMenuItem>
                    <SelectMenuItem value="name">Name</SelectMenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1,
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(0,0,0,0.02)'
            }}>
              {filteredAndSortedKeywords.map((keyword) => (
                <Chip
                  key={keyword.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography component="span">
                        {keyword.text}
                      </Typography>
                      <Typography 
                        component="span" 
                        sx={{ 
                          fontSize: '0.75rem',
                          color: categoryTextColors[keyword.category as keyof typeof categoryTextColors],
                          opacity: 0.8
                        }}
                      >
                        • {keyword.category}
                      </Typography>
                    </Box>
                  }
                  onDelete={() => handleDeleteKeyword(keyword.id)}
                  deleteIcon={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View in Google Trends">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleKeywordClick(keyword.text);
                          }}
                          sx={{ 
                            color: categoryTextColors[keyword.category as keyof typeof categoryTextColors],
                            '&:hover': { 
                              bgcolor: `${categoryColors[keyword.category as keyof typeof categoryColors]}80`
                            }
                          }}
                        >
                          <TrendingUpIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteKeyword(keyword.id);
                        }}
                        sx={{ 
                          color: 'error.light',
                          '&:hover': { bgcolor: '#ffebee' }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ 
                    m: 0.5, 
                    bgcolor: 'white',
                    border: 1,
                    borderColor: 'grey.300',
                    '& .MuiChip-deleteIcon': { 
                      display: 'flex',
                      order: 2,
                      ml: 0.5
                    },
                    '&:hover': {
                      boxShadow: 1,
                      borderColor: 'grey.400'
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default KeywordSaver;