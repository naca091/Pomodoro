import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { usePomodoroContext, SessionRecord } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DayData {
  day: string;
  date: string;
  workMinutes: number;
  sessionsCount: number;
}

const Statistics: React.FC = () => {
  const { sessionHistory, streak, settings, dailyProgress } = usePomodoroContext();
  const theme = useTheme();
  
  // Process data for weekly view
  const weeklyData = useMemo(() => {
    // Get dates for the past 7 days
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    // Create day data objects
    const dayData: DayData[] = dates.map(date => {
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('en-US', { day: 'numeric' });
      return {
        day,
        date: dateStr,
        workMinutes: 0,
        sessionsCount: 0,
      };
    });
    
    // Process session history
    sessionHistory.forEach(session => {
      if (session.type === 'work') {
        const sessionDate = new Date(session.startTime);
        
        // Check if session is within the past 7 days
        for (let i = 0; i < 7; i++) {
          const dayDate = dates[i];
          if (
            sessionDate.getDate() === dayDate.getDate() &&
            sessionDate.getMonth() === dayDate.getMonth() &&
            sessionDate.getFullYear() === dayDate.getFullYear()
          ) {
            dayData[i].workMinutes += session.duration;
            dayData[i].sessionsCount += 1;
            break;
          }
        }
      }
    });
    
    return dayData;
  }, [sessionHistory]);
  
  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const totalMinutes = weeklyData.reduce((sum, day) => sum + day.workMinutes, 0);
    const totalSessions = weeklyData.reduce((sum, day) => sum + day.sessionsCount, 0);
    const avgDailyMinutes = totalMinutes / 7;
    
    // Find day with most focus time
    let maxDay = { day: '', minutes: 0 };
    weeklyData.forEach(day => {
      if (day.workMinutes > maxDay.minutes) {
        maxDay = { day: day.day, minutes: day.workMinutes };
      }
    });
    
    return {
      totalMinutes,
      totalSessions,
      avgDailyMinutes,
      mostProductiveDay: maxDay.day,
      mostProductiveMinutes: maxDay.minutes,
    };
  }, [weeklyData]);
  
  // Find the maximum minutes value for scaling the bars
  const maxMinutes = useMemo(() => {
    return Math.max(
      ...weeklyData.map(day => day.workMinutes),
      60 // Set minimum height to represent 1 hour
    );
  }, [weeklyData]);
  
  // Calculate daily goal progress percentage
  const goalProgress = Math.min(100, Math.round((dailyProgress / settings.dailyGoalMinutes) * 100));
  
  // Get motivational message based on weekly performance
  const getMotivationalMessage = () => {
    if (weeklyStats.totalMinutes === 0) return "Start your focus journey this week! ✨";
    if (weeklyStats.totalMinutes < 60) return "Great start to your focus practice! 🌱";
    if (weeklyStats.totalMinutes < 180) return "You're building a solid focus habit! 🌟";
    if (weeklyStats.totalMinutes < 300) return "Impressive focus consistency this week! 🔥";
    return "Outstanding dedication to your focus practice! 🏆";
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>
      
      {/* Motivational Message */}
      <View style={[styles.motivationContainer, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }]}>
        <Text style={[styles.motivationText, { color: theme.textSecondary }]}>
          {getMotivationalMessage()}
        </Text>
      </View>
      
      {/* Streak Section */}
      <View style={[styles.streakContainer, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }]}>
        <View style={styles.streakHeader}>
          <Ionicons name="flame" size={24} color="#FF9500" />
          <Text style={[styles.streakTitle, { color: theme.text }]}>Your Streak</Text>
        </View>
        
        <View style={styles.streakStats}>
          <View style={[styles.streakStat, {
            backgroundColor: 'rgba(255, 149, 0, 0.1)',
            borderRadius: 20,
            padding: 15
          }]}>
            <Text style={[styles.streakValue, { color: "#FF9500" }]}>{streak.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Current Streak</Text>
          </View>
          
          <View style={styles.streakStat}>
            <Text style={[styles.streakValue, { color: "#FF9500" }]}>{streak.highestStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Best Streak</Text>
          </View>
        </View>
        
        {/* Daily Goal Progress */}
        <View style={styles.goalProgressContainer}>
          <View style={styles.goalTextRow}>
            <Text style={[styles.goalText, { color: theme.text }]}>
              Today's Goal: {dailyProgress} / {settings.dailyGoalMinutes} min
            </Text>
            <Text style={[styles.goalPercentage, { color: theme.primary }]}>
              {goalProgress}%
            </Text>
          </View>
          
          <View style={[styles.goalProgressBar, { backgroundColor: theme.border }]}>
            <LinearGradient
              colors={goalProgress >= 100 ? ['#81C784', '#4CAF50'] : ['#E57373', '#F06292']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.goalProgressFill, { width: `${goalProgress}%` }]}
            />
          </View>
        </View>
      </View>
      
      {/* Weekly Overview */}
      <View style={[styles.statsContainer, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }]}>
        <View style={[styles.statItem, {
          backgroundColor: `${theme.primary}10`,
          borderRadius: 16,
          padding: 12
        }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time" size={22} color={theme.primary} />
          </View>
          <Text style={[styles.statValue, { color: theme.primary }]}>{weeklyStats.totalMinutes}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Minutes</Text>
        </View>
        
        <View style={[styles.statItem, {
          backgroundColor: `${theme.secondary}10`,
          borderRadius: 16,
          padding: 12
        }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkbox" size={22} color={theme.secondary} />
          </View>
          <Text style={[styles.statValue, { color: theme.secondary }]}>{weeklyStats.totalSessions}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Sessions</Text>
        </View>
        
        <View style={[styles.statItem, {
          backgroundColor: `${theme.accent}10`,
          borderRadius: 16,
          padding: 12
        }]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="calendar" size={22} color={theme.accent} />
          </View>
          <Text style={[styles.statValue, { color: theme.accent }]}>{Math.round(weeklyStats.avgDailyMinutes)}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Avg Min/Day</Text>
        </View>
      </View>
      
      {/* Most Productive Day */}
      {weeklyStats.mostProductiveMinutes > 0 && (
        <View style={[styles.productiveDayContainer, { 
          backgroundColor: theme.backgroundSecondary, 
          borderColor: theme.border,
          shadowColor: theme.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="trophy" size={22} color={theme.primary} style={styles.sectionIcon} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Most Productive Day</Text>
          </View>
          
          <Text style={[styles.productiveDay, { color: theme.primary }]}>
            {weeklyStats.mostProductiveDay} ({weeklyStats.mostProductiveMinutes} minutes)
          </Text>
        </View>
      )}
      
      {/* Weekly Chart */}
      <View style={[styles.chartContainer, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="bar-chart" size={22} color={theme.primary} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Focus Time</Text>
        </View>
        
        <View style={styles.chart}>
          {weeklyData.map((day, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelContainer}>
                <Text style={[styles.barValue, { color: theme.text }]}>
                  {day.workMinutes > 0 ? day.workMinutes : ''}
                </Text>
              </View>
              
              <View style={styles.barWrapper}>
                {day.workMinutes > 0 ? (
                  <LinearGradient
                    colors={[theme.primary, '#F48FB1']}
                    style={[
                      styles.bar, 
                      { height: (day.workMinutes / maxMinutes) * 150 }
                    ]}
                  />
                ) : (
                  <View 
                    style={[
                      styles.emptyBar,
                      { backgroundColor: theme.border }
                    ]} 
                  />
                )}
              </View>
              
              <Text style={[styles.barLabel, { color: theme.textSecondary }]}>{day.day}</Text>
              <Text style={[styles.barDate, { color: theme.textSecondary }]}>{day.date}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Focus Tip */}
      <View style={[styles.tipContainer, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
      }]}>
        <View style={styles.tipHeader}>
          <Ionicons name="bulb" size={22} color="#FFB74D" style={styles.tipIcon} />
          <Text style={[styles.tipTitle, { color: theme.text }]}>Focus Tip</Text>
        </View>
        <Text style={[styles.tipText, { color: theme.textSecondary }]}>
          Try the 2-minute rule: If a task takes less than 2 minutes, do it immediately instead of scheduling it for later. This helps reduce mental clutter. ✨
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
  motivationContainer: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  streakContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  streakStat: {
    alignItems: 'center',
    width: '48%',
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
  },
  streakDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  goalProgressContainer: {
    marginTop: 10,
  },
  goalTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalProgressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  productiveDayContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productiveDay: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginTop: 10,
  },
  barContainer: {
    alignItems: 'center',
    width: '13%',
  },
  barLabelContainer: {
    height: 20,
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    textAlign: 'center',
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  emptyBar: {
    width: '80%',
    height: 4,
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  barDate: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  tipContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 8,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

export default Statistics; 