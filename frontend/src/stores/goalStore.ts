// frontend/src/stores/goalStore.ts
import { create } from 'zustand';

interface Goal {
  _id: string;
  name: string;
  category: string;
  description: string;
  currentScore: number;
  maxScore: number;
  color: string;
  currentStreak: number;
  bestStreak: number;
  totalTasksCompleted: number;
  isActive: boolean;
}

interface GoalState {
  goals: Goal[];
  radarData: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<void>;
  fetchRadarData: () => Promise<void>;
  createGoals: (goals: Partial<Goal>[]) => Promise<void>;
  updateGoalProgress: (goalId: string, points: number) => Promise<void>;
}

// Fixed: Use VITE_ prefix for Vite environment variables
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  radarData: [],
  isLoading: false,
  error: null,

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/goals`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }

      const goals = await response.json();
      set({ goals, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch goals',
        isLoading: false 
      });
    }
  },

  fetchRadarData: async () => {
    try {
      const response = await fetch(`${API_BASE}/goals/radar-data`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch radar data');
      }

      const radarData = await response.json();
      set({ radarData });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch radar data'
      });
    }
  },

  createGoals: async (goalsData: Partial<Goal>[]) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ goals: goalsData }),
      });

      if (!response.ok) {
        throw new Error('Failed to create goals');
      }

      const goals = await response.json();
      set({ goals, radarData: goals, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create goals',
        isLoading: false 
      });
      throw error;
    }
  },

  updateGoalProgress: async (goalId: string, points: number) => {
    try {
      const response = await fetch(`${API_BASE}/goals/${goalId}/progress`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ points }),
      });

      if (!response.ok) {
        throw new Error('Failed to update goal progress');
      }

      const updatedGoal = await response.json();
      
      // Update local state
      set((state) => ({
        goals: state.goals.map(g => g._id === goalId ? updatedGoal : g),
        radarData: state.radarData.map(g => g._id === goalId ? updatedGoal : g)
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update goal progress'
      });
    }
  },
}));