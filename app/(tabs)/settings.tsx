import { View, StyleSheet } from 'react-native';
import Settings from '../components/Settings';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Settings />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 