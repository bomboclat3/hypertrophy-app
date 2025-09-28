'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Dumbbell, Calendar, TrendingUp, Home, Activity, Trophy, Target, BarChart3, ChevronUp, ChevronDown, Minus } from 'lucide-react';

interface Lift {
  id: string;
  name: string;
  createdAt: string;
}

interface WorkoutEntry {
  id: string;
  liftId: string;
  weight: number;
  reps: number;
  sets: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  date: string;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

export default function GymTracker() {
  const [lifts, setLifts] = useLocalStorage<Lift[]>('gym-lifts', []);
  const [workouts, setWorkouts] = useLocalStorage<WorkoutEntry[]>('gym-workouts', []);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'lifts' | 'history'>('dashboard');
  const [newLiftName, setNewLiftName] = useState('');
  const [selectedLiftId, setSelectedLiftId] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);

  const addLift = () => {
    if (newLiftName.trim()) {
      const newLift: Lift = {
        id: Date.now().toString(),
        name: newLiftName.trim(),
        createdAt: new Date().toISOString()
      };
      setLifts([...lifts, newLift]);
      setNewLiftName('');
    }
  };

  const deleteLift = (id: string) => {
    setLifts(lifts.filter(lift => lift.id !== id));
    setWorkouts(workouts.filter(workout => workout.liftId !== id));
  };

  const logWorkout = () => {
    if (selectedLiftId && weight && reps && sets) {
      const newWorkout: WorkoutEntry = {
        id: Date.now().toString(),
        liftId: selectedLiftId,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        sets: parseInt(sets),
        difficulty,
        date: new Date().toISOString()
      };
      setWorkouts([newWorkout, ...workouts]);
      setWeight('');
      setReps('');
      setSets('');
      setDifficulty(3);
    }
  };

  const getLiftName = (liftId: string) => {
    return lifts.find(lift => lift.id === liftId)?.name || 'Unknown Lift';
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
  };

  const getDifficultyLabel = (diff: number) => {
    const labels = ['', 'RPE 6', 'RPE 7', 'RPE 8', 'RPE 9', 'RPE 10'];
    return labels[diff];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetrics = () => {
    const totalSessions = workouts.length;
    const totalWeight = workouts.reduce((sum, w) => sum + (w.weight * w.reps * w.sets), 0);
    const uniqueExercises = new Set(workouts.map(w => w.liftId)).size;
    const lastWorkoutDate = workouts.length > 0 
      ? new Date(Math.max(...workouts.map(w => new Date(w.date).getTime())))
      : null;
    const daysSinceLastWorkout = lastWorkoutDate 
      ? Math.floor((new Date().getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const personalRecords = new Map();
    workouts.forEach(w => {
      const current = personalRecords.get(w.liftId) || 0;
      if (w.weight > current) {
        personalRecords.set(w.liftId, w.weight);
      }
    });
    
    return {
      totalSessions,
      totalWeight,
      uniqueExercises,
      lastWorkoutDate,
      daysSinceLastWorkout,
      personalRecords: personalRecords.size
    };
  };

  const getExerciseProgression = (liftId: string) => {
    const exerciseWorkouts = workouts
      .filter(w => w.liftId === liftId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (exerciseWorkouts.length < 2) return 'neutral';
    
    const recent = exerciseWorkouts[exerciseWorkouts.length - 1];
    const previous = exerciseWorkouts[exerciseWorkouts.length - 2];
    
    if (recent.weight > previous.weight) return 'up';
    if (recent.weight < previous.weight) return 'down';
    if (recent.reps > previous.reps) return 'up';
    if (recent.reps < previous.reps) return 'down';
    return 'neutral';
  };

  const getRecentWorkouts = () => {
    return workouts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-emerald-400" />
            Hypertrophy App
          </h1>
          <p className="text-slate-400 text-sm mt-1">Evidence-based progressive overload tracking</p>
        </div>
      </header>
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: Home },
              { key: 'log', label: 'Log Session', icon: Plus },
              { key: 'lifts', label: 'Exercises', icon: Dumbbell },
              { key: 'history', label: 'Progress', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'dashboard' | 'log' | 'lifts' | 'history')}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === key
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {(() => {
              const metrics = getMetrics();
              const recentWorkouts = getRecentWorkouts();
              
              return (
                <>
                  <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Home className="text-emerald-400" size={24} />
                      Dashboard
                    </h2>
                    <p className="text-slate-400">Track your progressive overload journey</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <Activity className="text-blue-400" size={20} />
                        <span className="text-2xl font-bold text-blue-400">{metrics.totalSessions}</span>
                      </div>
                      <p className="text-slate-400 text-sm">Total Sessions</p>
                    </div>

                    {/* Total Weight */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <Target className="text-emerald-400" size={20} />
                        <span className="text-2xl font-bold text-emerald-400">
                          {metrics.totalWeight.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">Total Weight (lbs)</p>
                    </div>

                    {/* Unique Exercises */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <Dumbbell className="text-purple-400" size={20} />
                        <span className="text-2xl font-bold text-purple-400">{metrics.uniqueExercises}</span>
                      </div>
                      <p className="text-slate-400 text-sm">Exercises Tracked</p>
                    </div>

                    {/* Personal Records */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <Trophy className="text-yellow-400" size={20} />
                        <span className="text-2xl font-bold text-yellow-400">{metrics.personalRecords}</span>
                      </div>
                      <p className="text-slate-400 text-sm">Personal Records</p>
                    </div>
                  </div>

                  {/* Last Workout Info */}
                  {metrics.lastWorkoutDate && (
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="text-emerald-400" size={20} />
                          <div>
                            <p className="font-medium">Last Workout</p>
                            <p className="text-slate-400 text-sm">
                              {formatDate(metrics.lastWorkoutDate.toISOString())}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {(metrics.daysSinceLastWorkout ?? 0) === 0 ? 'Today' : 
                             (metrics.daysSinceLastWorkout ?? 0) === 1 ? '1 day ago' :
                             `${metrics.daysSinceLastWorkout ?? 0} days ago`}
                          </p>
                          <p className={`text-sm ${
                            (metrics.daysSinceLastWorkout ?? 0) <= 2 ? 'text-emerald-400' :
                            (metrics.daysSinceLastWorkout ?? 0) <= 7 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {(metrics.daysSinceLastWorkout ?? 0) <= 2 ? 'Great consistency!' :
                             (metrics.daysSinceLastWorkout ?? 0) <= 7 ? 'Keep it up!' :
                             'Time to get back to it!'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Lifts with Progression */}
                  {recentWorkouts.length > 0 && (
                    <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="text-emerald-400" size={20} />
                        Recent Lifts & Progression
                      </h3>
                      
                      <div className="space-y-3">
                        {recentWorkouts.map(workout => {
                          const progression = getExerciseProgression(workout.liftId);
                          const ProgressIcon = progression === 'up' ? ChevronUp : 
                                             progression === 'down' ? ChevronDown : Minus;
                          const progressColor = progression === 'up' ? 'text-emerald-400' :
                                               progression === 'down' ? 'text-red-400' :
                                               'text-slate-400';
                          
                          return (
                            <div
                              key={workout.id}
                              className="p-4 bg-slate-800 rounded-lg border border-slate-700 transition-all hover:border-slate-600"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${progressColor === 'text-emerald-400' ? 'bg-emerald-950' :
                                                                    progressColor === 'text-red-400' ? 'bg-red-950' :
                                                                    'bg-slate-700'}`}>
                                    <ProgressIcon className={progressColor} size={16} />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{getLiftName(workout.liftId)}</h4>
                                    <p className="text-slate-400 text-sm">{formatDate(workout.date)}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg">{workout.weight} lbs</p>
                                  <p className="text-slate-400 text-sm">{workout.sets} × {workout.reps}</p>
                                </div>
                              </div>
                              
                              {/* Progress Bar Visualization */}
                              <div className="flex items-center gap-2 mt-3">
                                <span className="text-xs text-slate-500 w-8">RPE</span>
                                <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      workout.difficulty <= 2 ? 'bg-green-500' :
                                      workout.difficulty === 3 ? 'bg-yellow-500' :
                                      workout.difficulty === 4 ? 'bg-orange-500' :
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${(workout.difficulty / 5) * 100}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${
                                  workout.difficulty <= 2 ? 'text-green-400' :
                                  workout.difficulty === 3 ? 'text-yellow-400' :
                                  workout.difficulty === 4 ? 'text-orange-400' :
                                  'text-red-400'
                                }`}>
                                  {getDifficultyLabel(workout.difficulty)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {workouts.length > 5 && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => setActiveTab('history')}
                            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-2 mx-auto transition-colors"
                          >
                            View All Progress
                            <TrendingUp size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Empty State */}
                  {workouts.length === 0 && (
                    <div className="bg-slate-900 rounded-lg p-8 border border-slate-800 text-center">
                      <Dumbbell size={48} className="mx-auto mb-4 text-slate-600" />
                      <h3 className="text-lg font-semibold mb-2">Welcome to Hypertrophy App!</h3>
                      <p className="text-slate-400 mb-4">Start your progressive overload journey by logging your first workout.</p>
                      <button
                        onClick={() => setActiveTab('log')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Log First Workout
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        
        {/* Log Workout Tab */}
        {activeTab === 'log' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus size={20} />
                Log Training Session
              </h2>
              
              {lifts.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  <Dumbbell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No exercises configured yet!</p>
                  <p className="text-sm">Add your first movement to begin tracking progressive overload.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Lift Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Exercise
                    </label>
                    <select
                      value={selectedLiftId}
                      onChange={(e) => setSelectedLiftId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Select an exercise...</option>
                      {lifts.map(lift => (
                        <option key={lift.id} value={lift.id}>{lift.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Weight, Reps, Sets */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Load (lbs)
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="135"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Sets
                      </label>
                      <input
                        type="number"
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="3"
                      />
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      RPE (Rate of Perceived Exertion): {getDifficultyLabel(difficulty)}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level as 1 | 2 | 3 | 4 | 5)}
                          className={`w-12 h-10 rounded-lg border-2 font-medium transition-colors ${
                            difficulty === level
                              ? 'border-emerald-400 bg-emerald-400 text-slate-900'
                              : 'border-slate-600 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={logWorkout}
                    disabled={!selectedLiftId || !weight || !reps || !sets}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Log Session
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manage Lifts Tab */}
        {activeTab === 'lifts' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Dumbbell size={20} />
                Exercise Library
              </h2>
              
              {/* Add New Lift */}
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newLiftName}
                  onChange={(e) => setNewLiftName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addLift()}
                  placeholder="Add new exercise (e.g., Barbell Back Squat)"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={addLift}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Lifts List */}
              {lifts.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  <p>No exercises added yet.</p>
                  <p className="text-sm">Add your first exercise above to get started!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lifts.map(lift => (
                    <div
                      key={lift.id}
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                    >
                      <span className="font-medium">{lift.name}</span>
                      <button
                        onClick={() => deleteLift(lift.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Training Progress
              </h2>
              
              {workouts.length === 0 ? (
                <div className="text-slate-400 text-center py-8">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No training sessions logged yet.</p>
                  <p className="text-sm">Start tracking your progressive overload journey!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workouts.map(workout => (
                    <div
                      key={workout.id}
                      className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">
                          {getLiftName(workout.liftId)}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-sm">
                            {formatDate(workout.date)}
                          </span>
                          <button
                            onClick={() => deleteWorkout(workout.id)}
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-950 rounded transition-colors"
                            title="Delete workout"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Load:</span>
                          <div className="font-medium">{workout.weight} lbs</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Reps:</span>
                          <div className="font-medium">{workout.reps}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">Sets:</span>
                          <div className="font-medium">{workout.sets}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">RPE:</span>
                          <div className="font-medium text-emerald-400">
                            {getDifficultyLabel(workout.difficulty)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
