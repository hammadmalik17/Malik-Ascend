// frontend/src/stores/taskStore.ts
import { create } from 'zustand';

interface Subtask {
  _id: string;
  title: string;
  isCompleted: boolean;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  isCompleted: boolean;
  priority: 'Low' | 'Medium' | 'High';
  estimatedDuration: number;
  goalId: string;
  goalName?: string;
  goalColor?: string;
  tags: string[];
  aiGenerated: boolean;
  createdAt: string;
  completedAt?: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  completeSubtask: (taskId: string, subtaskId: string) => Promise<void>;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        isLoading: false 
      });
    }
  },

  createTask: async (taskData: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await response.json();
      set((state) => ({ 
        tasks: [newTask, ...state.tasks], 
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create task',
        isLoading: false 
      });
      throw error;
    }
  },

  completeTask: async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      const updatedTask = await response.json();
      set((state) => ({
        tasks: state.tasks.map(t => t._id === taskId ? updatedTask : t)
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to complete task'
      });
    }
  },

  completeSubtask: async (taskId: string, subtaskId: string) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}/subtasks/${subtaskId}/complete`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to complete subtask');
      }

      const updatedTask = await response.json();
      set((state) => ({
        tasks: state.tasks.map(t => t._id === taskId ? updatedTask : t)
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to complete subtask'
      });
    }
  },
}));