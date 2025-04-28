import { createContext, useContext } from 'react';
import { usePomodoroContext } from './PomodoroContext';

// Define theme colors
export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  error: string;
  success: string;
}

// Define light and dark themes
export const lightTheme: ThemeColors = {
  background: '#FFF8F0',      // Warm cream background
  backgroundSecondary: '#FFFFFF',
  text: '#5D4037',            // Warm brown text
  textSecondary: '#8D6E63',   // Lighter brown text
  primary: '#E57373',         // Soft red (instead of bright #FF5252)
  secondary: '#81C784',       // Soft green
  accent: '#9575CD',          // Soft purple
  border: '#ECDFD6',          // Soft beige border
  error: '#EF9A9A',           // Softer red for errors
  success: '#A5D6A7',         // Softer green for success
};

export const darkTheme: ThemeColors = {
  background: '#2D2522',      // Dark warm brown
  backgroundSecondary: '#3A302C',
  text: '#F5EBE0',            // Warm off-white text
  textSecondary: '#D7CCC8',   // Light beige secondary text
  primary: '#EF9A9A',         // Soft red
  secondary: '#A5D6A7',       // Soft green
  accent: '#B39DDB',          // Soft purple
  border: '#4E342E',          // Soft brown border
  error: '#EF9A9A',           // Soft red for errors
  success: '#A5D6A7',         // Soft green for success
};

// Create theme context
export const ThemeContext = createContext<ThemeColors>(lightTheme);

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = usePomodoroContext();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Default export
export default ThemeContext; 