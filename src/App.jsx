import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { useEffect } from 'react';
import authService from './services/api/authAPI';

const App = () => {
  const routing = useRoutes(routes);

  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      debugger
      const navEntries = performance.getEntriesByType("navigation");
      const isReload =
        navEntries.length > 0 && navEntries[0].type === "reload";

      if (!isReload) {
       
        await authService.logout(); // hoặc fetch
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  return (
    <ThemeProvider>
      {routing}
    </ThemeProvider>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
