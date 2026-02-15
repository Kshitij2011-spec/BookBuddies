import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { ViewState, Book } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  setView: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('books')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (data) setFeaturedBooks(data);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="pb-12">
      {/* Dashboard Header / Search */}
      <section className="bg-brand-900 text-brand-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">Your Next Adventure <span className="text-accent-500 italic">Awaits</span></h2>
          <p className="text-lg text-brand-200 mb-8 max-w-2xl mx-auto">Join a community of thousands of readers swapping stories and building libraries together.</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
             <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Search by title, author, or genre..." 
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-brand-900 bg-white focus:outline-none focus:ring-4 focus:ring-accent-500/50 shadow-xl"
                  onFocus={() => setView('browse')}
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-400">search</span>
             </div>
             <Button className="w-full md:w-auto h-[58px] px-8 text-lg" onClick={() => setView('browse')}>Browse</Button>
          </div>
        </div>
      </section>
      
      {/* Action Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-accent-200 transition-colors cursor-pointer" onClick={() => setView('profile')}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">library_add</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-900">List a Book</h3>
                        <p className="text-brand-500 text-sm">Earn credits by sharing.</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-brand-300 group-hover:text-accent-500">arrow_forward</span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-accent-200 transition-colors cursor-pointer" onClick={() => setView('swaps')}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">swap_horiz</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-900">Swap Center</h3>
                        <p className="text-brand-500 text-sm">Manage requests.</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-brand-300 group-hover:text-blue-500">arrow_forward</span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-accent-200 transition-colors cursor-pointer" onClick={() => setView('profile')}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">auto_stories</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-brand-900">My Bookshelf</h3>
                        <p className="text-brand-500 text-sm">View your inventory.</p>
                    </div>
                </div>
                <span className="material-symbols-outlined text-brand-300 group-hover:text-purple-500">arrow_forward</span>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16">
        
        {/* Featured Section */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-3xl font-bold text-brand-900 font-serif">Fresh Arrivals</h3>
              <p className="text-brand-600 mt-1">Recently added treasures waiting for a home.</p>
            </div>
            <div className="flex gap-2">
                 <button className="p-2 border border-brand-200 rounded-lg hover:bg-brand-50 text-brand-500"><span className="material-symbols-outlined">chevron_left</span></button>
                 <button className="p-2 border border-brand-200 rounded-lg hover:bg-brand-50 text-brand-500"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {featuredBooks.length === 0 ? (
                <div className="col-span-4 text-center py-10 bg-brand-50 rounded-xl border border-dashed border-brand-200">
                    <p className="text-brand-500">No books listed yet. Be the first!</p>
                </div>
            ) : (
                featuredBooks.map((book) => (
                <div key={book.id} className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-brand-100">
                    <div className="relative aspect-[3/4] overflow-hidden">
                        <img src={book.cover_url || 'https://via.placeholder.com/300x450?text=No+Cover'} alt={book.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-900 shadow-sm">
                            {book.condition}
                        </div>
                    </div>
                    <div className="p-5">
                        <h4 className="font-bold text-brand-900 truncate text-lg">{book.title}</h4>
                        <p className="text-sm text-brand-500 mb-4">{book.author}</p>
                        <Button fullWidth size="sm" variant="primary" onClick={() => setView('browse')}>
                            Swap It! <span className="material-symbols-outlined text-sm ml-1">sync_alt</span>
                        </Button>
                    </div>
                </div>
                ))
            )}
          </div>
        </section>

        {/* Community Banner */}
        <section className="bg-brand-100/50 rounded-3xl p-8 md:p-12 space-y-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h3 className="text-3xl font-bold text-brand-900 mb-2">Community Forums</h3>
                    <p className="text-brand-600">Connect with readers who share your passion.</p>
                </div>
                <a href="#" className="text-accent-600 font-bold flex items-center gap-2 hover:underline">View All Discussions <span className="material-symbols-outlined">trending_flat</span></a>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl flex items-start gap-4 shadow-sm border border-brand-100">
                 <div className="bg-amber-100 text-amber-600 p-3 rounded-xl shrink-0">
                    <span className="material-symbols-outlined text-3xl">history_edu</span>
                 </div>
                 <div className="space-y-2 flex-1">
                     <div className="flex justify-between items-center">
                        <h4 className="font-bold text-brand-900 text-lg">Classic Literature Club</h4>
                        <span className="text-xs bg-brand-50 px-2 py-1 rounded text-brand-500">1.2k Active</span>
                     </div>
                     <p className="text-sm text-brand-500 line-clamp-2">Currently discussing "Jane Eyre". Join our weekly deep-dive and tea-time discussion.</p>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl flex items-start gap-4 shadow-sm border border-brand-100">
                 <div className="bg-accent-100 text-accent-600 p-3 rounded-xl shrink-0">
                    <span className="material-symbols-outlined text-3xl">emoji_events</span>
                 </div>
                 <div className="space-y-2 flex-1">
                     <div className="flex justify-between items-center">
                        <h4 className="font-bold text-brand-900 text-lg">Reading Challenge</h4>
                        <span className="text-xs bg-accent-500 text-white px-2 py-1 rounded">842 Joined</span>
                     </div>
                     <p className="text-sm text-brand-500 line-clamp-2">Challenge for October: Read 3 books by international authors. Earn badges and swap credits!</p>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
};