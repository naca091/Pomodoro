import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePomodoroContext } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';

export default function TabLayout() {
  const { isDarkMode } = usePomodoroContext();
  const theme = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.backgroundSecondary },
        tabBarLabelStyle: { fontSize: 12 },
        headerStyle: { backgroundColor: theme.backgroundSecondary },
        headerTintColor: theme.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pomodoro',
          tabBarIcon: ({ color, size }) => <Ionicons name="timer-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
