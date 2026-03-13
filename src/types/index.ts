export interface Kindergarten {
  id: string;
  slug: string;
  name: string;
  city: string;
  region?: string | null;
  area?: string | null;
  address?: string | null;
  type: string;
  phone?: string | null;
  website?: string | null;
  language?: string | null;
  ageFrom?: number | null;
  groups?: number | null;
  hours?: string | null;
  features: string;
  description?: string | null;
  imageUrl?: string | null;
  note?: string | null;
  baseRating: number;
  baseReviewCount: number;
  isUserAdded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Aukle {
  id: string;
  slug: string;
  name: string;
  city: string;
  region?: string | null;
  area?: string | null;
  phone?: string | null;
  email?: string | null;
  experience?: string | null;
  ageRange?: string | null;
  hourlyRate?: string | null;
  languages?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  availability?: string | null;
  baseRating: number;
  baseReviewCount: number;
  isServicePortal: boolean;
  isUserAdded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Burelis {
  id: string;
  slug: string;
  name: string;
  city: string;
  region?: string | null;
  area?: string | null;
  category?: string | null;
  subcategory?: string | null;
  ageRange?: string | null;
  price?: string | null;
  schedule?: string | null;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  baseRating: number;
  baseReviewCount: number;
  isUserAdded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialist {
  id: string;
  slug: string;
  name: string;
  city: string;
  region?: string | null;
  area?: string | null;
  specialty?: string | null;
  clinic?: string | null;
  price?: string | null;
  phone?: string | null;
  website?: string | null;
  languages?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  baseRating: number;
  baseReviewCount: number;
  isUserAdded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  itemId: string;
  itemType: string;
  authorName: string;
  rating: number;
  text: string;
  isApproved: boolean;
  createdAt: string;
  userId?: string | null;
  replies?: ReviewReply[];
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  text: string;
  authorName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export type ItemType = 'kindergarten' | 'aukle' | 'burelis' | 'specialist';
