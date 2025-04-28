import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { usePomodoroContext, SessionRecord, SessionType } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const History: React.FC = () => {
  const { sessionHistory } = usePomodoroContext();
  const theme = useTheme();
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get icon and color for session type
  const getSessionInfo = (type: SessionType): { label: string; color: string; icon: string } => {
    switch (type) {
      case 'work':
        return { 
          label: 'Focus Time', 
          color: theme.primary,
          icon: 'brain'
        };
      case 'shortBreak':
        return { 
          label: 'Short Break', 
          color: theme.secondary,
          icon: 'cafe'
        };
      case 'longBreak':
        return { 
          label: 'Long Break', 
          color: theme.accent,
          icon: 'leaf'
        };
      default:
        return { 
          label: 'Focus Time', 
          color: theme.primary,
          icon: 'brain'
        };
    }
  };
  
  // Group sessions by date
  const groupSessionsByDate = () => {
    const grouped: { [key: string]: SessionRecord[] } = {};
    
    sessionHistory.forEach(session => {
      const date = new Date(session.startTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(session);
    });
    
    return Object.entries(grouped).map(([date, sessions]) => ({
      date,
      sessions,
      totalFocusTime: sessions
        .filter(s => s.type === 'work')
        .reduce((total, s) => total + s.duration, 0)
    }));
  };
  
  const groupedSessions = groupSessionsByDate();
  
  // Render each history item
  const renderSessionItem = ({ item }: { item: SessionRecord }) => {
    const sessionInfo = getSessionInfo(item.type);
    
    return (
      <View style={[styles.historyItem, { 
        backgroundColor: theme.backgroundSecondary, 
        borderColor: theme.border,
        shadowColor: sessionInfo.color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
      }]}>
        <View style={[styles.sessionIconContainer, { backgroundColor: `${sessionInfo.color}20` }]}>
          <Ionicons name={sessionInfo.icon} size={20} color={sessionInfo.color} />
        </View>
        
        <View style={styles.sessionDetails}>
          <Text style={[styles.sessionType, { color: theme.text }]}>
            {sessionInfo.label}
          </Text>
          
          <Text style={[styles.sessionTime, { color: theme.textSecondary }]}>
            {formatDate(item.startTime).split(',')[1].trim()}
          </Text>
        </View>
        
        <View style={[styles.durationContainer, { backgroundColor: `${sessionInfo.color}15` }]}>
          <Text style={[styles.duration, { color: sessionInfo.color }]}>
            {item.duration} min
          </Text>
        </View>
      </View>
    );
  };
  
  // Render each day group
  const renderDayGroup = ({ item }: { item: { date: string, sessions: SessionRecord[], totalFocusTime: number } }) => {
    return (
      <View style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={18} color={theme.textSecondary} style={styles.calendarIcon} />
            <Text style={[styles.dateText, { color: theme.text }]}>{item.date}</Text>
          </View>
          
          <View style={styles.totalTimeContainer}>
            <Ionicons name="time" size={16} color={theme.primary} style={styles.timeIcon} />
            <Text style={[styles.totalTimeText, { color: theme.primary }]}>
              {item.totalFocusTime} min of focus
            </Text>
          </View>
        </View>
        
        {item.sessions.map((session, index) => (
          <View key={`${session.startTime}-${index}`}>
            {renderSessionItem({ item: session })}
          </View>
        ))}
      </View>
    );
  };
  
  // Empty list component
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="hourglass-outline" size={60} color={`${theme.textSecondary}80`} style={styles.emptyIcon} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No sessions yet
      </Text>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        Complete your first focus session to see your history here.
      </Text>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>History</Text>
      
      <FlatList
        data={groupedSessions}
        renderItem={renderDayGroup}
        keyExtractor={(item) => item.date}
        ListEmptyComponent={EmptyListComponent}
        style={styles.list}
        contentContainerStyle={groupedSessions.length === 0 ? styles.emptyList : { paddingBottom: 20 }}
      />
    </View>
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
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  dayContainer: {
    marginBottom: 24,
  },
  dayHeader: {
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarIcon: {
    marginRight: 8,
  },
  totalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 26,
  },
  totalTimeText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  timeIcon: {
    marginRight: 6,
  },
  historyItem: {
    flexDirection: 'row',
    borderRadius: 20,
    marginBottom: 12,
    padding: 14,
    marginLeft: 10,
    marginRight: 4,
    borderWidth: 1,
    alignItems: 'center',
  },
  sessionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
  },
  durationContainer: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default History; 