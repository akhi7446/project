export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: 'User' | 'Admin' | 'Author'; // include Author since backend has it
  token?: string;
  profileImageUrl?: string | null;
}

export interface Author {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  description?: string;   // ✅ optional
  price: number;
  genre: string;
  authorId: number;
  authorName?: string;    // ✅ added
  categoryId: number;
  categoryName?: string;  // ✅ added
  imageUrl?: string;      // ✅ optional
  isApproved: boolean;    // ✅ added
  isFavorite?: boolean;   // frontend only
}

export interface CartItem {
  id: number;
  bookId: number;
  quantity: number;
  book?: Book;
}

export interface Favorite {
  id: number;
  userId: number;
  bookId: number;
  book?: Book;
}

export interface Recommendation {
  id: number;
  bookId: number;
  bookTitle: string;
  authorName: string;
}

export interface ExternalBook {
  workKey?: string;
  title?: string;
  authorName?: string;
  firstPublishYear?: number;
  coverUrl?: string;
  openLibraryUrl?: string;
}
