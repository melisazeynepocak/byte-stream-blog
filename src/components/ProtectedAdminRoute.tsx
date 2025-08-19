import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, ReactNode } from "react";
import NotFound from "@/pages/NotFound";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, role, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  // Show 404 if not authenticated or not admin
  if (!user || role !== 'admin') {
    return <NotFound />;
  }

  // Show admin content if authenticated and admin
  return <>{children}</>;
}