import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  CircularProgress,
  Checkbox,
  IconButton,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteIcon from '@mui/icons-material/Delete';
import TimerIcon from '@mui/icons-material/Timer';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

interface Task {
  id: string;
  content: string;
  completed?: boolean;
  startTime?: number;
  deadline?: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface BoardData {
  [key: string]: Column;
}

const initialColumns: BoardData = {
  todo: {
    id: 'todo',
    title: 'To Do',
    tasks: []
  },
  inProgress: {
    id: 'inProgress',
    title: 'In Progress',
    tasks: []
  },
  done: {
    id: 'done',
    title: 'Done',
    tasks: []
  }
};

const columnColors = {
  todo: '#fff3e0',
  inProgress: '#e8eaf6',
  done: '#e0f2f1'
};

const columnHeaderColors = {
  todo: '#ff9800',
  inProgress: '#3f51b5',
  done: '#009688'
};

const KanbanBoard = () => {
  const { user } = useAuth();
  const [columns, setColumns] = useState<BoardData>(initialColumns);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number>(1);
  const [timers, setTimers] = useState<{ [key: string]: NodeJS.Timer }>({});
  const [durations, setDurations] = useState<{ [key: string]: number }>({});

  const getRemainingTime = (deadline: number) => {
    const now = Date.now();
    const remaining = deadline - now;
    
    if (remaining <= 0) {
      return 'PEMALAS! 😴';
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days} hari ${hours} jam ${minutes} menit ${seconds} detik tersisa`;
    }
    if (hours > 0) {
      return `${hours} jam ${minutes} menit ${seconds} detik tersisa`;
    }
    if (minutes > 0) {
      return `${minutes} menit ${seconds} detik tersisa`;
    }
    return `${seconds} detik tersisa`;
  };

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'boards', user.uid);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.columns) {
          const boardData: BoardData = {
            todo: {
              ...initialColumns.todo,
              tasks: Array.isArray(data.columns.todo?.tasks) ? data.columns.todo.tasks : []
            },
            inProgress: {
              ...initialColumns.inProgress,
              tasks: Array.isArray(data.columns.inProgress?.tasks) ? data.columns.inProgress.tasks : []
            },
            done: {
              ...initialColumns.done,
              tasks: Array.isArray(data.columns.done?.tasks) ? data.columns.done.tasks : []
            }
          };
          setColumns(boardData);

          // Start timers for tasks with deadlines
          boardData.inProgress.tasks.forEach(task => {
            if (task.deadline && !timers[task.id]) {
              startTimer(task.id);
            }
          });
        } else {
          setColumns(initialColumns);
        }
      } else {
        setDoc(docRef, {
          userId: user.uid,
          columns: initialColumns
        });
        setColumns(initialColumns);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      Object.values(timers).forEach(timer => clearInterval(timer));
    };
  }, [user]);

  const startTimer = (taskId: string) => {
    const timer = setInterval(() => {
      setDurations(prev => ({
        ...prev,
        [taskId]: Date.now()
      }));
    }, 1000);
    setTimers(prev => ({ ...prev, [taskId]: timer }));
  };

  const updateBoard = async (newColumns: BoardData) => {
    if (!user) return;
    try {
      const cleanColumns = Object.keys(newColumns).reduce((acc, key) => {
        acc[key] = {
          id: newColumns[key].id,
          title: newColumns[key].title,
          tasks: newColumns[key].tasks || []
        };
        return acc;
      }, {} as BoardData);

      await setDoc(doc(db, 'boards', user.uid), {
        userId: user.uid,
        columns: cleanColumns
      });
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      const deadline = Date.now() + (selectedDays * 24 * 60 * 60 * 1000);
      const newTaskItem: Task = {
        id: `task-${Date.now()}`,
        content: newTask,
        completed: false,
        deadline: deadline
      };
      
      const updatedColumns = {
        ...columns,
        todo: {
          ...columns.todo,
          tasks: [...columns.todo.tasks, newTaskItem]
        }
      };
      
      setColumns(updatedColumns);
      await updateBoard(updatedColumns);
      setNewTask('');
      setIsDialogOpen(false);
    }
  };

  const moveTask = async (taskId: string, fromColumn: string, toColumn: string) => {
    const newColumns = { ...columns };
    const taskIndex = newColumns[fromColumn].tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      const [task] = newColumns[fromColumn].tasks.splice(taskIndex, 1);
      
      if (toColumn === 'inProgress' && task.deadline) {
        startTimer(task.id);
      } else if (fromColumn === 'inProgress') {
        if (timers[task.id]) {
          clearInterval(timers[task.id]);
          setTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[task.id];
            return newTimers;
          });
        }
      }

      newColumns[toColumn].tasks.push(task);
      setColumns(newColumns);
      await updateBoard(newColumns);
    }
  };

  const deleteTask = async (columnId: string, taskId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this task?');
    if (!isConfirmed) return;
  
    try {
      if (timers[taskId]) {
        clearInterval(timers[taskId]);
        setTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[taskId];
          return newTimers;
        });
      }

      const newColumns = { ...columns };
      newColumns[columnId].tasks = newColumns[columnId].tasks.filter(task => task.id !== taskId);
      setColumns(newColumns);
      await updateBoard(newColumns);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" gutterBottom>
          Task Board
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'grey.100'
            }
          }}
        >
          Add New Task
        </Button>
      </Paper>
      
      <Box sx={{ 
        display: 'flex', 
        gap: 3,
        overflowX: 'auto',
        pb: 2
      }}>
        {Object.entries(columns).map(([columnId, column]) => (
          <Box key={column.id} sx={{ 
            minWidth: 400, // Increased from 300
            width: 400,    // Increased from 300
          }}>
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: columnColors[columnId as keyof typeof columnColors],
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s'
                }
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: columnHeaderColors[columnId as keyof typeof columnHeaderColors],
                  fontWeight: 'bold',
                  pb: 2,
                  borderBottom: 1,
                  borderColor: 'grey.300'
                }}
              >
                {column.title} ({column.tasks.length})
              </Typography>
              <Box sx={{ 
                minHeight: 500,
                maxHeight: '70vh',
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                }
              }}>
                {column.tasks.map((task) => (
                  <Paper
                    key={task.id}
                    sx={{ 
                      p: 2, 
                      mb: 1, 
                      bgcolor: '#ffffff',
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: 1,
                      borderRadius: 1,
                      boxShadow: 1,
                      '&:hover': {
                        boxShadow: 2,
                        bgcolor: '#fafafa'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={columnId === 'done'}
                            onChange={() => moveTask(task.id, columnId, columnId === 'done' ? 'todo' : 'done')}
                            sx={{ '&.Mui-checked': { color: columnHeaderColors[columnId as keyof typeof columnHeaderColors] } }}
                          />
                        }
                        label={
                          <Typography 
                            sx={{ 
                              textDecoration: columnId === 'done' ? 'line-through' : 'none',
                              color: columnId === 'done' ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {task.content}
                          </Typography>
                        }
                        sx={{ flexGrow: 1 }}
                      />
                      {columnId !== 'done' && (
                        <IconButton
                          size="small"
                          sx={{ 
                            color: columnHeaderColors[columnId as keyof typeof columnHeaderColors],
                            '&:hover': { bgcolor: `${columnColors[columnId as keyof typeof columnColors]}50` }
                          }}
                          onClick={() => moveTask(task.id, columnId, columnId === 'todo' ? 'inProgress' : 'done')}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        sx={{ 
                          color: 'error.light',
                          '&:hover': { bgcolor: '#ffebee' }
                        }}
                        onClick={() => deleteTask(columnId, task.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    {task.deadline && columnId !== 'done' && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: Date.now() > task.deadline ? 'error.main' : 'text.secondary'
                      }}>
                        <TimerIcon fontSize="small" />
                        <Typography variant="caption">
                          {getRemainingTime(task.deadline)}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Add New Task
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Task Description"
            fullWidth
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            multiline
            rows={3}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Deadline (Days)</InputLabel>
            <Select
              value={selectedDays}
              label="Deadline (Days)"
              onChange={(e) => setSelectedDays(Number(e.target.value))}
            >
              {[...Array(30)].map((_, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  {index + 1} {index + 1 === 1 ? 'Day' : 'Days'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setIsDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddTask} 
            variant="contained"
          >
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;