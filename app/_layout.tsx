import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PomodoroProvider } from './context/PomodoroContext';
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  return (
    <PomodoroProvider>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PomodoroProvider>
  );
}
