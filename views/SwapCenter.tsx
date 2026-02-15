import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';
import { Swap, User, Book } from '../types';

interface SwapCenterProps {
    user: User | null;
}

export const SwapCenter: React.FC<SwapCenterProps> = ({ user }) => {
  const [incoming, setIncoming] = useState<Swap[]>([]);
  const [outgoing, setOutgoing] = useState<Swap[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  useEffect(() => {
    const fetchData = async () => {
        if (!user) return;

        // Fetch Incoming Requests (I am the owner)
        const { data: inc } = await supabase
            .from('swaps')
            .select('*, book:books(*), requester:profiles!requester_id(*)')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });
        
        if (inc) setIncoming(inc as any);

        // Fetch Outgoing Requests (I am the requester)
        const { data: out } = await supabase
            .from('swaps')
            .select('*, book:books(*), owner:profiles!owner_id(*)')
            .eq('requester_id', user.id)
            .order('created_at', { ascending: false });

        if (out) setOutgoing(out as any);
    };
    fetchData();
  }, [user]);

  const handleAction = async (swapId: string, action: 'approved' | 'rejected') => {
      // 1. Update the swap status
      const { error } = await supabase
        .from('swaps')
        .update({ status: action })
        .eq('id', swapId);
      
      if (!error) {
          // 2. If approved, transfer ownership of the book and mark as swapped
          if (action === 'approved') {
             const swap = incoming.find(s => s.id === swapId);
             if (swap) {
                 await supabase.from('books').update({ 
                     owner_id: swap.requester_id,
                     status: 'swapped' 
                 }).eq('id', swap.book_id);
             }
          }

          // 3. Optimistic UI update
          setIncoming(incoming.map(s => s.id === swapId ? {...s, status: action} : s));
      } else {
          alert("Error updating swap: " + error.message);
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-brand-900 font-serif mb-8">Swap Center</h2>
      
      <div className="flex border-b border-brand-200 mb-8">
        <button 
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'incoming' ? 'border-b-2 border-accent-500 text-accent-600' : 'text-brand-500 hover:text-brand-800'}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming Requests ({incoming.filter(s => s.status === 'pending').length})
        </button>
        <button 
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'outgoing' ? 'border-b-2 border-accent-500 text-accent-600' : 'text-brand-500 hover:text-brand-800'}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Outgoing Requests
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'incoming' ? (
            incoming.length === 0 ? <p className="text-brand-500 text-center py-8">No requests received yet.</p> :
            incoming.map(swap => (
                <div key={swap.id} className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                    <img src={swap.book?.cover_url} className="w-16 h-24 object-cover rounded shadow-sm" />
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-brand-900">{swap.requester?.name} wants "{swap.book?.title}"</p>
                        <p className="text-sm text-brand-500">Requested on {new Date(swap.created_at).toLocaleDateString()}</p>
                    </div>
                    {swap.status === 'pending' ? (
                        <div className="flex gap-2">
                             <Button size="sm" onClick={() => handleAction(swap.id, 'approved')}>Accept</Button>
                             <Button size="sm" variant="outline" onClick={() => handleAction(swap.id, 'rejected')}>Decline</Button>
                        </div>
                    ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${swap.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {swap.status}
                        </span>
                    )}
                </div>
            ))
        ) : (
            outgoing.length === 0 ? <p className="text-brand-500 text-center py-8">You haven't requested any books yet.</p> :
            outgoing.map(swap => (
                <div key={swap.id} className="bg-white p-6 rounded-xl border border-brand-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                    <img src={swap.book?.cover_url} className="w-16 h-24 object-cover rounded shadow-sm" />
                    <div className="flex-1 text-center sm:text-left">
                        <p className="font-bold text-brand-900">You requested "{swap.book?.title}"</p>
                        <p className="text-sm text-brand-500">Owner: {swap.owner?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        swap.status === 'approved' ? 'bg-green-100 text-green-700' : 
                        swap.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-brand-100 text-brand-600'
                    }`}>
                        {swap.status}
                    </span>
                </div>
            ))
        )}
      </div>
    </div>
  );
};