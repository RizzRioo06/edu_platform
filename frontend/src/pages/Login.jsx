import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, Zap, Users } from "lucide-react";
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email: formData.email, password: formData.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white p-4 overflow-hidden" >
      <div className="bg-white w-full max-w-5xl h-[90vh] max-h-[700px] rounded-xl shadow-xl overflow-hidden flex">
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-600">
              Sign in to continue to your account
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-700">Remember me</span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-300"></div>
            <span className="px-4 text-sm text-slate-500">
              or continue with
            </span>
            <div className="flex-1 border-t border-slate-300"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-slate-700 font-medium">
              Sign in with Google
            </span>
          </button>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Create account
            </a>
          </p>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-slate-400 rounded-full blur-3xl"></div>
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Main Content */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center">
              {/* Illustration */}
              <div className="mb-12 relative">
                {/* Dashboard Preview Cards */}
                <div className="relative">
                  {/* Main Card */}
                  <div className="w-64 h-40 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-xl p-6 shadow-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-32 h-3 bg-slate-600 rounded-full"></div>
                      <div className="w-24 h-3 bg-slate-600 rounded-full"></div>
                    </div>
                  </div>

                  {/* Small Cards */}
                  <div className="absolute -top-6 -right-6 w-20 h-24 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-xl transform rotate-6 hover:rotate-3 transition-transform">
                    <Zap className="w-6 h-6 text-blue-400 mb-2" />
                    <div className="w-full h-2 bg-slate-600 rounded-full mb-1"></div>
                    <div className="w-3/4 h-2 bg-slate-600 rounded-full"></div>
                  </div>

                  <div className="absolute -bottom-4 -left-6 w-20 h-24 bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-xl transform -rotate-6 hover:-rotate-3 transition-transform">
                    <Users className="w-6 h-6 text-blue-400 mb-2" />
                    <div className="w-full h-2 bg-slate-600 rounded-full mb-1"></div>
                    <div className="w-3/4 h-2 bg-slate-600 rounded-full"></div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div
                  className="absolute bottom-0 left-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
              </div>

              {/* Text Content */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-white">
                  Discover & Explore
                </h2>
                <p className="text-slate-400 text-lg max-w-md mx-auto">
                  Explore academic content and educational materials{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
