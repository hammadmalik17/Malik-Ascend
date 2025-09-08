// frontend/src/components/tasks/TaskList.tsx
import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Tag, ChevronDown, ChevronRight } from 'lucide-react';

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
}

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onSubtaskComplete: (taskId: string, subtaskId: string) => void;
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskComplete,
  onSubtaskComplete,
  className = ""
}) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (expandedTasks.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCompletionPercentage = (task: Task) => {
    if (task.subtasks.length === 0) {
      return task.isCompleted ? 100 : 0;
    }
    const completed = task.subtasks.filter(st => st.isCompleted).length;
    return Math.round((completed / task.subtasks.length) * 100);
  };

  if (tasks.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No tasks yet</h3>
        <p className="text-gray-600">
          Use the AI assistant to generate some smart tasks to get started!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Today's Tasks</h3>
        <div className="text-sm text-gray-600">
          {tasks.filter(t => t.isCompleted).length} of {tasks.length} completed
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map(task => {
          const isExpanded = expandedTasks.has(task._id);
          const completionPercentage = getCompletionPercentage(task);

          return (
            <div
              key={task._id}
              className={`border rounded-lg p-4 transition-all ${
                task.isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200'
              }`}
            >
              {/* Task Header */}
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => onTaskComplete(task._id)}
                  className="mt-1 flex-shrink-0"
                >
                  {task.isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        task.isCompleted ? 'text-green-800 line-through' : 'text-gray-800'
                      }`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Task Metadata */}
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getPriorityColor(task.priority)
                      }`}>
                        {task.priority}
                      </span>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.estimatedDuration}m
                      </div>

                      {task.subtasks.length > 0 && (
                        <button
                          onClick={() => toggleTaskExpansion(task._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {task.subtasks.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tags and Goal */}
                  <div className="flex items-center space-x-4 mt-3">
                    {task.goalName && (
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: task.goalColor }}
                        />
                        <span className="text-xs text-gray-600">{task.goalName}</span>
                      </div>
                    )}

                    {task.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {task.tags.join(', ')}
                        </span>
                      </div>
                    )}

                    {task.aiGenerated && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        AI Generated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Subtasks */}
              {isExpanded && task.subtasks.length > 0 && (
                <div className="mt-4 ml-8 space-y-2">
                  {task.subtasks.map(subtask => (
                    <div key={subtask._id} className="flex items-center space-x-3">
                      <button
                        onClick={() => onSubtaskComplete(task._id, subtask._id)}
                        className="flex-shrink-0"
                      >
                        {subtask.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                        )}
                      </button>
                      <span className={`text-sm ${
                        subtask.isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
                      }`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskList;