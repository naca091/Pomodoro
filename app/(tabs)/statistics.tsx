import { View, StyleSheet } from 'react-native';
import Statistics from '../components/Statistics';
import { useTheme } from '../context/ThemeContext';

export default function StatisticsScreen() {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Statistics />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 