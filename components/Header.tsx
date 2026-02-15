import React from 'react';
import { ViewState, User } from '../types';
import { Button } from './Button';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, user }) => {
  const isLanding = currentView === 'landing';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
  };

  const handleLogoClick = () => {
      if (!user) {
          setView('landing');
      } else if (user.role === 'ngo') {
          setView('ngo');
      } else {
          setView('dashboard');
      }
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isLanding ? 'bg-brand-50/80 backdrop-blur-md border-b border-transparent' : 'bg-white border-b border-brand-200 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={handleLogoClick}
          >
            <div className="bg-accent-500 text-white p-1.5 rounded-lg group-hover:rotate-3 transition-transform">
              <span className="material-symbols-outlined text-2xl">auto_stories</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-brand-900 font-serif tracking-tight">
              Book<span className="text-accent-500">Buddies</span>
            </span>
          </div>

          {/* Navigation - Desktop */}
          {user && !isLanding && (
            <nav className="hidden md:flex items-center gap-1">
              {user.role === 'reader' && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setView('dashboard')} className={currentView === 'dashboard' ? 'bg-brand-100 text-brand-900' : ''}>
                        Home
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setView('browse')} className={currentView === 'browse' ? 'bg-brand-100 text-brand-900' : ''}>
                        Browse
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setView('swaps')} className={currentView === 'swaps' ? 'bg-brand-100 text-brand-900' : ''}>
                        Swap Center
                    </Button>
                  </>
              )}
              {user.role === 'ngo' && (
                <Button variant="ghost" size="sm" onClick={() => setView('ngo')} className={currentView === 'ngo' ? 'bg-brand-100 text-brand-900' : ''}>
                  NGO Portal
                </Button>
              )}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isLanding || !user ? (
              <>
                <Button variant="ghost" onClick={() => setView('landing')}>Sign In</Button>
              </>
            ) : (
              <>
                 <div className="hidden sm:flex items-center gap-1 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                    <span className="material-symbols-outlined text-accent-500 text-sm">token</span>
                    <span className="text-sm font-semibold text-brand-800">{user.credits} Credits</span>
                 </div>
                 
                 <div className="relative group flex items-center gap-2">
                    {user.role === 'reader' && (
                        <button 
                        onClick={() => setView('profile')}
                        className="flex items-center gap-2 focus:outline-none"
                        >
                        <img 
                            src={user.avatar_url} 
                            alt={user.name} 
                            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-brand-100 group-hover:ring-accent-500 transition-all"
                        />
                        </button>
                    )}
                    {user.role === 'ngo' && (
                         <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm text-blue-700 font-bold">
                             {user.name.charAt(0)}
                         </div>
                    )}
                    <button onClick={handleLogout} className="text-brand-400 hover:text-brand-800">
                      <span className="material-symbols-outlined">logout</span>
                    </button>
                 </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};