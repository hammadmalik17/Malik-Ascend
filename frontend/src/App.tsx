// frontend/src/App.tsx

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Test Card */}
        <div className="card max-w-md mx-auto text-center">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            LifeQuest
          </h1>
          <p className="text-gray-600 mb-6">
            Frontend is working! ✅
          </p>
          <button className="btn-primary mr-4">
            Primary Button
          </button>
          <button className="btn-secondary">
            Secondary Button
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              🎯
            </div>
            <h3 className="font-bold text-lg mb-2">Goal Tracking</h3>
            <p className="text-gray-600 text-sm">
              Visual radar chart progress tracking
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              🤖
            </div>
            <h3 className="font-bold text-lg mb-2">AI Assistant</h3>
            <p className="text-gray-600 text-sm">
              Smart task generation with Gemini
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              🎮
            </div>
            <h3 className="font-bold text-lg mb-2">Gamification</h3>
            <p className="text-gray-600 text-sm">
              Streaks, levels, and achievements
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App