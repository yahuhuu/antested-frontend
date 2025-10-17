// Path: src/hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Hook kustom untuk mengakses data dari ThemeContext.
 * @returns {object} Objek yang berisi tema saat ini ('light' atau 'dark') dan fungsi untuk men-toggle tema.
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
