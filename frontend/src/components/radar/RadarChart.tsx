// frontend/src/components/radar/RadarChart.tsx
import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface Goal {
  _id: string;
  name: string;
  currentScore: number;
  maxScore: number;
  color: string;
  category: string;
}

interface RadarChartProps {
  goals: Goal[];
  className?: string;
}

const GoalRadarChart: React.FC<RadarChartProps> = ({ goals, className = "" }) => {
  // Transform goals data for radar chart
  const chartData = goals.map(goal => ({
    goal: goal.name,
    score: goal.currentScore,
    maxScore: goal.maxScore,
    fullMark: 100
  }));

  const customTick = (props: any) => {
    const { payload, x, y, textAnchor } = props;
    const goal = goals.find(g => g.name === payload.value);
    
    return (
      <g className="recharts-layer recharts-polar-angle-axis-tick">
        <text
          x={x}
          y={y}
          className="text-sm font-medium"
          textAnchor={textAnchor}
          fill={goal?.color || '#6B7280'}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Goal Progress</h3>
        <p className="text-gray-600 text-sm">
          Your current progress across all goals
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            <PolarGrid 
              gridType="polygon" 
              className="stroke-gray-200" 
            />
            <PolarAngleAxis 
              dataKey="goal" 
              tick={customTick}
              className="text-sm"
            />
            <PolarRadiusAxis
              angle={0}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickCount={6}
            />
            <Radar
              name="Current Progress"
              dataKey="score"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Goal Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {goals.map(goal => (
          <div 
            key={goal._id} 
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: goal.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">
                {goal.name}
              </p>
              <p className="text-xs text-gray-600">
                {goal.currentScore}/100
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalRadarChart;