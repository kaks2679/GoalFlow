import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    console.log('🔒 PrivateRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  console.log('✅ PrivateRoute: User authenticated:', currentUser.email);
  return children;
}

export default PrivateRoute;
