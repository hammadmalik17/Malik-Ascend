// backend/src/services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateTasks(userInput, goals, userContext = {}) {
    const prompt = `
You are a smart productivity assistant. A user wants to work on: "${userInput}"

Current user goals: ${goals.map(g => `${g.name} (${g.category})`).join(', ')}

User context:
- Previous tasks completed: ${userContext.recentTasks || 'None'}
- Skill level: ${userContext.skillLevel || 'Intermediate'}

Generate a smart task breakdown. Instead of generic tasks, create specific, actionable subtasks.

Examples:
- If user says "study CN", create subtasks like "Read Chapter on Error Detection", "Practice CRC problems", "Review OSI model"
- If user says "work on ML", create "Implement gradient descent algorithm", "Study bias-variance tradeoff", "Complete linear regression exercises"

Respond with a JSON object:
{
  "mainTask": "Clear, specific main task title",
  "description": "Brief description of what this accomplishes",
  "goalId": "most relevant goal from the list",
  "estimatedDuration": 45,
  "priority": "High/Medium/Low",
  "difficulty": "Beginner/Intermediate/Advanced",
  "subtasks": [
    "Specific subtask 1",
    "Specific subtask 2", 
    "Specific subtask 3"
  ],
  "tags": ["relevant", "tags"]
}

Make it actionable and specific to their current skill level.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Could not parse AI response');
    } catch (error) {
      console.error('AI Task Generation Error:', error);
      return this.getFallbackTask(userInput, goals);
    }
  }

  async processReflection(reflectionText, completedTasks, goals) {
    const prompt = `
Analyze this daily reflection from a user:

Reflection: "${reflectionText}"

Completed tasks today: ${completedTasks.map(t => t.title).join(', ') || 'None'}

Current goals and progress: ${goals.map(g => `${g.name}: ${g.currentScore}/100`).join(', ')}

Provide insights and recommendations in JSON format:
{
  "summary": "2-sentence summary of their day",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["actionable recommendation 1", "recommendation 2"],
  "goalUpdates": [
    {
      "goalName": "ML",
      "progressToAdd": 8,
      "reasoning": "Completed advanced ML tasks"
    }
  ],
  "mood": "Good/Okay/Poor based on reflection tone",
  "productivity": 7
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Could not parse reflection analysis');
    } catch (error) {
      console.error('AI Reflection Analysis Error:', error);
      return {
        summary: "Reflection processed successfully.",
        insights: ["Keep up the good work!"],
        recommendations: ["Continue focusing on your goals."],
        goalUpdates: [],
        mood: "Okay",
        productivity: 5
      };
    }
  }

  getFallbackTask(userInput, goals) {
    // Simple fallback when AI fails
    const relevantGoal = goals.find(g => 
      userInput.toLowerCase().includes(g.name.toLowerCase())
    ) || goals[0];

    return {
      mainTask: `Work on ${userInput}`,
      description: `Focus on ${userInput} to make progress`,
      goalId: relevantGoal?._id,
      estimatedDuration: 30,
      priority: "Medium",
      difficulty: "Intermediate",
      subtasks: [
        `Research ${userInput}`,
        `Practice ${userInput}`,
        `Review progress on ${userInput}`
      ],
      tags: [userInput.split(' ')[0]]
    };
  }

  async chat(message, context = {}) {
    const prompt = `
You are a helpful productivity coach. The user is asking: "${message}"

Context:
- User goals: ${context.goals?.map(g => g.name).join(', ') || 'None set'}
- Recent activity: ${context.recentActivity || 'None'}

Respond helpfully and encouragingly in a conversational tone. Keep it concise but supportive.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Chat Error:', error);
      return "I'm here to help! Could you try asking that again?";
    }
  }
}

module.exports = new AIService();