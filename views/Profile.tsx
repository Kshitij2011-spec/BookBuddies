import React, { useEffect, useState } from 'react';
import { User, Book } from '../types';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [swappedAwayBooks, setSwappedAwayBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'donating' | 'swapped'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Upload State
  const [newBook, setNewBook] = useState({
      title: '', author: '', genre: 'Fiction', condition: 'Good', cover_url: '', action: 'swap'
  });

  const fetchData = async () => {
    // 1. Fetch current inventory (Books I own)
    const { data: owned } = await supabase
        .from('books')
        .select('*')
        .eq('owner_id', user.id);
    if (owned) setMyBooks(owned);

    // 2. Fetch history (Books I gave away via swap)
    const { data: history } = await supabase
        .from('swaps')
        .select('book:books(*)')
        .eq('owner_id', user.id)
        .eq('status', 'approved');
    
    if (history) {
        // Map and filter out any nulls
        const books = history.map((h: any) => h.book).filter(Boolean);
        setSwappedAwayBooks(books);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleDelete = async (bookId: string) => {
      if(!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
      
      const { error } = await supabase.from('books').delete().eq('id', bookId);
      if(!error) {
          setMyBooks(prev => prev.filter(b => b.id !== bookId));
          alert("Listing deleted successfully.");
      } else {
          alert("Error deleting: " + error.message);
      }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath);

      setNewBook({ ...newBook, cover_url: data.publicUrl });
    } catch (error: any) {
      console.error(error);
      alert('Upload failed. Ensure a storage bucket named "book-covers" exists. Fallback: using URL input.');
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      const status = newBook.action === 'donate' ? 'donating' : 'available';
      const finalCoverUrl = newBook.cover_url || 'https://via.placeholder.com/300x450';

      const { error } = await supabase.from('books').insert({
          title: newBook.title,
          author: newBook.author,
          genre: newBook.genre,
          condition: newBook.condition,
          cover_url: finalCoverUrl,
          owner_id: user.id,
          status: status
      });

      if (error) {
          alert("Error uploading: " + error.message);
      } else {
          const creditAmount = newBook.action === 'donate' ? 100 : 50;
          await supabase.from('profiles').update({ credits: user.credits + creditAmount}).eq('id', user.id);
          setIsUploadModalOpen(false);
          setNewBook({ title: '', author: '', genre: 'Fiction', condition: 'Good', cover_url: '', action: 'swap' });
          setPreviewUrl('');
          fetchData();
          alert(`Book listed! You earned ${creditAmount} credits.`);
      }
  };

  const getFilteredBooks = () => {
      if (activeTab === 'all') return myBooks;
      if (activeTab === 'available') return myBooks.filter(b => b.status === 'available');
      if (activeTab === 'donating') return myBooks.filter(b => b.status === 'donating' || b.status === 'donated');
      if (activeTab === 'swapped') {
          // Combine "Received Swaps" (owned books with status=swapped) 
          // AND "Given Swaps" (historical swaps where I was owner)
          const received = myBooks.filter(b => b.status === 'swapped');
          return [...received, ...swappedAwayBooks];
      }
      return myBooks;
  };

  const filteredBooks = getFilteredBooks();

  const stats = {
      donated: myBooks.filter(b => b.status === 'donated' || b.status === 'donating').length,
      swapped: swappedAwayBooks.length + myBooks.filter(b => b.status === 'swapped').length
  };

  return (
    <div className="flex flex-1 justify-center py-8 px-4 md:px-20 min-h-screen bg-brand-50">
      <div className="flex flex-col max-w-[1200px] flex-1 gap-8">
        {/* Profile Hero Section */}
        <div className="bg-white rounded-xl p-6 md:p-8 border border-brand-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 md:size-32 border-4 border-white shadow-md bg-brand-100" 
                  style={{ backgroundImage: `url(${user.avatar_url})` }}
                />
                <div className="absolute bottom-1 right-1 bg-accent-500 text-white p-1.5 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">verified</span>
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-brand-900 text-2xl md:text-3xl font-bold tracking-tight">{user.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-50 text-accent-600 text-sm font-semibold">
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                    {user.role === 'ngo' ? 'NGO Partner' : 'Avid Reader'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">
                    <span className="material-symbols-outlined text-sm">toll</span>
                    {user.credits} Credits
                  </span>
                </div>
              </div>
            </div>
            <div className="flex w-full md:w-auto gap-3">
              <button className="flex-1 md:flex-none px-6 h-11 bg-brand-50 hover:bg-brand-100 text-brand-900 font-bold rounded-lg transition-colors border border-brand-200">
                Edit Profile
              </button>
              <button className="flex-1 md:flex-none px-6 h-11 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-lg shadow-lg shadow-accent-500/20 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">share</span>
                Share Shelf
              </button>
            </div>
          </div>
          
          {/* Impact Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-brand-200">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-50 border border-brand-200">
              <div className="size-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
              </div>
              <div>
                <p className="text-brand-900 text-2xl font-bold leading-tight">{stats.donated}</p>
                <p className="text-brand-500 text-sm font-medium">Books Donated / Listing</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-50 border border-brand-200">
              <div className="size-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">sync_alt</span>
              </div>
              <div>
                <p className="text-brand-900 text-2xl font-bold leading-tight">{stats.swapped}</p>
                <p className="text-brand-500 text-sm font-medium">Successful Swaps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookshelf Grid Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-brand-900 text-2xl font-bold tracking-tight font-serif">My Bookshelf</h2>
            <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-accent-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-accent-600 transition-colors shadow-md"
            >
                <span className="material-symbols-outlined">add</span>
                Add New Book
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-brand-200 px-2 gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {[
                { id: 'all', label: `All Books` },
                { id: 'available', label: 'Available' },
                { id: 'donating', label: 'Donating' },
                { id: 'swapped', label: 'Swapped' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center pb-3 font-bold text-sm tracking-wide border-b-2 transition-colors ${
                        activeTab === tab.id 
                        ? 'border-accent-500 text-accent-600' 
                        : 'border-transparent text-brand-400 hover:text-brand-600'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
          </div>

          {/* Book Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredBooks.map((book) => {
                const isSwappedAway = swappedAwayBooks.some(b => b.id === book.id);
                const isReceived = book.status === 'swapped' && book.owner_id === user.id;
                // Only allow deletion if the book is 'available' or 'donating' (active listings)
                const canDelete = book.status === 'available' || book.status === 'donating';

                return (
                <div key={book.id} className="group relative flex flex-col gap-3">
                    <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow bg-brand-100">
                        {book.cover_url ? (
                             <img src={book.cover_url} className="w-full h-full object-cover" alt={book.title} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brand-200 text-brand-400">
                                <span className="material-symbols-outlined text-4xl">book</span>
                            </div>
                        )}
                        
                        {/* Status Badge */}
                        <span className={`absolute top-2 right-2 px-2 py-1 text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm ${
                            book.status === 'available' ? 'bg-green-500' :
                            book.status === 'donating' ? 'bg-blue-500' :
                            book.status === 'donated' ? 'bg-blue-800' :
                            (isSwappedAway || isReceived) ? 'bg-purple-500' : 'bg-gray-500'
                        }`}>
                            {isSwappedAway ? 'Sent' : isReceived ? 'Received' : book.status}
                        </span>

                        {/* Edit/Delete Overlay */}
                        {!isSwappedAway && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="size-10 rounded-full bg-white text-brand-900 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                                {canDelete && (
                                    <button 
                                        onClick={() => handleDelete(book.id)}
                                        className="size-10 rounded-full bg-white text-red-500 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                        title="Delete Listing"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-brand-900 truncate">{book.title}</h3>
                        <p className="text-xs text-brand-500 font-medium truncate">{book.author}</p>
                    </div>
                </div>
            )})}

            {/* Empty/Add New State Card */}
            {activeTab === 'all' && (
                <div 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="relative aspect-[2/3] w-full rounded-lg border-2 border-dashed border-brand-300 flex flex-col items-center justify-center gap-2 hover:border-accent-400 hover:bg-accent-50 cursor-pointer transition-colors group"
                >
                    <span className="material-symbols-outlined text-4xl text-brand-300 group-hover:text-accent-500">library_add</span>
                    <p className="text-xs font-bold text-brand-400 group-hover:text-accent-600">Add Book</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold text-brand-900 mb-4 font-serif">List a Book</h2>
                  <form onSubmit={handleUpload} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-brand-700 mb-1">Book Title</label>
                          <input required type="text" className="w-full p-2 border border-brand-200 rounded-lg bg-white text-brand-900 focus:ring-2 focus:ring-accent-500 outline-none" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-brand-700 mb-1">Author</label>
                          <input required type="text" className="w-full p-2 border border-brand-200 rounded-lg bg-white text-brand-900 focus:ring-2 focus:ring-accent-500 outline-none" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-700 mb-1">Genre</label>
                            <select className="w-full p-2 border border-brand-200 rounded-lg bg-white text-brand-900 focus:ring-2 focus:ring-accent-500 outline-none" value={newBook.genre} onChange={e => setNewBook({...newBook, genre: e.target.value})}>
                                <option>Fiction</option>
                                <option>Non-Fiction</option>
                                <option>Academic</option>
                                <option>Sci-Fi</option>
                                <option>Mystery</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-700 mb-1">Condition</label>
                            <select className="w-full p-2 border border-brand-200 rounded-lg bg-white text-brand-900 focus:ring-2 focus:ring-accent-500 outline-none" value={newBook.condition} onChange={e => setNewBook({...newBook, condition: e.target.value})}>
                                <option>New</option>
                                <option>Like New</option>
                                <option>Good</option>
                                <option>Fair</option>
                            </select>
                        </div>
                      </div>
                      
                      {/* Image Upload Section */}
                      <div>
                          <label className="block text-sm font-medium text-brand-700 mb-1">Cover Image</label>
                          
                          {previewUrl || newBook.cover_url ? (
                            <div className="relative w-32 h-44 mb-2 group">
                              <img src={previewUrl || newBook.cover_url} alt="Cover preview" className="w-full h-full object-cover rounded-lg border border-brand-200" />
                              <button 
                                type="button"
                                onClick={() => {
                                    setNewBook({...newBook, cover_url: ''});
                                    setPreviewUrl('');
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                              >
                                <span className="material-symbols-outlined text-xs">close</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {/* File Upload */}
                              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-brand-200 border-dashed rounded-lg cursor-pointer bg-brand-50 hover:bg-brand-100 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {uploading ? (
                                    <span className="material-symbols-outlined text-3xl text-accent-500 animate-spin mb-2">refresh</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-3xl text-brand-400 mb-2">cloud_upload</span>
                                  )}
                                  <p className="mb-2 text-sm text-brand-500"><span className="font-semibold">{uploading ? 'Uploading...' : 'Click to upload'}</span> cover</p>
                                </div>
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  disabled={uploading}
                                />
                              </label>
                              
                              {/* URL Fallback */}
                              <div className="flex items-center gap-2">
                                 <div className="h-px bg-brand-200 flex-1"></div>
                                 <span className="text-xs text-brand-400 font-medium uppercase">Or paste URL</span>
                                 <div className="h-px bg-brand-200 flex-1"></div>
                              </div>
                              <input 
                                type="text" 
                                placeholder="https://example.com/image.jpg" 
                                className="w-full p-2 border border-brand-200 rounded-lg bg-white text-brand-900 focus:ring-2 focus:ring-accent-500 outline-none text-sm" 
                                value={newBook.cover_url} 
                                onChange={e => setNewBook({...newBook, cover_url: e.target.value})} 
                              />
                            </div>
                          )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                          <button 
                            type="button"
                            onClick={() => setNewBook({...newBook, action: 'swap'})}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${newBook.action === 'swap' ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-brand-200 hover:border-brand-300'}`}
                          >
                              <span className="material-symbols-outlined block text-2xl mb-1">swap_horiz</span>
                              <span className="font-bold block">Swap</span>
                              <span className="text-xs">+50 Credits</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setNewBook({...newBook, action: 'donate'})}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${newBook.action === 'donate' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-brand-200 hover:border-brand-300'}`}
                          >
                              <span className="material-symbols-outlined block text-2xl mb-1">volunteer_activism</span>
                              <span className="font-bold block">Donate</span>
                              <span className="text-xs">+100 Credits</span>
                          </button>
                      </div>

                      <div className="flex gap-2 pt-4">
                          <Button type="button" variant="ghost" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                          <Button type="submit" fullWidth disabled={uploading}>Confirm Listing</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};