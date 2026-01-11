import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, Heart, User, Search, Menu, X, Mail, Phone, 
  MapPin, LogOut, ArrowRight, ShieldCheck, Eye, EyeOff, Lock,
  ShoppingBag, Facebook, Instagram, Twitter, ChevronRight
} from 'lucide-react';

// ==========================================
// SECTION 1: API CLIENT (client.js)
// ==========================================
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ==========================================
// SECTION 2: AUTH CONTEXT (AuthContext.jsx)
// ==========================================
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          setUser(res.data);
        } catch (e) { localStorage.removeItem('token'); }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (u, p) => {
    const res = await apiClient.post('/auth/login', { username: u, password: p });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated: !!user, isAdmin: user?.role === 'ADMIN' }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// ==========================================
// SECTION 3: LAYOUT COMPONENTS (Navbar & Footer)
// ==========================================

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="bg-black text-white text-[10px] py-2 text-center font-bold tracking-[0.2em] uppercase">
        ✨ Free Shipping on orders over ₹2,000 | New Festive Collection ✨
      </div>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu size={24} />
        </button>

        <div className="hidden lg:flex w-1/3">
          <div className="relative w-64">
            <input type="text" placeholder="Search collection..." className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 px-4 pl-10 text-xs focus:ring-1 focus:ring-black outline-none" />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
          </div>
        </div>

        <div className="w-1/3 text-center">
          <Link to="/" className="text-2xl font-serif font-black tracking-tighter hover:opacity-80 transition-opacity">
            ANVI STUDIO
          </Link>
        </div>

        <div className="w-1/3 flex items-center justify-end space-x-6">
          <div className="group relative">
            <button className="flex items-center space-x-1.5 text-gray-700 hover:text-black transition-colors">
              <User size={20} />
              <span className="text-[10px] font-bold uppercase hidden lg:inline tracking-wider">
                {isAuthenticated ? user.username : 'Account'}
              </span>
            </button>
            <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-2xl border rounded-sm w-48 py-2 z-50">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block px-4 py-2 text-xs hover:bg-gray-50">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-xs hover:bg-gray-50">Orders</Link>
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-50 border-t mt-1">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2 text-xs hover:bg-gray-50">Login</Link>
                  <Link to="/register" className="block px-4 py-2 text-xs hover:bg-gray-50">Register</Link>
                </>
              )}
            </div>
          </div>
          <Link to="/cart" className="relative text-gray-700 hover:text-black">
            <ShoppingBag size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
          </Link>
        </div>
      </div>
      <nav className="border-t hidden lg:block">
        <ul className="flex justify-center space-x-10 text-[10px] font-bold uppercase tracking-[0.15em] py-3.5">
          <li><Link to="/" className="hover:text-gray-400 transition-colors">Home</Link></li>
          <li><Link to="/shop" className="hover:text-gray-400 transition-colors">Shop All</Link></li>
          <li><Link to="/custom-request" className="hover:text-gray-400 transition-colors">Custom Order</Link></li>
          <li><Link to="/about" className="hover:text-gray-400 transition-colors">Our Story</Link></li>
        </ul>
      </nav>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-gray-50 border-t pt-20 pb-10 mt-auto">
    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
      <div>
        <h2 className="text-xl font-serif font-bold mb-6 tracking-tight uppercase">Anvi Studio</h2>
        <p className="text-gray-500 text-xs leading-relaxed mb-6">Handpicked traditional elegance for the modern woman. Woven with love, delivered worldwide.</p>
        <div className="flex justify-center md:justify-start space-x-5 text-gray-400">
          <Facebook size={18} className="hover:text-black transition-colors cursor-pointer" /> 
          <Instagram size={18} className="hover:text-black transition-colors cursor-pointer" /> 
          <Twitter size={18} className="hover:text-black transition-colors cursor-pointer" />
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6">Explore</h4>
        <ul className="space-y-4 text-xs text-gray-500">
          <li><Link to="/shop" className="hover:text-black">New Arrivals</Link></li>
          <li><Link to="/custom-request" className="hover:text-black">Custom Design</Link></li>
          <li><Link to="/about" className="hover:text-black">Our Story</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6">Support</h4>
        <ul className="space-y-4 text-xs text-gray-500">
          <li><Link to="/privacy-policy" className="hover:text-black">Privacy Policy</Link></li>
          <li><Link to="/shipping-policy" className="hover:text-black">Shipping Policy</Link></li>
          <li><Link to="/returns" className="hover:text-black">Return & Exchange</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6">Newsletter</h4>
        <p className="text-xs text-gray-500 mb-4">Subscribe for early access to new collections.</p>
        <div className="flex border-b border-gray-200 pb-1">
          <input type="email" placeholder="email@example.com" className="bg-transparent text-xs w-full outline-none py-1" />
          <button className="text-[10px] font-bold uppercase tracking-widest ml-2">Join</button>
        </div>
      </div>
    </div>
    <div className="text-center text-[10px] text-gray-400 mt-20 uppercase tracking-widest font-bold border-t pt-8">
      &copy; {new Date().getFullYear()} Anvi Studio Boutique. All Rights Reserved.
    </div>
  </footer>
);

// ==========================================
// SECTION 4: AUTH PAGES (Login, Register, OTP)
// ==========================================

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-8 md:p-12 border bg-white shadow-2xl rounded-sm">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Please enter your details to login</p>
      </div>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 text-xs mb-6 font-bold tracking-wide border-l-4 border-red-600">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-0 top-2 text-gray-400" size={16} />
            <input 
              type="email" required className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none transition-colors"
              value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Password</label>
          <div className="relative">
            <Lock className="absolute left-0 top-2 text-gray-400" size={16} />
            <input 
              type={showPassword ? "text" : "password"} required className="w-full border-b border-gray-200 py-2 pl-7 text-sm focus:border-black outline-none transition-colors"
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            />
            <button type="button" className="absolute right-0 top-2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-8 text-center text-xs text-gray-500">
        New here? <Link to="/register" className="text-black font-bold border-b border-black ml-1">Create Account</Link>
      </p>
    </div>
  );
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', username: '', mobileNumber: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate(`/verify-otp?email=${formData.username}`);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-16 p-8 md:p-12 border bg-white shadow-2xl rounded-sm">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold mb-2 tracking-tight">Join Anvi Studio</h2>
        <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Experience the art of tradition</p>
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 text-xs mb-6 text-center font-bold tracking-wide border-l-4 border-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input placeholder="First Name" required className="border-b border-gray-200 py-2 text-sm outline-none focus:border-black" onChange={e => setFormData({...formData, firstName: e.target.value})} />
          <input placeholder="Last Name" required className="border-b border-gray-200 py-2 text-sm outline-none focus:border-black" onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
        <input placeholder="Email Address" type="email" required className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" onChange={e => setFormData({...formData, username: e.target.value})} />
        <input placeholder="Mobile Number" required className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input placeholder="Password" type="password" required className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" onChange={e => setFormData({...formData, password: e.target.value})} />
          <input placeholder="Confirm Password" type="password" required className="w-full border-b border-gray-200 py-2 text-sm outline-none focus:border-black" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg">
          {loading ? 'Processing...' : 'Register Now'} <ArrowRight size={14} />
        </button>
      </form>
      <p className="mt-8 text-center text-xs text-gray-500">Already have an account? <Link to="/login" className="text-black font-bold border-b border-black ml-1">Login</Link></p>
    </div>
  );
};

const VerifyOtpPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.get(`/verify/account?otp=${otp}&email=${email}`);
      navigate('/login');
    } catch (err) { alert("Invalid OTP"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto my-20 p-8 border bg-white shadow-2xl rounded-sm text-center">
      <ShieldCheck size={48} className="mx-auto mb-6 text-gray-800" />
      <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight">Verify Account</h2>
      <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest font-bold tracking-widest">Code sent to {email}</p>
      <form onSubmit={handleVerify} className="space-y-8">
        <input maxLength="6" placeholder="000000" className="w-full text-center text-4xl tracking-[1em] border-b-2 border-gray-200 py-2 outline-none focus:border-black" value={otp} onChange={e => setOtp(e.target.value)} />
        <button className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
          {loading ? 'Verifying...' : 'Verify & Activate'}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// SECTION 5: MASTER ROUTING (App.js)
// ==========================================

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-sans selection:bg-black selection:text-white bg-white">
          <AnnouncementBar />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <div className="animate-in fade-in duration-700">
                  <section className="relative h-[650px] bg-gray-100 flex items-center overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[2000ms] hover:scale-105" alt="Hero" />
                    <div className="container mx-auto px-4 relative z-10 text-white">
                      <h1 className="text-6xl md:text-8xl font-serif font-black mb-6 tracking-tighter drop-shadow-lg">Timeless <br/>Grace.</h1>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] mb-12 drop-shadow-md">Festive Collection 2024</p>
                      <Link to="/shop" className="bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all transform hover:-translate-y-1 inline-block">Explore Now</Link>
                    </div>
                  </section>
                </div>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/shop" element={<div className="py-24 text-center text-xl font-serif">Catalog Content...</div>} />
              <Route path="/about" element={<div className="py-24 text-center text-xl font-serif italic">Our Story...</div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}