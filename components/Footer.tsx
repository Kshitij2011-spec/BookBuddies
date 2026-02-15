import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-900 text-brand-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-accent-500 text-2xl">auto_stories</span>
              <span className="text-2xl font-bold text-white font-serif">Book<span className="text-accent-500">Buddies</span></span>
            </div>
            <p className="max-w-xs leading-relaxed text-brand-300">
              Building the world's largest community-powered library, one swap at a time.
            </p>
            <div className="flex gap-4 mt-6">
              {['facebook', 'twitter', 'instagram'].map(icon => (
                <a key={icon} href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center hover:bg-accent-500 transition-colors text-white">
                  <span className="text-xs opacity-70">{icon[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-accent-400 transition-colors">Browse Books</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">NGO Directory</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-accent-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-brand-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-brand-400">
          <p>© 2024 Book Buddies Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Made with <span className="text-red-500">♥</span> for readers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};