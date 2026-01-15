import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '', // email
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', formData);
      // On success, go to OTP verification
      navigate(`/verify-otp?email=${formData.username}`);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Email might already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-sm p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold mb-2">Create Account</h2>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Join the Anvi Studio family</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 text-xs mb-6 font-bold tracking-wide border-l-4 border-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">First Name</label>
              <div className="relative">
                <User className="absolute left-0 top-2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Last Name</label>
              <div className="relative">
                <User className="absolute left-0 top-2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-0 top-2 text-gray-400" size={16} />
              <input 
                type="email" 
                className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-0 top-2 text-gray-400" size={16} />
              <input 
                type="tel" 
                className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-2 text-gray-400" size={16} />
                <input 
                  type="password" 
                  className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-2 text-gray-400" size={16} />
                <input 
                  type="password" 
                  className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <div className="mt-10 text-center border-t pt-8">
          <p className="text-xs text-gray-500">
            Already have an account? 
            <Link to="/login" className="text-black font-bold border-b border-black ml-2 hover:text-gray-600 transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;