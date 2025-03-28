import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, useTheme } from "./context/ThemeContext"
import router from './router';
import { Toaster } from 'sonner';

function AppContent() {
  const { theme } = useTheme(); // Get the current theme

  return (
    <>
      <Toaster
        richColors
        position="top-right"
        theme={theme === 'dark' ? 'dark' : 'light'}
        toastOptions={{
          classNames: {
            success: 'bg-green-500 text-white dark:bg-green-700',
            error: 'bg-red-500 text-white dark:bg-red-700',
            warning: 'bg-yellow-500 text-black dark:bg-yellow-600',
            info: 'bg-blue-500 text-white dark:bg-blue-700',
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;