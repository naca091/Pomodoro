import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { usePomodoroContext, SessionType } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const Timer: React.FC = () => {
  const { 
    isRunning, 
    currentSession, 
    timeLeft, 
    totalTime,
    startTimer, 
    pauseTimer, 
    resetTimer, 
    skipSession,
    dailyProgress,
    settings,
    streak
  } = usePomodoroContext();
  
  const theme = useTheme();
  
  // Animation values
  const mainButtonScale = useRef(new Animated.Value(1)).current;
  const timerOpacity = useRef(new Animated.Value(1)).current;
  
  // Button press animation
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(mainButtonScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(mainButtonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Timer focus breathing animation when running
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timerOpacity, {
            toValue: 0.85,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(timerOpacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(timerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isRunning]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get session name
  const getSessionName = (type: SessionType): string => {
    switch (type) {
      case 'work':
        return 'Focus Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus Time';
    }
  };
  
  // Get session emoji
  const getSessionEmoji = (type: SessionType): string => {
    switch (type) {
      case 'work':
        return '🧠';
      case 'shortBreak':
        return '☕';
      case 'longBreak':
        return '🌿';
      default:
        return '🧠';
    }
  };
  
  // Calculate progress for the circle
  const progress = (totalTime - timeLeft) / totalTime;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  
  // Calculate daily goal progress
  const dailyGoalProgress = Math.min(100, Math.round((dailyProgress / settings.dailyGoalMinutes) * 100));
  
  // Get color based on session type
  const getSessionColor = (type: SessionType): string => {
    switch (type) {
      case 'work':
        return theme.primary;
      case 'shortBreak':
        return theme.secondary;
      case 'longBreak':
        return theme.accent;
      default:
        return theme.primary;
    }
  };
  
  // Get session gradient colors
  const getSessionGradient = (type: SessionType): [string, string] => {
    switch (type) {
      case 'work':
        return [theme.primary, '#F48FB1']; // Soft red to pink
      case 'shortBreak':
        return [theme.secondary, '#B2DFDB']; // Soft green to teal
      case 'longBreak':
        return [theme.accent, '#D1C4E9']; // Soft purple to lavender
      default:
        return [theme.primary, '#F48FB1'];
    }
  };
  
  const sessionColor = getSessionColor(currentSession);
  const sessionGradient = getSessionGradient(currentSession);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Daily Goal Status */}
      <View style={styles.goalContainer}>
        <Text style={[styles.goalText, { color: theme.textSecondary }]}>
          Daily Goal: {dailyProgress}/{settings.dailyGoalMinutes} min
        </Text>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                backgroundColor: theme.primary,
                width: `${dailyGoalProgress}%` 
              }
            ]} 
          />
        </View>
      </View>
      
      {/* Streak Display */}
      {streak.currentStreak > 0 && (
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color="#FF9500" />
          <Text style={styles.streakText}>
            {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      
      <View style={styles.sessionNameContainer}>
        <Text style={[styles.sessionEmoji]}>{getSessionEmoji(currentSession)}</Text>
        <Text style={[styles.sessionName, { color: theme.text }]}>
          {getSessionName(currentSession)}
        </Text>
      </View>
      
      <Animated.View 
        style={[
          styles.timerCircleContainer,
          { 
            opacity: timerOpacity,
            shadowColor: sessionColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 15,
            elevation: 5
          }
        ]}
      >
        <View style={styles.timerCircle}>
          <Svg width={radius * 2 + 40} height={radius * 2 + 40}>
            {/* Background circle */}
            <Circle
              cx={radius + 20}
              cy={radius + 20}
              r={radius}
              stroke={theme.border}
              strokeWidth={15}
              fill="transparent"
            />
            
            {/* Progress circle */}
            <Circle
              cx={radius + 20}
              cy={radius + 20}
              r={radius}
              stroke={sessionColor}
              strokeWidth={15}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              transform={`rotate(-90, ${radius + 20}, ${radius + 20})`}
            />
          </Svg>
          
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
            style={styles.timerInnerCircle}
          >
            <View style={styles.timeTextContainer}>
              <Text style={[styles.timeText, { color: theme.text }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={[styles.timeSubtext, { color: theme.textSecondary }]}>
                {isRunning ? 'Keep going!' : 'Ready?'}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.button, { 
            backgroundColor: theme.backgroundSecondary,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2
          }]} 
          onPress={resetTimer}
        >
          <Ionicons name="refresh" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Animated.View style={{ transform: [{ scale: mainButtonScale }] }}>
          <TouchableOpacity 
            style={[styles.mainButton, { 
              backgroundColor: sessionColor,
              shadowColor: sessionColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4
            }]} 
            onPress={() => {
              animateButton();
              isRunning ? pauseTimer() : startTimer();
            }}
          >
            <LinearGradient
              colors={sessionGradient}
              style={styles.gradientButton}
            >
              <Ionicons 
                name={isRunning ? 'pause' : 'play'} 
                size={32} 
                color="white" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
        
        <TouchableOpacity 
          style={[styles.button, { 
            backgroundColor: theme.backgroundSecondary,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2
          }]} 
          onPress={skipSession}
        >
          <Ionicons name="play-skip-forward" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  sessionNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  sessionEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  sessionName: {
    fontSize: 26,
    fontWeight: '600',
  },
  timerCircleContainer: {
    marginVertical: 20,
  },
  timerCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerInnerCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  timeSubtext: {
    fontSize: 16,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },
  streakText: {
    color: '#FF9500',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default Timer; 