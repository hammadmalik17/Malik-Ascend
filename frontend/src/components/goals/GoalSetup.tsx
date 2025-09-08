// frontend/src/components/goals/GoalSetup.tsx
import React, { useState } from 'react';
import { Plus, X, Target } from 'lucide-react';

interface Goal {
  name: string;
  category: string;
  description: string;
  color: string;
}

interface GoalSetupProps {
  onGoalsCreated: (goals: Goal[]) => void;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const CATEGORIES = [
  'Academic', 'Professional', 'Personal', 'Health', 'Skill', 'Other'
];

const GoalSetup: React.FC<GoalSetupProps> = ({ onGoalsCreated, isLoading = false }) => {
  const [goals, setGoals] = useState<Goal[]>([
    { name: '', category: 'Skill', description: '', color: PRESET_COLORS[0] }
  ]);

  const addGoal = () => {
    if (goals.length < 8) {
      setGoals([...goals, {
        name: '',
        category: 'Skill',
        description: '',
        color: PRESET_COLORS[goals.length % PRESET_COLORS.length]
      }]);
    }
  };

  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const updateGoal = (index: number, field: keyof Goal, value: string) => {
    const updatedGoals = goals.map((goal, i) => 
      i === index ? { ...goal, [field]: value } : goal
    );
    setGoals(updatedGoals);
  };

  const handleSubmit = () => {
    const validGoals = goals.filter(goal => goal.name.trim());
    if (validGoals.length > 0) {
      onGoalsCreated(validGoals);
    }
  };

  const isValid = goals.some(goal => goal.name.trim());

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Set Your Goals
        </h2>
        <p className="text-gray-600">
          Define the main areas you want to focus on. These will appear on your progress radar.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {goals.map((goal, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              {/* Color Picker */}
              <div className="flex flex-col items-center space-y-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: goal.color }}
                />
                <select
                  value={goal.color}
                  onChange={(e) => updateGoal(index, 'color', e.target.value)}
                  className="w-16 text-xs border border-gray-300 rounded p-1"
                >
                  {PRESET_COLORS.map(color => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              {/* Goal Details */}
              <div className="flex-1 space-y-3">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Goal name (e.g., Machine Learning, DSA)"
                    value={goal.name}
                    onChange={(e) => updateGoal(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={50}
                  />
                  <select
                    value={goal.category}
                    onChange={(e) => updateGoal(index, 'category', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Brief description (optional)"
                  value={goal.description}
                  onChange={(e) => updateGoal(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={200}
                />
              </div>

              {/* Remove Button */}
              {goals.length > 1 && (
                <button
                  onClick={() => removeGoal(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Button */}
      {goals.length < 8 && (
        <button
          onClick={addGoal}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Another Goal</span>
        </button>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Creating Goals...' : 'Create My Goals'}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        You can always modify these later in your dashboard.
      </p>
    </div>
  );
};

export default GoalSetup;
