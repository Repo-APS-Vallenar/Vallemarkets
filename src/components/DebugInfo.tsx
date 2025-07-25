import { useAuth } from '../contexts/AuthContext';

const DebugInfo = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold">Debug Info:</h3>
      <p>Loading: {isLoading ? 'true' : 'false'}</p>
      <p>Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
      <p>User: {user ? user.name : 'null'}</p>
      <p>Role: {user ? user.role : 'none'}</p>
    </div>
  );
};

export default DebugInfo;
