import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import AppRoutes from './routes';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
