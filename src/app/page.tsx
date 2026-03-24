
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Sprout, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load remembered credentials
  useEffect(() => {
    const remembered = localStorage.getItem('ns_remember');
    if (remembered) {
      try {
        const { credential: savedCred } = JSON.parse(remembered);
        setCredential(savedCred);
        setRememberMe(true);
      } catch (e) { }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(credential, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
      return;
    }

    // Save credentials if Remember Me is checked
    if (rememberMe) {
      localStorage.setItem('ns_remember', JSON.stringify({ credential }));
    } else {
      localStorage.removeItem('ns_remember');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-green-100 p-3">
            <Sprout className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Nilesh Seeds
          </h1>
          <h2 className="text-xl font-medium text-green-700">निलेश सीड्स</h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please login to continue.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="credential" className="block text-sm font-medium text-gray-700">
                Username / Name
              </label>
              <input
                id="credential"
                name="credential"
                type="text"
                required
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                placeholder="Name or Phone (Admin / Farmer / Employee)"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                💡 Employees: Use your phone number as username
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all"
          >
            Log In / लॉग इन (Login)
          </button>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            New Farmer?{' '}
            <Link href="/signup" className="font-semibold text-green-600 hover:text-green-500">
              Register Here / पंजीकरण करें
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
