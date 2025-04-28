import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { usePomodoroContext } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Settings: React.FC = () => {
  const { settings, updateSettings, setCustomDuration, isDarkMode, toggleDarkMode, streak, dailyProgress } = usePomodoroContext();
  const theme = useTheme();
  
  // Local state for form values
  const [workDuration, setWorkDuration] = useState(settings.workDuration.toString());
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration.toString());
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration.toString());
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(
    settings.sessionsBeforeLongBreak.toString()
  );
  const [customDuration, setCustomDurationValue] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(settings.dailyGoalMinutes.toString());
  
  // Handle saving settings
  const handleSaveSettings = () => {
    const updatedSettings = {
      workDuration: parseInt(workDuration) || 25,
      shortBreakDuration: parseInt(shortBreakDuration) || 5,
      longBreakDuration: parseInt(longBreakDuration) || 15,
      sessionsBeforeLongBreak: parseInt(sessionsBeforeLongBreak) || 4,
      dailyGoalMinutes: parseInt(dailyGoalMinutes) || 180,
      notificationsEnabled: settings.notificationsEnabled,
    };
    
    updateSettings(updatedSettings);
    Alert.alert("Settings Saved", "Your changes have been saved successfully ✨");
  };
  
  // Handle setting custom duration
  const handleCustomDuration = () => {
    const duration = parseInt(customDuration);
    if (duration > 0) {
      setCustomDuration(duration);
      setCustomDurationValue('');
    }
  };
  
  // Toggle notifications
  const toggleNotifications = () => {
    updateSettings({
      notificationsEnabled: !settings.notificationsEnabled,
    });
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const percentage = Math.min(100, Math.round((dailyProgress / settings.dailyGoalMinutes) * 100));
    return percentage;
  };
  
  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    const progress = calculateProgress();
    
    if (progress === 0) return "Start your day with focus ✨";
    if (progress < 25) return "Great start! Keep going 🌱";
    if (progress < 50) return "You're making progress! 🌟";
    if (progress < 75) return "Well done! You're over halfway there 🔥";
    if (progress < 100) return "Almost there! Strong finish 💪";
    return "You reached your daily goal! Amazing work 🎉";
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      
      {/* Daily Goal & Streak Section */}
      <View style={[styles.settingSection, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Goal & Streak</Text>
        
        {/* Motivational Message */}
        <Text style={[styles.motivationalMessage, { color: theme.textSecondary }]}>
          {getMotivationalMessage()}
        </Text>
        
        {/* Daily Goal Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: theme.text }]}>
              Today's Progress: {dailyProgress} / {settings.dailyGoalMinutes} minutes
            </Text>
            <Text style={[styles.progressPercentage, { color: theme.primary }]}>
              {calculateProgress()}%
            </Text>
          </View>
          
          <View style={[styles.progressBarBackground, { backgroundColor: theme.border }]}>
            <LinearGradient
              colors={['#E57373', '#F06292']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBarFill, 
                { width: `${calculateProgress()}%` }
              ]} 
            />
          </View>
        </View>
        
        {/* Streak Information */}
        <View style={styles.streakContainer}>
          <View style={[styles.streakItem, { 
            backgroundColor: 'rgba(229, 115, 115, 0.1)',
            borderRadius: 20,
            padding: 15
          }]}>
            <View style={styles.streakIconContainer}>
              <Ionicons name="flame" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.streakNumber, { color: theme.primary }]}>{streak.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Current Streak</Text>
          </View>
          
          <View style={[styles.streakItem, { 
            backgroundColor: 'rgba(149, 117, 205, 0.1)',
            borderRadius: 20,
            padding: 15
          }]}>
            <View style={styles.streakIconContainer}>
              <Ionicons name="trophy" size={24} color={theme.accent} />
            </View>
            <Text style={[styles.streakNumber, { color: theme.accent }]}>{streak.highestStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Best Streak</Text>
          </View>
        </View>
        
        {/* Daily Goal Setting */}
        <View style={styles.inputRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Daily Goal (minutes)</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              borderColor: theme.border, 
              backgroundColor: theme.background,
              borderRadius: 20 
            }]}
            keyboardType="number-pad"
            value={dailyGoalMinutes}
            onChangeText={setDailyGoalMinutes}
            maxLength={4}
          />
        </View>
      </View>
      
      {/* Theme Toggle */}
      <View style={[styles.settingSection, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
        
        <View style={[styles.settingRow, { marginBottom: 15 }]}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="moon" size={20} color={theme.text} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Cozy Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="notifications" size={20} color={theme.text} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      {/* Timer Settings */}
      <View style={[styles.settingSection, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Timer Settings</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="timer-outline" size={20} color={theme.primary} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Focus Time (minutes)</Text>
          </View>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              borderColor: theme.border, 
              backgroundColor: theme.background,
              borderRadius: 20 
            }]}
            keyboardType="number-pad"
            value={workDuration}
            onChangeText={setWorkDuration}
            maxLength={3}
          />
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="cafe-outline" size={20} color={theme.secondary} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Short Break (minutes)</Text>
          </View>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              borderColor: theme.border, 
              backgroundColor: theme.background,
              borderRadius: 20 
            }]}
            keyboardType="number-pad"
            value={shortBreakDuration}
            onChangeText={setShortBreakDuration}
            maxLength={2}
          />
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="leaf-outline" size={20} color={theme.accent} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Long Break (minutes)</Text>
          </View>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              borderColor: theme.border, 
              backgroundColor: theme.background,
              borderRadius: 20 
            }]}
            keyboardType="number-pad"
            value={longBreakDuration}
            onChangeText={setLongBreakDuration}
            maxLength={2}
          />
        </View>
        
        <View style={styles.inputRow}>
          <View style={styles.settingLabelContainer}>
            <Ionicons name="repeat-outline" size={20} color={theme.text} style={{ marginRight: 10 }} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>Sessions Before Long Break</Text>
          </View>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              borderColor: theme.border, 
              backgroundColor: theme.background,
              borderRadius: 20 
            }]}
            keyboardType="number-pad"
            value={sessionsBeforeLongBreak}
            onChangeText={setSessionsBeforeLongBreak}
            maxLength={1}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSaveSettings}
        >
          <LinearGradient
            colors={['#E57373', '#F06292']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {/* Custom Duration */}
      <View style={[styles.settingSection, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Custom Timer</Text>
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Start a one-time timer with a custom duration
        </Text>
        
        <View style={styles.customDurationContainer}>
          <TextInput
            style={[styles.customDurationInput, { 
              color: theme.text, 
              borderColor: theme.border, 
              backgroundColor: theme.background,
              borderRadius: 20
            }]}
            keyboardType="number-pad"
            placeholder="Duration in minutes"
            placeholderTextColor={theme.textSecondary}
            value={customDuration}
            onChangeText={setCustomDurationValue}
          />
          
          <TouchableOpacity
            style={[styles.customDurationButton, { backgroundColor: theme.accent }]}
            onPress={handleCustomDuration}
          >
            <LinearGradient
              colors={['#9575CD', '#B39DDB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.customDurationButtonText}>Set Timer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* About Section */}
      <View style={[styles.settingSection, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
        <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
          Cozy Pomodoro helps you stay focused and productive with timed work sessions and breaks.
        </Text>
        <Text style={[styles.aboutText, { color: theme.textSecondary, marginTop: 10 }]}>
          Take care of your well-being while accomplishing your goals. 🌿
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingSection: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
  },
  inputRow: {
    marginBottom: 15,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginTop: 8,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 10,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  streakItem: {
    alignItems: 'center',
    width: '48%',
  },
  streakIconContainer: {
    marginBottom: 5,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 14,
  },
  customDurationContainer: {
    marginTop: 10,
  },
  customDurationInput: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  customDurationButton: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  customDurationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  motivationalMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default Settings; 