export type ViewState = 'landing' | 'dashboard' | 'browse' | 'profile' | 'ngo' | 'swaps';

export const DEMO_USER_ID = 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  genre: string;
  status: 'available' | 'requested' | 'swapped' | 'donating' | 'donated';
  owner_id: string;
  description?: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'reader' | 'ngo';
  name: string;
  avatar_url: string;
  credits: number;
}

export interface Swap {
  id: string;
  book_id: string;
  requester_id: string;
  owner_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  book?: Book; // Joined data
  requester?: User; // Joined data
  owner?: User; // Joined data
}