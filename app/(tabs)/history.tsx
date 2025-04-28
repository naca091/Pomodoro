import { View, StyleSheet } from 'react-native';
import History from '../components/History';
import { useTheme } from '../context/ThemeContext';

export default function HistoryScreen() {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <History />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 