import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Timer from '../components/Timer';

export default function PomodoroScreen() {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Timer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
