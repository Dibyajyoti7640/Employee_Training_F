import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [animateTitle, setAnimateTitle] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setAnimateTitle(true);
    }, 300);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = await login({ email, password });
      console.log(success);
      
      if (success.success == true) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div 
        className={`mb-10 text-center transform transition-all duration-1000 ${animateTitle ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}
      >
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <User size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          Employee Training & Development
        </h1>
        <div className="h-1.5 w-32 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-3 rounded-full"></div>
      </div>

      <div className="w-full max-w-md px-6 py-2 relative">
        <div className="absolute -top-20 -left-20 w-32 h-32 bg-blue-100 rounded-full opacity-60 animate-float"></div>
        <div className="absolute top-60 -right-16 w-28 h-28 bg-purple-100 rounded-full opacity-50 animate-float-delayed"></div>
        <div className="absolute -bottom-16 left-32 w-36 h-36 bg-indigo-100 rounded-full opacity-40 animate-float-slow"></div>
        
        <div 
          className="bg-white backdrop-filter backdrop-blur-sm bg-opacity-95 rounded-xl shadow-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl border border-gray-100"
          style={{
            animation: "fadeIn 0.8s ease-out",
          }}
        >
          <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 px-8 py-6 border-b border-gray-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-80"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            
            <div className="relative">
              <h2 
                className="text-3xl font-bold text-center text-gray-800"
                style={{
                  animation: "slideDown 0.5s ease-out forwards",
                }}
              >
                Welcome Back
              </h2>
              <p className="text-center text-gray-600 mt-2 text-base">Please sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div 
                className="bg-red-50 text-red-600 p-4 rounded-md text-sm border-l-4 border-red-500"
                style={{
                  animation: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both, pulseRedFade 3s infinite",
                }}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <div 
              className="relative group"
              style={{
                animation: "slideUp 0.5s ease-out 0.1s both",
              }}
            >
              <label className="text-base font-medium text-gray-700 mb-2 block transform -translate-y-0 opacity-100 transition-all duration-300 group-focus-within:text-indigo-600">
                Email Address
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 transition-colors duration-300 group-hover:text-indigo-500" style={{top: '32px'}}>
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="pl-12 w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all duration-300 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="h-0.5 w-0 bg-indigo-500 group-hover:w-full transition-all duration-300 mt-1"></div>
            </div>

            <div 
              className="relative group"
              style={{
                animation: "slideUp 0.5s ease-out 0.2s both",
              }}
            >
              <label className="text-base font-medium text-gray-700 mb-2 block transform -translate-y-0 opacity-100 transition-all duration-300 group-focus-within:text-indigo-600">
                Password
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 transition-colors duration-300 group-hover:text-indigo-500" style={{top: '32px'}}>
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-12 w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all duration-300 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-indigo-600 transition-colors" 
                style={{top: '32px'}}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? 
                  <EyeOff size={20} className="animate-pulse-subtle" /> : 
                  <Eye size={20} className="animate-pulse-subtle" />}
              </button>
              <div className="h-0.5 w-0 bg-indigo-500 group-hover:w-full transition-all duration-300 mt-1"></div>
            </div>

            <div 
              style={{
                animation: "slideUp 0.5s ease-out 0.4s both",
                marginTop: "32px"
              }}
            >
              <button 
                type="submit" 
                className="relative w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-medium rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-500 overflow-hidden group disabled:opacity-70"
                disabled={isLoading}
              >
                <span 
                  className={`flex justify-center items-center ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                >
                  <span>Sign In</span>
                  <ArrowRight size={22} className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                {isLoading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              </button>
            </div>
          </form>
        </div>
        
        <div className="text-center text-gray-500 text-sm mt-6 opacity-70">
          Employee Training & Development System v1.0
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        
        @keyframes pulseRedFade {
          0% { border-color: rgba(239, 68, 68, 0.7); box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.4); }
          50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 0 5px rgba(248, 113, 113, 0); }
          100% { border-color: rgba(239, 68, 68, 0.7); box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        @keyframes float-delayed {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        @keyframes pulse-subtle {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 9s ease-in-out 1s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out 2s infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
          background-size: 25px 25px;
        }
      `}</style>
    </div>
  );
};

export default Login;