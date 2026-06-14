import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppLayout } from "@/layouts/AppLayout";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";

function AppRouter() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return (
    <AppLayout>
      <Home />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}