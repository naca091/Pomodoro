import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Platform, AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';

// Define session types
export type SessionType = 'work' | 'shortBreak' | 'longBreak';

// Define session history record
export interface SessionRecord {
  type: SessionType;
  duration: number; // in minutes
  startTime: string; // ISO string
  endTime: string; // ISO string
}

// Define streak data
export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string | null; // ISO date string
  highestStreak: number;
}

// Define context type
interface PomodoroContextType {
  // Timer state
  isRunning: boolean;
  currentSession: SessionType;
  timeLeft: number;
  totalTime: number;
  
  // Settings
  settings: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    dailyGoalMinutes: number; // New: daily goal in minutes
    notificationsEnabled: boolean; // New: enable/disable notifications
  };
  
  // History
  sessionHistory: SessionRecord[];
  
  // Theme
  isDarkMode: boolean;
  
  // Goals & Streaks
  dailyProgress: number; // minutes completed today
  streak: StreakData;
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  setCustomDuration: (minutes: number) => void;
  updateSettings: (newSettings: Partial<PomodoroContextType['settings']>) => void;
  toggleDarkMode: () => void;
}

// Create context with default values
const PomodoroContext = createContext<PomodoroContextType>({
  isRunning: false,
  currentSession: 'work',
  timeLeft: 25 * 60, // 25 minutes in seconds
  totalTime: 25 * 60,
  
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    dailyGoalMinutes: 180, // Default 3 hours goal
    notificationsEnabled: true,
  },
  
  sessionHistory: [],
  
  isDarkMode: false,
  
  dailyProgress: 0,
  streak: {
    currentStreak: 0,
    lastCompletedDate: null,
    highestStreak: 0,
  },
  
  startTimer: () => {},
  pauseTimer: () => {},
  resetTimer: () => {},
  skipSession: () => {},
  setCustomDuration: () => {},
  updateSettings: () => {},
  toggleDarkMode: () => {},
});

// Storage keys
const SETTINGS_STORAGE_KEY = 'pomodoro_settings';
const HISTORY_STORAGE_KEY = 'pomodoro_history';
const THEME_STORAGE_KEY = 'pomodoro_theme';
const STREAK_STORAGE_KEY = 'pomodoro_streak';
const DAILY_PROGRESS_KEY = 'pomodoro_daily_progress';
const LAST_DATE_KEY = 'pomodoro_last_date';

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default: 25 minutes in seconds
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  
  // Settings
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    dailyGoalMinutes: 180, // Default 3 hours
    notificationsEnabled: true,
  });
  
  // History
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  
  // Theme
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  
  // Goals & Streaks
  const [dailyProgress, setDailyProgress] = useState(0);
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    lastCompletedDate: null,
    highestStreak: 0,
  });
  
  // App state for tracking when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // Check if day has changed and reset daily progress if needed
      checkAndResetDailyProgress();
    }
  };
  
  // Setup notifications
  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    
    // Schedule random reminder if enabled
    if (settings.notificationsEnabled) {
      scheduleRandomReminder();
    }
    
    return () => {
      // Clean up notifications when component unmounts
      Notifications.cancelAllScheduledNotificationsAsync();
    };
  }, [settings.notificationsEnabled]);
  
  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permission not granted for notifications');
      return;
    }
  };
  
  const scheduleRandomReminder = async () => {
    // Cancel any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    if (!settings.notificationsEnabled) return;
    
    // Schedule a random reminder during work hours (9 AM - 5 PM)
    const now = new Date();
    const scheduledTime = new Date();
    
    // Generate random hour between 9 and 17 (9 AM - 5 PM)
    const randomHour = Math.floor(Math.random() * 9) + 9;
    scheduledTime.setHours(randomHour);
    
    // Generate random minute
    const randomMinute = Math.floor(Math.random() * 60);
    scheduledTime.setMinutes(randomMinute);
    
    // If time is in the past, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const secondsUntilNotification = Math.floor(
      (scheduledTime.getTime() - now.getTime()) / 1000
    );
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't forget your Pomodoro goal!",
        body: `You've completed ${dailyProgress} minutes of your ${settings.dailyGoalMinutes} minute goal today. Keep going!`,
      },
      trigger: {
        seconds: secondsUntilNotification,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  };
  
  // Check if day has changed and reset daily progress if needed
  const checkAndResetDailyProgress = async () => {
    try {
      const lastDateStr = await AsyncStorage.getItem(LAST_DATE_KEY);
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date as YYYY-MM-DD
      
      if (lastDateStr && lastDateStr !== currentDate) {
        // It's a new day, check if goal was completed yesterday
        const previousDate = new Date(lastDateStr);
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        
        // Check if previous date was yesterday (not just different)
        const isYesterday = previousDate.getDate() === yesterdayDate.getDate() &&
                            previousDate.getMonth() === yesterdayDate.getMonth() &&
                            previousDate.getFullYear() === yesterdayDate.getFullYear();
        
        // Update streak based on yesterday's goal completion
        const goalAchieved = await AsyncStorage.getItem(DAILY_PROGRESS_KEY);
        
        if (goalAchieved && parseInt(goalAchieved) >= settings.dailyGoalMinutes && isYesterday) {
          // Streak continues
          updateStreak(true);
        } else if (!isYesterday) {
          // More than one day passed, reset streak
          updateStreak(false);
        }
        
        // Reset for new day
        setDailyProgress(0);
        await AsyncStorage.setItem(DAILY_PROGRESS_KEY, '0');
        await AsyncStorage.setItem(LAST_DATE_KEY, currentDate);
      } else if (!lastDateStr) {
        // First time app is used, just set the date
        await AsyncStorage.setItem(LAST_DATE_KEY, currentDate);
      }
    } catch (error) {
      console.error('Error checking day change:', error);
    }
  };
  
  // Update streak count
  const updateStreak = async (goalCompleted: boolean) => {
    try {
      const newStreak = { ...streak };
      const today = new Date().toISOString().split('T')[0]; // Get current date as YYYY-MM-DD
      
      if (goalCompleted) {
        // Goal completed, increment streak
        newStreak.currentStreak++;
        newStreak.lastCompletedDate = today;
        
        // Update highest streak if current streak is higher
        if (newStreak.currentStreak > newStreak.highestStreak) {
          newStreak.highestStreak = newStreak.currentStreak;
        }
      } else {
        // Goal missed, reset streak
        newStreak.currentStreak = 0;
      }
      
      setStreak(newStreak);
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreak));
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };
  
  // Check if daily goal has been met after each session
  const checkDailyGoal = async (addedMinutes: number) => {
    try {
      const newProgress = dailyProgress + addedMinutes;
      setDailyProgress(newProgress);
      await AsyncStorage.setItem(DAILY_PROGRESS_KEY, newProgress.toString());
      
      // If goal just reached with this session
      if (dailyProgress < settings.dailyGoalMinutes && newProgress >= settings.dailyGoalMinutes) {
        // Goal achieved for today
        const today = new Date().toISOString().split('T')[0]; // Get current date as YYYY-MM-DD
        
        // Check if streak already updated today
        if (streak.lastCompletedDate !== today) {
          updateStreak(true);
          
          // Show congratulation notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Daily Goal Achieved! 🎉",
              body: `Congratulations! You've reached your daily goal of ${settings.dailyGoalMinutes} minutes. Current streak: ${streak.currentStreak + 1} days!`,
            },
            trigger: null, // Show immediately
          });
        }
      }
    } catch (error) {
      console.error('Error checking daily goal:', error);
    }
  };
  
  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Load settings
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          if (currentSession === 'work') {
            setTimeLeft(parsedSettings.workDuration * 60);
            setTotalTime(parsedSettings.workDuration * 60);
          }
        }
        
        // Load history
        const savedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (savedHistory) {
          setSessionHistory(JSON.parse(savedHistory));
        }
        
        // Load theme
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
        
        // Load streak data
        const savedStreak = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
        if (savedStreak) {
          setStreak(JSON.parse(savedStreak));
        }
        
        // Load daily progress
        const savedProgress = await AsyncStorage.getItem(DAILY_PROGRESS_KEY);
        if (savedProgress) {
          setDailyProgress(parseInt(savedProgress));
        }
        
        // Check if day has changed
        checkAndResetDailyProgress();
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    };
    
    loadSavedData();
  }, []);
  
  // Save settings when changed
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        
        // Reschedule reminder notification when settings change
        if (settings.notificationsEnabled) {
          scheduleRandomReminder();
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };
    
    saveSettings();
  }, [settings]);
  
  // Save history when changed
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessionHistory));
      } catch (error) {
        console.error('Error saving history:', error);
      }
    };
    
    saveHistory();
  }, [sessionHistory]);
  
  // Save theme when changed
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDarkMode));
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };
    
    saveTheme();
  }, [isDarkMode]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session completed
      handleSessionComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);
  
  // Handle session completion
  const handleSessionComplete = () => {
    // Record finished session
    if (sessionStartTime && currentSession === 'work') {
      const sessionDurationMinutes = totalTime / 60; // convert seconds to minutes
      
      const newRecord: SessionRecord = {
        type: currentSession,
        duration: sessionDurationMinutes,
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
      };
      
      setSessionHistory(prev => [newRecord, ...prev]);
      
      // Update daily progress with completed work session
      checkDailyGoal(sessionDurationMinutes);
    }
    
    // Reset session start time
    setSessionStartTime(null);
    
    // Determine next session
    if (currentSession === 'work') {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      if (newCompletedSessions % settings.sessionsBeforeLongBreak === 0) {
        // Time for a long break
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        setTotalTime(settings.longBreakDuration * 60);
      } else {
        // Time for a short break
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
        setTotalTime(settings.shortBreakDuration * 60);
      }
    } else {
      // Break is over, back to work
      setCurrentSession('work');
      setTimeLeft(settings.workDuration * 60);
      setTotalTime(settings.workDuration * 60);
    }
  };
  
  // Start timer
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      
      // If starting a new session, record the start time
      if (!sessionStartTime) {
        setSessionStartTime(new Date().toISOString());
      }
    }
  };
  
  // Pause timer
  const pauseTimer = () => {
    setIsRunning(false);
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setSessionStartTime(null);
    
    if (currentSession === 'work') {
      setTimeLeft(settings.workDuration * 60);
      setTotalTime(settings.workDuration * 60);
    } else if (currentSession === 'shortBreak') {
      setTimeLeft(settings.shortBreakDuration * 60);
      setTotalTime(settings.shortBreakDuration * 60);
    } else {
      setTimeLeft(settings.longBreakDuration * 60);
      setTotalTime(settings.longBreakDuration * 60);
    }
  };
  
  // Skip current session
  const skipSession = () => {
    setIsRunning(false);
    setSessionStartTime(null);
    
    if (currentSession === 'work') {
      // Skipping work, go to break
      if ((completedSessions + 1) % settings.sessionsBeforeLongBreak === 0) {
        setCurrentSession('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
        setTotalTime(settings.longBreakDuration * 60);
      } else {
        setCurrentSession('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
        setTotalTime(settings.shortBreakDuration * 60);
      }
      
      setCompletedSessions(prev => prev + 1);
    } else {
      // Skipping break, go back to work
      setCurrentSession('work');
      setTimeLeft(settings.workDuration * 60);
      setTotalTime(settings.workDuration * 60);
    }
  };
  
  // Set custom duration for the next session
  const setCustomDuration = (minutes: number) => {
    if (minutes > 0 && !isRunning) {
      const seconds = minutes * 60;
      setTimeLeft(seconds);
      setTotalTime(seconds);
    }
  };
  
  // Update settings
  const updateSettings = (newSettings: Partial<PomodoroContextType['settings']>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // If timer is not running, update timeLeft based on current session
    if (!isRunning) {
      if (currentSession === 'work') {
        setTimeLeft(updatedSettings.workDuration * 60);
        setTotalTime(updatedSettings.workDuration * 60);
      } else if (currentSession === 'shortBreak') {
        setTimeLeft(updatedSettings.shortBreakDuration * 60);
        setTotalTime(updatedSettings.shortBreakDuration * 60);
      } else {
        setTimeLeft(updatedSettings.longBreakDuration * 60);
        setTotalTime(updatedSettings.longBreakDuration * 60);
      }
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  return (
    <PomodoroContext.Provider
      value={{
        isRunning,
        currentSession,
        timeLeft,
        totalTime,
        settings,
        sessionHistory,
        isDarkMode,
        dailyProgress,
        streak,
        startTimer,
        pauseTimer,
        resetTimer,
        skipSession,
        setCustomDuration,
        updateSettings,
        toggleDarkMode,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoroContext = () => useContext(PomodoroContext);

// Default export
export default PomodoroContext; 