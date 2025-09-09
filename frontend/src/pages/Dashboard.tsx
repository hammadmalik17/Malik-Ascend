// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, TrendingUp, Target, Brain } from 'lucide-react';
import GoalRadarChart from '../components/radar/RadarChart';
import ChatInterface from '../components/chat/ChatInterface';
import TaskList from '../components/tasks/TaskList';
import { useAuthStore } from '../stores/authStore';
import { useGoalStore } from '../stores/goalStore';
import { useTaskStore } from '../stores/taskStore';

interface DashboardStats {
  totalTasks: number;
  completedToday: number;
  activeGoals: number;
  currentStreak: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { goals, fetchGoals, fetchRadarData } = useGoalStore();
  const { tasks, fetchTasks, completeTask, completeSubtask, createTask } = useTaskStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedToday: 0,
    activeGoals: 0,
    currentStreak: 0
  });
  const [showReflectionModal, setShowReflectionModal] = useState(false);

  useEffect(() => {
    fetchGoals();
    fetchTasks();
    fetchRadarData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [tasks, goals]);

  const calculateStats = () => {
    const today = new Date().toDateString();
    const completedToday = tasks.filter(t => 
      t.isCompleted && 
      t.completedAt &&
      new Date(t.completedAt).toDateString() === today
    ).length;

    const maxStreak = Math.max(...goals.map(g => g.currentStreak), 0);

    setStats({
      totalTasks: tasks.length,
      completedToday,
      activeGoals: goals.length,
      currentStreak: maxStreak
    });
  };

  const handleTaskGenerated = async (taskData: any) => {
    await createTask(taskData);
    await fetchTasks(); // Refresh tasks
  };

  const handleReflectionCompleted = async (reflection: any) => {
    setShowReflectionModal(false);
    await fetchRadarData(); // Refresh goals data
  };

  const isEvening = () => {
    const hour = new Date().getHours();
    return hour >= 18; // After 6 PM
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">LifeQuest</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {user?.firstName}!
              </span>
              {isEvening() && (
                <button
                  onClick={() => setShowReflectionModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Daily Reflection
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedToday}/{stats.totalTasks}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeGoals}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Assists</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => t.aiGenerated).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Radar Chart */}
          <div className="lg:col-span-2">
            <GoalRadarChart goals={goals} className="mb-8" />
            <TaskList
              tasks={tasks.filter(t => !t.isCompleted)}
              onTaskComplete={completeTask}
              onSubtaskComplete={completeSubtask}
            />
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-1">
            <ChatInterface
              onTaskGenerated={handleTaskGenerated}
              onReflectionCompleted={handleReflectionCompleted}
            />
          </div>
        </div>
      </div>

      {/* Daily Reflection Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Reflection</h3>
            <p className="text-gray-600 mb-4">
              How was your day? What did you accomplish?
            </p>
            {/* Reflection form would go here */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReflectionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowReflectionModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;