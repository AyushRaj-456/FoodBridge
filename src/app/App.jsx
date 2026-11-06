import { AuthProvider } from '../features/auth/AuthContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import AppShell from './AppShell.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
