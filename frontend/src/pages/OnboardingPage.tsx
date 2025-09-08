// frontend/src/pages/OnboardingPage.tsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import GoalSetup from '../components/goals/GoalSetup';
import { useGoalStore } from '../stores/goalStore';
import { useAuthStore } from '../stores/authStore';

const OnboardingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { createGoals, goals } = useGoalStore();
  const [isCreating, setIsCreating] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (goals.length > 0) {
    return <Navigate to="/dashboard" />;
  }

  const handleGoalsCreated = async (goalsData: any[]) => {
    setIsCreating(true);
    try {
      await createGoals(goalsData);
      // Navigation will happen automatically due to goals.length > 0
    } catch (error) {
      console.error('Failed to create goals:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to LifeQuest!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's start by setting up your personal goals. These will be the foundation 
            of your gamified life management journey.
          </p>
        </div>

        <GoalSetup 
          onGoalsCreated={handleGoalsCreated} 
          isLoading={isCreating}
        />
      </div>
    </div>
  );
};

export default OnboardingPage;
