import React, { useState, useEffect } from 'react';
import { Plus, Settings, X, Trash2, ChevronLeft, ChevronRight, Calendar, Sun, Moon, Search, Edit2 } from 'lucide-react';

export default function CalorieTracker() {
  // Always initialize to today's date
  const getTodayDate = () => {
    return new Date();
  };
  
  const [currentDate, setCurrentDate] = useState(getTodayDate());
  const [allEntries, setAllEntries] = useState({});
  const [goals, setGoals] = useState({ calories: 2000, protein: 150 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', energy: '', energyUnit: 'cal', protein: '' });
  const [tempGoals, setTempGoals] = useState({ calories: 2000, protein: 150 });
  const [darkMode, setDarkMode] = useState(true);
  const [tempDarkMode, setTempDarkMode] = useState(true);
  const [displayUnit, setDisplayUnit] = useState('cal'); // 'cal' or 'kj'
  const [tempDisplayUnit, setTempDisplayUnit] = useState('cal');
  const [previousMeals, setPreviousMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    const savedDarkMode = localStorage.getItem('darkMode');
    const savedDisplayUnit = localStorage.getItem('displayUnit');
    const savedPreviousMeals = localStorage.getItem('previousMeals');

    if (savedAllEntries) {
      setAllEntries(JSON.parse(savedAllEntries));
    }

    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals);
      setGoals(parsedGoals);
      setTempGoals(parsedGoals);
    }

    if (savedDarkMode !== null) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      setTempDarkMode(isDark);
    }

    if (savedDisplayUnit) {
      setDisplayUnit(savedDisplayUnit);
      setTempDisplayUnit(savedDisplayUnit);
    }

    if (savedPreviousMeals) {
      setPreviousMeals(JSON.parse(savedPreviousMeals));
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

  // Get last 30 days of data for monthly view
  const getMonthlyData = () => {
    const monthData = [];
    for (let i = 29; i >= 0; i--) {
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
      monthData.push({
        date,
        key,
        ...dayTotals,
      });
    }
    return monthData;
  };

  const weeklyData = getWeeklyData();
  const weeklyTotals = weeklyData.reduce(
    (acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
    }),
    { calories: 0, protein: 0 }
  );

  const monthlyData = getMonthlyData();
  const monthlyTotals = monthlyData.reduce(
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

    // Save to previous meals (avoid duplicates by name)
    const mealTemplate = {
      name: newEntry.name,
      calories: Math.round(calories),
      protein: parseFloat(newEntry.protein),
    };
    
    const existingIndex = previousMeals.findIndex(m => m.name.toLowerCase() === mealTemplate.name.toLowerCase());
    let updatedPreviousMeals;
    
    if (existingIndex >= 0) {
      // Update existing meal
      updatedPreviousMeals = [...previousMeals];
      updatedPreviousMeals[existingIndex] = mealTemplate;
    } else {
      // Add new meal
      updatedPreviousMeals = [...previousMeals, mealTemplate];
    }
    
    setPreviousMeals(updatedPreviousMeals);
    localStorage.setItem('previousMeals', JSON.stringify(updatedPreviousMeals));

    setNewEntry({ name: '', energy: '', energyUnit: 'cal', protein: '' });
    setSearchTerm('');
    setShowAddModal(false);
  };

  const handleDeleteEntry = (entry) => {
    setDeleteConfirm(entry);
  };

  const confirmDeleteEntry = () => {
    if (!deleteConfirm) return;
    
    const key = dateKey(currentDate);
    const updatedEntries = currentEntries.filter(entry => entry.id !== deleteConfirm.id);
    const updatedAllEntries = {
      ...allEntries,
      [key]: updatedEntries,
    };
    setAllEntries(updatedAllEntries);
    saveAllEntries(updatedAllEntries);
    setDeleteConfirm(null);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      name: entry.name,
      energy: entry.calories.toString(),
      energyUnit: 'cal',
      protein: entry.protein.toString(),
    });
    setShowAddModal(true);
  };

  const handleUpdateEntry = () => {
    if (!newEntry.name || !newEntry.energy || !newEntry.protein || !editingEntry) return;

    let calories = parseFloat(newEntry.energy);
    if (newEntry.energyUnit === 'kj') {
      calories = calories / 4.184;
    }

    const updatedEntry = {
      ...editingEntry,
      name: newEntry.name,
      calories: Math.round(calories),
      protein: parseFloat(newEntry.protein),
    };

    const key = dateKey(currentDate);
    const updatedEntries = currentEntries.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    );
    const updatedAllEntries = {
      ...allEntries,
      [key]: updatedEntries,
    };
    
    setAllEntries(updatedAllEntries);
    saveAllEntries(updatedAllEntries);

    // Update previous meals
    const mealTemplate = {
      name: newEntry.name,
      calories: Math.round(calories),
      protein: parseFloat(newEntry.protein),
    };
    
    const existingIndex = previousMeals.findIndex(m => m.name.toLowerCase() === mealTemplate.name.toLowerCase());
    let updatedPreviousMeals;
    
    if (existingIndex >= 0) {
      updatedPreviousMeals = [...previousMeals];
      updatedPreviousMeals[existingIndex] = mealTemplate;
    } else {
      updatedPreviousMeals = [...previousMeals, mealTemplate];
    }
    
    setPreviousMeals(updatedPreviousMeals);
    localStorage.setItem('previousMeals', JSON.stringify(updatedPreviousMeals));

    setNewEntry({ name: '', energy: '', energyUnit: 'cal', protein: '' });
    setSearchTerm('');
    setEditingEntry(null);
    setShowAddModal(false);
  };

  const handleSaveSettings = () => {
    const newGoals = {
      calories: parseInt(tempGoals.calories) || 2000,
      protein: parseInt(tempGoals.protein) || 150,
    };
    setGoals(newGoals);
    saveGoals(newGoals);
    
    setDarkMode(tempDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(tempDarkMode));
    
    setDisplayUnit(tempDisplayUnit);
    localStorage.setItem('displayUnit', tempDisplayUnit);
    
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

  // Unit conversion helpers
  const convertEnergy = (calories) => {
    if (displayUnit === 'kj') {
      return Math.round(calories * 4.184);
    }
    return Math.round(calories);
  };

  const getEnergyLabel = () => displayUnit === 'kj' ? 'kJ' : 'kcal';

  // Filter previous meals based on search
  const filteredPreviousMeals = previousMeals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadPreviousMeal = (meal) => {
    setNewEntry({
      name: meal.name,
      energy: meal.calories.toString(),
      energyUnit: 'cal',
      protein: meal.protein.toString(),
    });
    setSearchTerm('');
  };

  const CombinedCircularProgress = ({ caloriesCurrent, caloriesGoal, proteinCurrent, proteinGoal }) => {
    const size = 220;
    const strokeWidth = 16;
    const outerRadius = (size - strokeWidth) / 2;
    const innerRadius = outerRadius - strokeWidth - 8;
    
    const caloriesPercentage = Math.min((caloriesCurrent / caloriesGoal) * 100, 100);
    const proteinPercentage = Math.min((proteinCurrent / proteinGoal) * 100, 100);
    
    const outerCircumference = 2 * Math.PI * outerRadius;
    const innerCircumference = 2 * Math.PI * innerRadius;
    
    const caloriesOffset = outerCircumference - (caloriesPercentage / 100) * outerCircumference;
    const proteinOffset = innerCircumference - (proteinPercentage / 100) * innerCircumference;
    
    // Traffic light system for calories
    const getCaloriesColor = () => {
      if (caloriesCurrent > caloriesGoal) return '#EF4444'; // Red - over goal
      if (caloriesPercentage >= 80) return 'url(#caloriesGreenGradient)'; // Green - good progress
      if (caloriesPercentage >= 50) return 'url(#caloriesYellowGradient)'; // Yellow - moderate
      return 'url(#caloriesRedGradient)'; // Red - significantly under
    };
    
    // Traffic light system for protein (being over is good)
    const getProteinColor = () => {
      if (proteinPercentage >= 80) return 'url(#proteinGreenGradient)'; // Green - good/over is good
      if (proteinPercentage >= 50) return 'url(#proteinYellowGradient)'; // Yellow - moderate
      return 'url(#proteinRedGradient)'; // Red - significantly under
    };
    
    const isCaloriesOver = caloriesCurrent > caloriesGoal;
    const caloriesTextColor = isCaloriesOver ? 'text-red-400' : 
                              caloriesPercentage >= 80 ? 'text-green-400' : 
                              caloriesPercentage >= 50 ? 'text-yellow-400' : 'text-red-400';
    
    const proteinTextColor = proteinPercentage >= 80 ? 'text-green-400' : 
                            proteinPercentage >= 50 ? 'text-yellow-400' : 'text-red-400';

    return (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <defs>
              {/* Calories gradients */}
              <linearGradient id="caloriesGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#34D399', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="caloriesYellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="caloriesRedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#F87171', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
              </linearGradient>
              
              {/* Protein gradients */}
              <linearGradient id="proteinGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#34D399', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="proteinYellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="proteinRedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#F87171', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            {/* Outer ring background (calories) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={outerRadius}
              fill="none"
              stroke={darkMode ? '#374151' : '#E5E7EB'}
              strokeWidth={strokeWidth}
            />
            
            {/* Outer ring progress (calories) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={outerRadius}
              fill="none"
              stroke={getCaloriesColor()}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={outerCircumference}
              strokeDashoffset={caloriesOffset}
              className="transition-all duration-700 ease-out"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
            />
            
            {/* Inner ring background (protein) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              fill="none"
              stroke={darkMode ? '#374151' : '#E5E7EB'}
              strokeWidth={strokeWidth}
            />
            
            {/* Inner ring progress (protein) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              fill="none"
              stroke={getProteinColor()}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={innerCircumference}
              strokeDashoffset={proteinOffset}
              className="transition-all duration-700 ease-out"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <div className="flex items-center gap-2 justify-center">
                <span className={`w-3 h-3 rounded-full ${
                  isCaloriesOver ? 'bg-red-400' : 
                  caloriesPercentage >= 80 ? 'bg-green-400' : 
                  caloriesPercentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></span>
                <span className={`text-2xl font-bold ${caloriesTextColor} ${darkMode ? '' : 'mix-blend-normal'}`}>
                  {convertEnergy(caloriesCurrent)}
                </span>
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                / {convertEnergy(caloriesGoal)} {getEnergyLabel()}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <span className={`w-3 h-3 rounded-full ${
                  proteinPercentage >= 80 ? 'bg-green-400' : 
                  proteinPercentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`}></span>
                <span className={`text-2xl font-bold ${proteinTextColor} ${darkMode ? '' : 'mix-blend-normal'}`}>
                  {Math.round(proteinCurrent)}
                </span>
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                / {proteinGoal}g protein
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} p-4 transition-colors duration-300`}>
      <div className="max-w-md mx-auto">
        {/* Header with Date Navigation */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <button
            onClick={goToPreviousDay}
            className={`p-3 ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-white/60'} rounded-full transition-all duration-200 hover:scale-110 active:scale-95`}
          >
            <ChevronLeft size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {formatDate(currentDate)}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <button
            onClick={goToNextDay}
            className={`p-3 rounded-full transition-all duration-200 ${
              isToday 
                ? 'opacity-30 cursor-not-allowed' 
                : `${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-white/60'} hover:scale-110 active:scale-95`
            }`}
            disabled={isToday}
          >
            <ChevronRight size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-6">
          {!isToday && (
            <button
              onClick={goToToday}
              className={`flex-1 ${darkMode ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-200 border-gray-700/50' : 'bg-white/80 hover:bg-white text-gray-700 border-gray-200/50'} backdrop-blur-sm py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm border`}
            >
              Jump to Today
            </button>
          )}
          <button
            onClick={() => setShowWeekly(true)}
            className={`flex-1 ${darkMode ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-200 border-gray-700/50' : 'bg-white/80 hover:bg-white text-gray-700 border-gray-200/50'} backdrop-blur-sm py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm border`}
          >
            <Calendar size={18} />
            Weekly
          </button>
          <button
            onClick={() => setShowMonthly(true)}
            className={`flex-1 ${darkMode ? 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-200 border-gray-700/50' : 'bg-white/80 hover:bg-white text-gray-700 border-gray-200/50'} backdrop-blur-sm py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm border`}
          >
            <Calendar size={18} />
            Monthly
          </button>
          <button
            onClick={() => {
              setTempGoals(goals);
              setTempDarkMode(darkMode);
              setTempDisplayUnit(displayUnit);
              setShowSettings(true);
            }}
            className={`p-2.5 ${darkMode ? 'hover:bg-gray-700/50 border-gray-700/50' : 'hover:bg-white/60 border-gray-200/50'} rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-90 shadow-sm border`}
          >
            <Settings size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
          </button>
        </div>

        {/* Circular Progress Section */}
        <div className={`${darkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/70 border-gray-200/50'} backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-6 transform transition-all duration-300 hover:shadow-2xl border`}>
          <div className="flex justify-center">
            <CombinedCircularProgress
              caloriesCurrent={totals.calories}
              caloriesGoal={goals.calories}
              proteinCurrent={totals.protein}
              proteinGoal={goals.protein}
            />
          </div>
        </div>

        {/* Entries List */}
        {currentEntries.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/70 border-gray-200/50'} backdrop-blur-lg rounded-3xl shadow-xl p-6 mb-24 border`}>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4 tracking-wide`}>MEALS</h2>
            <div className="space-y-3">
              {currentEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex justify-between items-center p-4 ${darkMode ? 'bg-gray-700/30 hover:bg-gray-700/50 border-gray-600/30' : 'bg-gray-50 hover:bg-gray-100 border-gray-200/30'} rounded-xl transition-all duration-300 transform hover:scale-102 hover:shadow-md border`}
                  style={{
                    animation: `slideIn 0.4s ease-out ${index * 0.1}s backwards`
                  }}
                >
                  <div>
                    <p className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{entry.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        {convertEnergy(entry.calories)} {getEnergyLabel()}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        {entry.protein}g protein
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className={`p-2 ${darkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-100'} rounded-xl transition-all duration-200 hover:scale-110 active:scale-95`}
                    >
                      <Edit2 size={18} className="text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry)}
                      className={`p-2 ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-100'} rounded-xl transition-all duration-200 hover:scale-110 active:scale-95`}
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentEntries.length === 0 && (
          <div className={`${darkMode ? 'bg-gray-800/40 border-gray-700/50' : 'bg-white/70 border-gray-200/50'} backdrop-blur-lg rounded-3xl shadow-xl p-12 mb-24 text-center border`}>
            <div className="opacity-20 mb-4">
              <div className="text-8xl">🍽️</div>
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg font-medium`}>No meals logged {isToday ? 'yet' : 'for this day'}</p>
          </div>
        )}

        {/* Add Button with pulse animation */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse-custom"
        >
          <Plus size={36} strokeWidth={3} />
        </button>

        {/* Add Entry Modal */}
        {showAddModal && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-6 w-full max-w-md shadow-2xl border animate-scaleIn max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {editingEntry ? 'Edit Food' : 'Add Food'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchTerm('');
                    setEditingEntry(null);
                    setNewEntry({ name: '', energy: '', energyUnit: 'cal', protein: '' });
                  }}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-all duration-200 hover:rotate-90`}
                >
                  <X size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
                </button>
              </div>

              {/* Previous Meals Search - only show when not editing */}
              {!editingEntry && previousMeals.length > 0 && (
                <div className="mb-6 pb-6 border-b-2 border-gray-600/30">
                  <label className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    QUICK ADD FROM HISTORY
                  </label>
                  <div className="relative">
                    <Search size={18} className={`absolute left-3 top-3.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Search previous meals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 p-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200`}
                    />
                  </div>
                  
                  {searchTerm && filteredPreviousMeals.length > 0 && (
                    <div className={`mt-2 max-h-40 overflow-y-auto ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-2 space-y-1`}>
                      {filteredPreviousMeals.map((meal, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadPreviousMeal(meal)}
                          className={`w-full text-left p-3 ${darkMode ? 'hover:bg-gray-600/50' : 'hover:bg-gray-100'} rounded-lg transition-all`}
                        >
                          <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{meal.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {meal.calories} kcal â€¢ {meal.protein}g protein
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <h3 className={`text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 tracking-wide`}>
                {editingEntry ? 'EDIT MEAL' : 'ADD NEW MEAL'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    FOOD NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Food name"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                    className={`w-full p-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      ENERGY
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewEntry({ ...newEntry, energyUnit: 'cal' })}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                          newEntry.energyUnit === 'cal'
                            ? 'bg-blue-500 text-white'
                            : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        kcal
                      </button>
                      <button
                        onClick={() => setNewEntry({ ...newEntry, energyUnit: 'kj' })}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                          newEntry.energyUnit === 'kj'
                            ? 'bg-blue-500 text-white'
                            : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        kJ
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="Energy amount"
                    value={newEntry.energy}
                    onChange={(e) => setNewEntry({ ...newEntry, energy: e.target.value })}
                    className={`w-full p-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg`}
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="10"
                    value={newEntry.energy || 0}
                    onChange={(e) => setNewEntry({ ...newEntry, energy: e.target.value })}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    PROTEIN (G)
                  </label>
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={newEntry.protein}
                    onChange={(e) => setNewEntry({ ...newEntry, protein: e.target.value })}
                    className={`w-full p-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg`}
                  />
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="1"
                    value={newEntry.protein || 0}
                    onChange={(e) => setNewEntry({ ...newEntry, protein: e.target.value })}
                    className="w-full mt-2"
                  />
                </div>

                <button
                  onClick={editingEntry ? handleUpdateEntry : handleAddEntry}
                  disabled={!newEntry.name || !newEntry.energy || !newEntry.protein}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  {editingEntry ? 'Update Entry' : 'Add Entry'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-6 w-full max-w-md shadow-2xl border animate-scaleIn`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-all duration-200 hover:rotate-90`}
                >
                  <X size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div>
                  <label className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    THEME
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setTempDarkMode(false)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        !tempDarkMode
                          ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
                          : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Sun size={20} />
                      <span className="font-semibold">Light</span>
                    </button>
                    <button
                      onClick={() => setTempDarkMode(true)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        tempDarkMode
                          ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
                          : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Moon size={20} />
                      <span className="font-semibold">Dark</span>
                    </button>
                  </div>
                </div>

                {/* Display Unit Toggle */}
                <div>
                  <label className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    ENERGY UNIT
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTempDisplayUnit('cal')}
                      className={`flex-1 p-3 rounded-xl font-semibold transition-all ${
                        tempDisplayUnit === 'cal'
                          ? 'bg-blue-500 text-white'
                          : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Kilocalories (kcal)
                    </button>
                    <button
                      onClick={() => setTempDisplayUnit('kj')}
                      className={`flex-1 p-3 rounded-xl font-semibold transition-all ${
                        tempDisplayUnit === 'kj'
                          ? 'bg-blue-500 text-white'
                          : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Kilojoules (kJ)
                    </button>
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 tracking-wide`}>
                    CALORIE GOAL
                  </label>
                  <input
                    type="number"
                    value={tempGoals.calories}
                    onChange={(e) => setTempGoals({ ...tempGoals, calories: e.target.value })}
                    className={`w-full p-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2 tracking-wide`}>
                    PROTEIN GOAL (G)
                  </label>
                  <input
                    type="number"
                    value={tempGoals.protein}
                    onChange={(e) => setTempGoals({ ...tempGoals, protein: e.target.value })}
                    className={`w-full p-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 focus:shadow-lg`}
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly View Modal */}
        {showWeekly && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-md my-8 shadow-2xl border animate-scaleIn max-h-[90vh] flex flex-col`}
            >
              {/* Sticky Header */}
              <div className={`flex justify-between items-center p-6 pb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl sticky top-0 z-10`}>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Last 7 Days
                </h2>
                <button
                  onClick={() => setShowWeekly(false)}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-all duration-200 hover:rotate-90`}
                >
                  <X size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto px-6 pb-6">

              {/* Weekly Totals */}
              <div className={`${darkMode ? 'bg-gray-700/40 border-gray-600/50' : 'bg-blue-50 border-blue-100'} rounded-2xl p-5 mb-6 shadow-md border`}>
                <h3 className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4 tracking-wide`}>WEEKLY TOTALS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${darkMode ? 'bg-gray-800/50 border-gray-600/30' : 'bg-white/70 border-blue-200/30'} rounded-xl p-3 border`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold mb-1`}>ENERGY</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {convertEnergy(weeklyTotals.calories)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>Avg: {convertEnergy(weeklyTotals.calories / 7)}/{getEnergyLabel()} day</p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800/50 border-gray-600/30' : 'bg-white/70 border-blue-200/30'} rounded-xl p-3 border`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold mb-1`}>PROTEIN (G)</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {Math.round(weeklyTotals.protein)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>Avg: {Math.round(weeklyTotals.protein / 7)}/day</p>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown */}
              <div className="space-y-3">
                {weeklyData.map((day, index) => (
                  <div
                    key={day.key}
                    className={`border-2 ${darkMode ? 'border-gray-700/50 hover:border-blue-500/50 bg-gray-700/20' : 'border-gray-200/50 hover:border-blue-400/50 bg-gray-50/50'} rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-102`}
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
                        <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {formatDate(day.date)}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-0.5`}>
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="font-bold text-blue-400">{convertEnergy(day.calories)}</span> {getEnergyLabel()}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="font-bold text-green-400">{Math.round(day.protein)}</span>g protein
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className={`flex-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5 overflow-hidden`}>
                        <div
                          className={`h-2.5 rounded-full transition-all duration-700 ${
                            day.calories > goals.calories 
                              ? 'bg-gradient-to-r from-red-400 to-red-600' 
                              : 'bg-gradient-to-r from-blue-400 to-purple-500'
                          }`}
                          style={{ width: `${Math.min((day.calories / goals.calories) * 100, 100)}%` }}
                        />
                      </div>
                      <div className={`flex-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5 overflow-hidden`}>
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
          </div>
        )}

        {/* Monthly View Modal */}
        {showMonthly && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl w-full max-w-md my-8 shadow-2xl border animate-scaleIn max-h-[90vh] flex flex-col`}
            >
              {/* Sticky Header */}
              <div className={`flex justify-between items-center p-6 pb-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl sticky top-0 z-10`}>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Last 30 Days
                </h2>
                <button
                  onClick={() => setShowMonthly(false)}
                  className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-all duration-200 hover:rotate-90`}
                >
                  <X size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto px-6 pb-6">

              {/* Monthly Totals */}
              <div className={`${darkMode ? 'bg-gray-700/40 border-gray-600/50' : 'bg-blue-50 border-blue-100'} rounded-2xl p-5 mb-6 shadow-md border`}>
                <h3 className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4 tracking-wide`}>MONTHLY TOTALS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${darkMode ? 'bg-gray-800/50 border-gray-600/30' : 'bg-white/70 border-blue-200/30'} rounded-xl p-3 border`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold mb-1`}>ENERGY</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {convertEnergy(monthlyTotals.calories)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>Avg: {convertEnergy(monthlyTotals.calories / 30)}/{getEnergyLabel()} day</p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800/50 border-gray-600/30' : 'bg-white/70 border-blue-200/30'} rounded-xl p-3 border`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-semibold mb-1`}>PROTEIN (G)</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {Math.round(monthlyTotals.protein)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-1`}>Avg: {Math.round(monthlyTotals.protein / 30)}/day</p>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown */}
              <div className="space-y-3">
                {monthlyData.map((day, index) => (
                  <div
                    key={day.key}
                    className={`border-2 ${darkMode ? 'border-gray-700/50 hover:border-blue-500/50 bg-gray-700/20' : 'border-gray-200/50 hover:border-blue-400/50 bg-gray-50/50'} rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-102`}
                    onClick={() => {
                      setCurrentDate(day.date);
                      setShowMonthly(false);
                    }}
                    style={{
                      animation: `slideIn 0.4s ease-out ${Math.min(index * 0.05, 1)}s backwards`
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {formatDate(day.date)}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'} mt-0.5`}>
                          {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="font-bold text-blue-400">{convertEnergy(day.calories)}</span> {getEnergyLabel()}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="font-bold text-green-400">{Math.round(day.protein)}</span>g protein
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className={`flex-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5 overflow-hidden`}>
                        <div
                          className={`h-2.5 rounded-full transition-all duration-700 ${
                            day.calories > goals.calories 
                              ? 'bg-gradient-to-r from-red-400 to-red-600' 
                              : 'bg-gradient-to-r from-blue-400 to-purple-500'
                          }`}
                          style={{ width: `${Math.min((day.calories / goals.calories) * 100, 100)}%` }}
                        />
                      </div>
                      <div className={`flex-1 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5 overflow-hidden`}>
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
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          >
            <div 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-6 w-full max-w-sm shadow-2xl border animate-scaleIn`}
            >
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={32} className="text-red-500" />
                </div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
                  Delete Entry?
                </h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  Are you sure you want to delete this meal?
                </p>
                <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-3 mt-4`}>
                  <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{deleteConfirm.name}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {convertEnergy(deleteConfirm.calories)} {getEnergyLabel()} • {deleteConfirm.protein}g protein
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className={`flex-1 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-bold py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEntry}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
