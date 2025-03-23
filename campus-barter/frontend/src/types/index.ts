export interface User {
  id: number;
  name: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  reputation_score: number;
  join_date: string;
}

export interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  condition?: string;
  images: string[];
  tags: string[];
  date_listed: string;
  status: 'available' | 'pending' | 'traded';
  user_id: number;
}

export interface Trade {
  id: number;
  initiator_id: number;
  recipient_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  creation_date: string;
  completion_date?: string;
  items: TradeItem[];
  messages: Message[];
}

export interface TradeItem {
  id: number;
  trade_id: number;
  offered_item_id?: number;
  requested_item_id?: number;
}

export interface Message {
  id: number;
  trade_id: number;
  sender_id: number;
  content: string;
  timestamp: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
