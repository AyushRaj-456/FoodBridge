import { AuthProvider } from '../features/auth/AuthContext.jsx';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import AppShell from './AppShell.jsx';

export default function App({ initialPublic = true }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell initialPublicSite={initialPublic} />
      </AuthProvider>
    </ThemeProvider>
  );
}
