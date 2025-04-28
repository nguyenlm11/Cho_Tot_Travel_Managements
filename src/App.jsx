import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom';
import { routes } from './routes';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => {
  const routing = useRoutes(routes);

  
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
