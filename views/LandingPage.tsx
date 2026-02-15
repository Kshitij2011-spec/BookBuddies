import React, { useState } from 'react';
import { Button } from '../components/Button';
import { ViewState } from '../types';
import { supabase } from '../lib/supabase';

interface LandingPageProps {
  setView: (view: ViewState) => void;
  onDemoLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setView, onDemoLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isNGO, setIsNGO] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName,
              role: isNGO ? 'ngo' : 'reader'
            }
          }
        });
        if (error) throw error;
        alert("Registration successful! You can now log in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('rate limit')) {
        setError('Too many attempts. Please use the "Enter Demo Mode" button below to test immediately.');
      } else if (err.message && err.message.includes('Invalid login credentials')) {
        // Helpful message for your specific case (manual DB insert)
        setError('Invalid credentials. If you manually added your user to the database, it won\'t work. Please Sign Up through this form instead.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-6">
                <span className="material-symbols-outlined text-sm">public</span>
                <span>Connecting Readers Worldwide</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-900 leading-[1.15] mb-6">
                Share Stories. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-brand-600">
                  Spark Change.
                </span>
              </h1>
              <p className="text-lg text-brand-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Book Buddies isn't just a swapping platform. It's a movement to declutter your shelves and populate libraries in underserved communities.
              </p>
              
              <div className="flex gap-8 text-brand-500 justify-center lg:justify-start">
                <div>
                  <p className="text-2xl font-bold text-brand-900">12k+</p>
                  <p className="text-sm">Books Swapped</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-900">850</p>
                  <p className="text-sm">NGO Donations</p>
                </div>
              </div>
            </div>

            {/* Auth Form Card */}
            <div className="relative w-full max-w-md mx-auto order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-xl border border-brand-100 p-8">
                <h2 className="text-2xl font-bold text-brand-900 mb-2">
                  {isLogin ? 'Welcome Back' : 'Join the Community'}
                </h2>
                <p className="text-brand-500 mb-6 text-sm">
                  {isLogin ? 'Enter your details to access your bookshelf.' : 'Start your reading journey today.'}
                </p>

                {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm mb-4 font-medium">{error}</div>}

                <form onSubmit={handleAuth} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-brand-700 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          className="w-full px-4 py-2 rounded-lg border border-brand-200 bg-white text-brand-900 focus:ring-2 focus:ring-accent-500 outline-none"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2 p-3 bg-brand-50 rounded-lg cursor-pointer" onClick={() => setIsNGO(!isNGO)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isNGO ? 'bg-accent-500 border-accent-500' : 'bg-white border-brand-300'}`}>
                           {isNGO && <span className="material-symbols-outlined text-white text-sm">check</span>}
                        </div>
                        <span className="text-brand-900 font-medium text-sm">I am representing an NGO</span>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      required 
                      className="w-full px-4 py-2 rounded-lg border border-brand-200 bg-white text-brand-900 focus:ring-2 focus:ring-accent-500 outline-none"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      required 
                      className="w-full px-4 py-2 rounded-lg border border-brand-200 bg-white text-brand-900 focus:ring-2 focus:ring-accent-500 outline-none"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>

                  <Button fullWidth type="submit" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-brand-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-brand-400">Or testing?</span>
                    </div>
                </div>

                {onDemoLogin && (
                    <Button 
                        fullWidth 
                        variant="outline" 
                        onClick={onDemoLogin}
                        className="mb-4 border-dashed border-accent-400 text-accent-600 hover:bg-accent-50 hover:border-accent-500"
                    >
                        Enter Demo Mode (Skip Login)
                    </Button>
                )}

                <div className="mt-2 text-center text-sm">
                  <span className="text-brand-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button 
                    className="font-bold text-accent-600 hover:text-accent-700"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-brand-900 mb-4">How it Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: 'list_alt', 
                title: '1. List Books', 
                desc: 'Upload books you are done with. Choose to Swap or Donate.',
                color: 'bg-blue-50 text-blue-600'
              },
              { 
                icon: 'swap_horiz', 
                title: '2. Swap or Donate', 
                desc: 'Earn credits by listing. Use credits to request books from others.',
                color: 'bg-accent-50 text-accent-600'
              },
              { 
                icon: 'menu_book', 
                title: '3. Read & Repeat', 
                desc: 'Receive your new book. Read it, love it, then swap it again.',
                color: 'bg-green-50 text-green-600'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-brand-50 rounded-2xl p-8 hover:-translate-y-1 transition-transform border border-brand-100 text-center">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                  <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-brand-900 mb-3">{feature.title}</h3>
                <p className="text-brand-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};