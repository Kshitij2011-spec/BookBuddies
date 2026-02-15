import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { Book, User } from '../types';

interface NGOPortalProps {
    user: User | null;
}

export const NGOPortal: React.FC<NGOPortalProps> = ({ user }) => {
  const [donationPool, setDonationPool] = useState<Book[]>([]);
  const [claimedHistory, setClaimedHistory] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  useEffect(() => {
    const fetchDonations = async () => {
        // Fetch Available
        const { data: available } = await supabase.from('books').select('*').eq('status', 'donating');
        if (available) setDonationPool(available);

        // Fetch History (Simplified: showing all donated books for demo)
        const { data: history } = await supabase.from('books').select('*').eq('status', 'donated');
        if (history) setClaimedHistory(history);
    };
    fetchDonations();
  }, []);

  const handleClaim = async (bookId: string) => {
      if (!user || user.role !== 'ngo') return alert("Unauthorized");
      
      const { error } = await supabase
        .from('books')
        .update({ status: 'donated' })
        .eq('id', bookId);

      if (!error) {
          const book = donationPool.find(b => b.id === bookId);
          if (book) {
              setDonationPool(prev => prev.filter(b => b.id !== bookId));
              setClaimedHistory(prev => [{...book, status: 'donated'}, ...prev]);
          }
          alert("Book claimed successfully!");
      } else {
          alert("Error claiming book: " + error.message);
      }
  };

  if (!user || user.role !== 'ngo') {
      return (
          <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center p-8 bg-brand-100 rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-brand-400 mb-2">lock</span>
                  <h2 className="text-xl font-bold text-brand-900">Restricted Area</h2>
                  <p className="text-brand-600">This portal is for verified NGO partners only.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="pb-12 bg-white min-h-screen">
       <div className="bg-blue-900 text-white py-12 px-4">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
             <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-accent-400">verified_user</span>
                <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">Verified Partner Portal</span>
             </div>
             <h1 className="text-3xl font-bold font-serif">Global Literacy Initiative</h1>
             <p className="text-blue-200 mt-2">Welcome back, {user.name}</p>
           </div>
           <div className="bg-blue-800 p-4 rounded-xl border border-blue-700 flex gap-6">
              <div className="text-center">
                 <p className="text-2xl font-bold">{donationPool.length}</p>
                 <p className="text-xs text-blue-300">Active Requests</p>
              </div>
              <div className="text-center border-l border-blue-700 pl-6">
                 <p className="text-2xl font-bold">{claimedHistory.length}</p>
                 <p className="text-xs text-blue-300">Total Claimed</p>
              </div>
           </div>
         </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
         <div className="bg-white rounded-xl shadow-xl border border-brand-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-brand-200 bg-brand-50/50">
                  <button 
                      onClick={() => setActiveTab('available')}
                      className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'available' ? 'bg-white text-blue-900 border-t-2 border-blue-500' : 'text-brand-500 hover:text-brand-700 hover:bg-brand-50'}`}
                  >
                      Available Donations ({donationPool.length})
                  </button>
                  <button 
                      onClick={() => setActiveTab('history')}
                      className={`flex-1 py-4 text-center font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'history' ? 'bg-white text-blue-900 border-t-2 border-blue-500' : 'text-brand-500 hover:text-brand-700 hover:bg-brand-50'}`}
                  >
                      Claimed History
                  </button>
              </div>

              <div className="p-6">
                {activeTab === 'available' ? (
                    <div className="space-y-4">
                        {donationPool.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-4xl text-brand-300 mb-2">inbox</span>
                                <p className="text-brand-500">No books currently available for donation.</p>
                            </div>
                        ) : (
                            donationPool.map((book) => (
                            <div key={book.id} className="border border-brand-100 rounded-lg p-5 hover:border-blue-300 transition-colors flex flex-col sm:flex-row gap-4">
                                <div className="w-16 h-20 bg-brand-100 rounded-lg overflow-hidden shrink-0">
                                    <img src={book.cover_url} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <h4 className="font-bold text-brand-900">{book.title}</h4>
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Available</span>
                                </div>
                                <p className="text-sm text-brand-500 mb-3">{book.author} • {book.genre} • {book.condition}</p>
                                </div>
                                <div className="flex flex-col justify-center gap-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-blue-900/10" onClick={() => handleClaim(book.id)}>Claim Book</Button>
                                </div>
                            </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claimedHistory.length === 0 ? (
                             <div className="text-center py-12">
                                <span className="material-symbols-outlined text-4xl text-brand-300 mb-2">history</span>
                                <p className="text-brand-500">No history available yet.</p>
                            </div>
                        ) : (
                            claimedHistory.map((book) => (
                            <div key={book.id} className="border border-brand-100 rounded-lg p-5 bg-brand-50/30 flex flex-col sm:flex-row gap-4 opacity-75 hover:opacity-100 transition-opacity">
                                <div className="w-16 h-20 bg-brand-100 rounded-lg overflow-hidden shrink-0 grayscale">
                                    <img src={book.cover_url} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <h4 className="font-bold text-brand-900">{book.title}</h4>
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Claimed</span>
                                    </div>
                                    <p className="text-sm text-brand-500">{book.author}</p>
                                </div>
                            </div>
                            ))
                        )}
                    </div>
                )}
              </div>
         </div>
       </div>
    </div>
  );
};