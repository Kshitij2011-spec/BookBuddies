import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './views/LandingPage';
import { Dashboard } from './views/Dashboard';
import { Browse } from './views/Browse';
import { Profile } from './views/Profile';
import { NGOPortal } from './views/NGOPortal';
import { SwapCenter } from './views/SwapCenter';
import { ViewState, User, DEMO_USER_ID } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. Get Session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
         fetchProfile(session.user.id);
      }
    };

    getSession();

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
      setUser(data);
      // Logic to redirect based on Role if landing
      if (currentView === 'landing') {
          if (data.role === 'ngo') {
              setCurrentView('ngo');
          } else {
              setCurrentView('dashboard');
          }
      }
    }
  };

  const handleDemoLogin = async () => {
    // Attempt real login with the password set via SQL
    const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'password123' 
    });

    if (error) {
        alert("Could not log in as Demo User. Please run the SQL script to set the password to 'password123'. Error: " + error.message);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage setView={setCurrentView} onDemoLogin={handleDemoLogin} />;
      case 'dashboard':
        return <Dashboard setView={setCurrentView} />;
      case 'browse':
        return <Browse user={user} />;
      case 'profile':
        return user ? <Profile user={user} /> : <LandingPage setView={setCurrentView} onDemoLogin={handleDemoLogin} />;
      case 'ngo':
        return <NGOPortal user={user} />;
      case 'swaps':
        return <SwapCenter user={user} />;
      default:
        return <LandingPage setView={setCurrentView} onDemoLogin={handleDemoLogin} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-50 text-brand-900 font-sans selection:bg-accent-200 selection:text-brand-900">
      <Header currentView={currentView} setView={setCurrentView} user={user} />
      
      <main className="flex-grow">
        {renderView()}
      </main>
      
      <Footer />
    </div>
  );
};

export default App;