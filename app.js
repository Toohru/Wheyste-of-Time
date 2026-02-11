const { useState, useEffect } = React;
const { Plus, Settings, X, Trash2, ChevronLeft, ChevronRight, Calendar } = lucide;

function CalorieTracker() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allEntries, setAllEntries] = useState({});
  const [goals, setGoals] = useState({ calories: 2000, protein: 150 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', energy: '', energyUnit: 'cal', protein: '' });
  const [tempGoals, setTempGoals] = useState({ calories: 2000, protein: 150 });

  const dateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateKey(date) === dateKey(today)) return 'Today';
    if (dateKey(date) === dateKey(yesterday)) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAllEntries = localStorage.getItem('allCalorieEntries');
    const savedGoals = localStorage.getItem('calorieGoals');

    if (savedAllEntries) {
      setAllEntries(JSON.parse(savedAllEntries));
    }

    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals);
      setGoals(parsedGoals);
      setTempGoals(parsedGoals);
    }
  }, []);

  // Save all entries to localStorage
  const saveAllEntries = (entries) => {
    localStorage.setItem('allCalorieEntries', JSON.stringify(entries));
  };

  // Save goals to localStorage
  const saveGoals = (newGoals) => {
    localStorage.setItem('calorieGoals', JSON.stringify(newGoals));
  };

  // Get entries for current date
  const currentEntries = allEntries[dateKey(currentDate)] || [];

  // Calculate totals for current date
  const totals = currentEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
    }),
    { calories: 0, protein: 0 }
  );

  // Get last 7 days of data for weekly view
  const getWeeklyData = () => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = dateKey(date);
      const dayEntries = allEntries[key] || [];
      const dayTotals = dayEntries.reduce(
        (acc, entry) => ({
          calories: acc.calories + entry.calories,
          protein: acc.protein + entry.protein,
        }),
        { calories: 0, protein: 0 }
      );
      weekData.push({
        date,
        key,
        ...dayTotals,
      });
    }
    return weekData;
  };

  const weeklyData = getWeeklyData();
  const weeklyTotals = weeklyData.reduce(
    (acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
    }),
    { calories: 0, protein: 0 }
  );

  const handleAddEntry = () => {
    if (!newEntry.name || !newEntry.energy || !newEntry.protein) return;

    let calories = parseFloat(newEntry.energy);
    if (newEntry.energyUnit === 'kj') {
      calories = calories / 4.184;
    }

    const entry = {
      id: Date.now(),
      name: newEntry.name,
      calories: Math.round(calories),
      protein: parseFloat(newEntry.protein),
      timestamp: new Date().toISOString(),
    };

    const key = dateKey(currentDate);
    const updatedAllEntries = {
      ...allEntries,
      [key]: [...(allEntries[key] || []), entry],
    };
    
    setAllEntries(updatedAllEntries);
    saveAllEntries(updatedAllEntries);
    setNewEntry({ name: '', energy: '', energyUnit: 'cal', protein: '' });
    setShowAddModal(false);
  };

  const handleDeleteEntry = (id) => {
    const key = dateKey(currentDate);
    const updatedEntries = currentEntries.filter(entry => entry.id !== id);
    const updatedAllEntries = {
      ...allEntries,
      [key]: updatedEntries,
    };
    setAllEntries(updatedAllEntries);
    saveAllEntries(updatedAllEntries);
  };

  const handleSaveSettings = () => {
    const newGoals = {
      calories: parseInt(tempGoals.calories) || 2000,
      protein: parseInt(tempGoals.protein) || 150,
    };
    setGoals(newGoals);
    saveGoals(newGoals);
    setShowSettings(false);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const today = new Date();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    if (dateKey(newDate) <= dateKey(today)) {
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = dateKey(currentDate) === dateKey(new Date());

  const CircularProgress = ({ current, goal, label, color, gradientId, size = 160 }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    const isOver = current > goal;
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: color.start, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: color.end, stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#374151"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={isOver ? '#EF4444' : `url(#${gradientId})`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${isOver ? 'text-red-400' : 'text-gray-100'} transition-colors duration-300`}>
              {Math.round(current)}
            </span>
            <span className="text-sm text-gray-400">/ {goal}</span>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-300 tracking-wide">{label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header with Date Navigation */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <button
            onClick={goToPreviousDay}
            className="p-3 hover:bg-gray-700/50 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={24} className="text-gray-300" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {formatDate(currentDate)}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <button
            onClick={goToNextDay}
            className={`p-3 rounded-full transition-all duration-200 ${
              isToday 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:bg-gray-700/50 hover:scale-110 active:scale-95'
            }`}
            disabled={isToday}
          >
            <ChevronRight size={24} className="text-gray-300" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-6">
          {!isToday && (
            <button
              onClick={goToToday}
              className="flex-1 bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm py-2.5 px-4 rounded-xl font-semibold text-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm border border-gray-700/50"
            >
              Jump to Today
            </button>
          )}
          <button
            onClick={() => setShowWeekly(true)}
            className="flex-1 bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm py-2.5 px-4 rounded-xl font-semibold text-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm border border-gray-700/50"
          >
            <Calendar size={18} />
            Weekly
          </button>
          <button
            onClick={() => {
              setTempGoals(goals);
              setShowSettings(true);
            }}
            className="p-2.5 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-90 shadow-sm border border-gray-700/50"
          >
            <Settings size={24} className="text-gray-300" />
          </button>
        </div>

        {/* Circular Progress Section */}
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-6 transform transition-all duration-300 hover:shadow-2xl border border-gray-700/50">
          <div className="flex justify-around items-center gap-8">
            <CircularProgress
              current={totals.calories}
              goal={goals.calories}
              label="CALORIES"
              color={{ start: '#60A5FA', end: '#A78BFA' }}
              gradientId="caloriesGradient"
            />
            <CircularProgress
              current={totals.protein}
              goal={goals.protein}
              label="PROTEIN (G)"
              color={{ start: '#34D399', end: '#10B981' }}
              gradientId="proteinGradient"
            />
          </div>
        </div>

        {/* Entries List */}
        {currentEntries.length > 0 && (
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-3xl shadow-xl p-6 mb-24 border border-gray-700/50">
            <h2 className="text-lg font-bold text-gray-200 mb-4 tracking-wide">MEALS</h2>
            <div className="space-y-3">
              {currentEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-102 hover:shadow-md border border-gray-600/30"
                  style={{
                    animation: `slideIn 0.4s ease-out ${index * 0.1}s backwards`
                  }}
                >
                  <div>
                    <p className="font-bold text-gray-100">{entry.name}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        {entry.calories} cal
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        {entry.protein}g protein
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-2 hover:bg-red-900/30 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentEntries.length === 0 && (
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-3xl shadow-xl p-12 mb-24 text-center border border-gray-700/50">
            <div className="opacity-20 mb-4">
              <div className="text-8xl">🍽️</div>
            </div>
            <p className="text-gray-400 text-lg font-medium">No meals logged {isToday ? 'yet' : 'for this day'}</p>
          </div>
        )}

        {/* Add Button with pulse animation */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          <Plus size={36} strokeWidth={3} />
        </button>

        {/* Add Entry Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div 
              className="bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-700"
              style={{ animation: 'scaleIn 0.3s ease-out' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Add Food
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-all duration-200 hover:rotate-90"
                >
                  <X size={24} className="text-gray-300" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Food name"
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  className="w-full p-4 bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg"
                />

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Energy amount"
                    value={newEntry.energy}
                    onChange={(e) => setNewEntry({ ...newEntry, energy: e.target.value })}
                    className="flex-1 p-4 bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg"
                  />
                  <select
                    value={newEntry.energyUnit}
                    onChange={(e) => setNewEntry({ ...newEntry, energyUnit: e.target.value })}
                    className="p-4 bg-gray-700 border-2 border-gray-600 text-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg"
                  >
                    <option value="cal">cal</option>
                    <option value="kj">kJ</option>
                  </select>
                </div>

                <input
                  type="number"
                  placeholder="Protein (g)"
                  value={newEntry.protein}
                  onChange={(e) => setNewEntry({ ...newEntry, protein: e.target.value })}
                  className="w-full p-4 bg-gray-700 border-2 border-gray-600 text-gray-100 placeholder-gray-400 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg"
                />

                <button
                  onClick={handleAddEntry}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div 
              className="bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-700"
              style={{ animation: 'scaleIn 0.3s ease-out' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Daily Goals
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-all duration-200 hover:rotate-90"
                >
                  <X size={24} className="text-gray-300" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2 tracking-wide">
                    CALORIE GOAL
                  </label>
                  <input
                    type="number"
                    value={tempGoals.calories}
                    onChange={(e) => setTempGoals({ ...tempGoals, calories: e.target.value })}
                    className="w-full p-4 bg-gray-700 border-2 border-gray-600 text-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2 tracking-wide">
                    PROTEIN GOAL (G)
                  </label>
                  <input
                    type="number"
                    value={tempGoals.protein}
                    onChange={(e) => setTempGoals({ ...tempGoals, protein: e.target.value })}
                    className="w-full p-4 bg-gray-700 border-2 border-gray-600 text-gray-100 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Save Goals
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly View Modal */}
        {showWeekly && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <div 
              className="bg-gray-800 rounded-3xl p-6 w-full max-w-md my-8 shadow-2xl border border-gray-700"
              style={{ animation: 'scaleIn 0.3s ease-out' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Last 7 Days
                </h2>
                <button
                  onClick={() => setShowWeekly(false)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-all duration-200 hover:rotate-90"
                >
                  <X size={24} className="text-gray-300" />
                </button>
              </div>

              {/* Weekly Totals */}
              <div className="bg-gray-700/40 rounded-2xl p-5 mb-6 shadow-md border border-gray-600/50">
                <h3 className="font-bold text-gray-200 mb-4 tracking-wide">WEEKLY TOTALS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-600/30">
                    <p className="text-xs text-gray-400 font-semibold mb-1">CALORIES</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {Math.round(weeklyTotals.calories)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Avg: {Math.round(weeklyTotals.calories / 7)}/day</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-600/30">
                    <p className="text-xs text-gray-400 font-semibold mb-1">PROTEIN (G)</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {Math.round(weeklyTotals.protein)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Avg: {Math.round(weeklyTotals.protein / 7)}/day</p>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown */}
              <div className="space-y-3">
                {weeklyData.map((day, index) => (
                  <div
                    key={day.key}
                    className="border-2 border-gray-700/50 rounded-2xl p-4 hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-102 bg-gray-700/20"
                    onClick={() => {
                      setCurrentDate(day.date);
                      setShowWeekly(false);
                    }}
                    style={{
                      animation: `slideIn 0.4s ease-out ${index * 0.1}s backwards`
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-200">
                          {formatDate(day.date)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">
                          <span className="font-bold text-blue-400">{Math.round(day.calories)}</span> cal
                        </p>
                        <p className="text-sm text-gray-300">
                          <span className="font-bold text-green-400">{Math.round(day.protein)}</span>g protein
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-600 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-700 ${
                            day.calories > goals.calories 
                              ? 'bg-gradient-to-r from-red-400 to-red-600' 
                              : 'bg-gradient-to-r from-blue-400 to-purple-500'
                          }`}
                          style={{ width: `${Math.min((day.calories / goals.calories) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex-1 bg-gray-600 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-700 ${
                            day.protein > goals.protein 
                              ? 'bg-gradient-to-r from-red-400 to-red-600' 
                              : 'bg-gradient-to-r from-green-400 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min((day.protein / goals.protein) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.7);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(96, 165, 250, 0);
          }
        }
      `}</style>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CalorieTracker />);
