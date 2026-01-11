import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(formData.username, formData.password);
      navigate('/'); // Go to home on success
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-sm p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Please enter your details to login</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 text-xs mb-6 font-bold tracking-wide border-l-4 border-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-0 top-2 text-gray-400" size={16} />
              <input 
                type="email" 
                className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none transition-colors"
                placeholder="email@example.com"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Password</label>
            <div className="relative">
              <Lock className="absolute left-0 top-2 text-gray-400" size={16} />
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              <button 
                type="button"
                className="absolute right-0 top-2 text-gray-400 hover:text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" size="sm" className="text-[10px] text-gray-400 uppercase font-bold tracking-widest hover:text-black transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:bg-gray-400"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 text-center border-t pt-8">
          <p className="text-xs text-gray-500">
            New to Anvi Studio? 
            <Link to="/register" className="text-black font-bold border-b border-black ml-2 hover:text-gray-600 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;