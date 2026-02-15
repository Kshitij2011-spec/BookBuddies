import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Book, User } from '../types';
import { supabase } from '../lib/supabase';

interface BrowseProps {
  user: User | null;
}

export const Browse: React.FC<BrowseProps> = ({ user }) => {
  const [activeCategory, setActiveCategory] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [myRequestedBookIds, setMyRequestedBookIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Get existing requests for the user
    const getRequests = async () => {
        if (user) {
            // Fetch books I have already requested
            const { data: requests } = await supabase
                .from('swaps')
                .select('book_id')
                .eq('requester_id', user.id)
                .neq('status', 'rejected'); 
            
            if (requests) {
                setMyRequestedBookIds(new Set(requests.map(r => r.book_id)));
            }
        }
    };
    getRequests();
  }, [user]);

  useEffect(() => {
    const fetchBooks = async () => {
      let query = supabase
        .from('books')
        .select('*')
        .eq('status', 'available');

      // CRITICAL: Filter out books owned by the current user
      if (user) {
          query = query.neq('owner_id', user.id);
      }

      if (activeCategory.length > 0) {
        query = query.in('genre', activeCategory);
      }
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data } = await query;
      if (data) setBooks(data);
    };

    fetchBooks();
  }, [activeCategory, searchTerm, user]);

  const handleRequestSwap = async (bookId: string, ownerId: string) => {
    if (!user) return alert("Please log in to swap.");
    
    // Create real swap request in DB
    const { error } = await supabase
        .from('swaps')
        .insert({
            book_id: bookId,
            requester_id: user.id,
            owner_id: ownerId,
            status: 'pending'
        });

    if (error) {
        alert("Error requesting swap: " + error.message);
    } else {
        setMyRequestedBookIds(prev => new Set(prev).add(bookId));
        alert("Request sent! Check the Swap Center for updates.");
    }
  };

  const toggleCategory = (cat: string) => {
      if (activeCategory.includes(cat)) {
          setActiveCategory(activeCategory.filter(c => c !== cat));
      } else {
          setActiveCategory([...activeCategory, cat]);
      }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-8 flex gap-8">
      {/* Sidebar Filters */}
      <aside className="w-64 shrink-0 hidden lg:block sticky top-28 h-fit">
        <div className="space-y-8">
            <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent-500 mb-4">Filters</h3>
                <p className="text-xs text-brand-500 mb-6">Refine your book hunt</p>
            </div>
            
            {/* Categories */}
            <div className="space-y-4">
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-brand-400">category</span>
                        <span className="text-sm font-semibold text-brand-900">Categories</span>
                    </div>
                </div>
                <div className="pl-9 space-y-2">
                    {['Fiction', 'Non-Fiction', 'Academic', 'Sci-Fi', 'Mystery'].map(cat => (
                         <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                className="rounded border-brand-300 text-accent-500 focus:ring-accent-500 w-4 h-4" 
                                checked={activeCategory.includes(cat)}
                                onChange={() => toggleCategory(cat)}
                            />
                            <span className="text-sm text-brand-700 group-hover:text-accent-600">{cat}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Condition (Mocked for UI) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-brand-400">verified</span>
                        <span className="text-sm font-semibold text-brand-900">Condition</span>
                    </div>
                </div>
                <div className="pl-9 space-y-2">
                     {['New', 'Used'].map(c => (
                        <label key={c} className="flex items-center gap-3 cursor-pointer group">
                             <input type="radio" name="condition" className="rounded-full border-brand-300 text-accent-500 focus:ring-accent-500 w-4 h-4" />
                             <span className="text-sm text-brand-700 group-hover:text-accent-600">{c}</span>
                        </label>
                     ))}
                </div>
            </div>

             <div className="pt-6">
                <button 
                    onClick={() => { setActiveCategory([]); setSearchTerm(''); }}
                    className="w-full py-2.5 px-4 bg-brand-100 text-brand-600 font-bold rounded-lg text-sm hover:bg-brand-200 transition-all"
                >
                    Reset Filters
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1">
        {/* Search Bar */}
        <div className="mb-8 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-brand-400 group-focus-within:text-accent-500 transition-colors">search</span>
            </div>
            <input 
                type="text" 
                className="block w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-accent-500/40 text-base placeholder:text-brand-400 transition-all" 
                placeholder="Search by title, author, or ISBN..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Mobile Filters */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide lg:hidden">
            {['Fiction', 'Non-Fiction', 'Academic', 'Sci-Fi'].map(cat => (
                <button 
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeCategory.includes(cat) ? 'bg-accent-500 text-white' : 'bg-white text-brand-700'}`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-brand-900">Recommended for you</h2>
            <div className="text-sm text-brand-500">
                Showing {books.length} results
            </div>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
             {books.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-brand-300 mb-2">library_books</span>
                    <p className="text-brand-500">No books found matching your criteria.</p>
                </div>
             ) : (
                books.map((book) => {
                    const isRequested = myRequestedBookIds.has(book.id);
                    return (
                        <div key={book.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group border border-brand-100">
                            <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
                                <div className="absolute top-3 left-3 z-10">
                                    <span className="px-2.5 py-1 bg-green-500/90 text-white text-[10px] font-bold uppercase rounded-full backdrop-blur-sm shadow-sm">
                                        {book.condition}
                                    </span>
                                </div>
                                <img 
                                    src={book.cover_url || 'https://via.placeholder.com/300x450'} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    alt={book.title}
                                />
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-accent-500 uppercase mb-1">{book.genre}</p>
                                    <h3 className="font-bold text-brand-900 text-lg leading-tight mb-1 truncate">{book.title}</h3>
                                    <p className="text-sm text-brand-500">{book.author}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-brand-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-1 text-brand-500">
                                        <span className="material-symbols-outlined text-base text-yellow-500">star</span>
                                        <span className="text-xs font-medium">4.8</span>
                                    </div>
                                    {isRequested ? (
                                        <button className="px-6 py-2 bg-brand-100 text-brand-400 rounded-lg text-sm font-bold cursor-not-allowed flex items-center gap-2">
                                            Requested <span className="material-symbols-outlined text-sm">schedule</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleRequestSwap(book.id, book.owner_id)}
                                            className="px-6 py-2 bg-accent-500 text-white rounded-lg text-sm font-bold hover:bg-accent-600 transition-all flex items-center gap-2 shadow-md shadow-accent-500/20"
                                        >
                                            Swap <span className="material-symbols-outlined text-sm">sync_alt</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
             )}
        </div>
      </section>
    </div>
  );
};