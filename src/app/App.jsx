import { AuthProvider } from '../features/auth/AuthContext.jsx';
import AppShell from './AppShell.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
