import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '../components';

function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    // Will be integrated with useLogin hook later
    setIsLoading(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-6"
        />
        
        <Button
          type="submit"
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Logging in...' : 'Sign In'}
        </Button>
        
        <p className="mt-6 text-sm text-center text-gray-500">
          Don't have an account? <Link to="/register" className="font-medium text-primary">Register</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;