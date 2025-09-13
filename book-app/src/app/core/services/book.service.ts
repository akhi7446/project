import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Book, Author, Category, ExternalBook } from '../models/models';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

// DTO returned by backend for Book Requests
export interface BookRequest {
  id: number;
  title: string;
  authorName: string;
  description: string;
  coverImageUrl?: string;
  genre: string;
  price: number;
  status: string;       // Pending, Approved, Rejected
  requestedById: number;
  requestedByName?: string;
  samplePdfUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private api = `${environment.apiUrl}/Book`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ----------------------------
  // Helper: construct full URL for static files
  // ----------------------------
  private getFullFileUrl(path?: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }

  private mapBookUrls(book: Book): Book {
    return {
      ...book,
      imageUrl: this.getFullFileUrl(book.imageUrl),
      samplePdfUrl: this.getFullFileUrl(book.samplePdfUrl)
    };
  }

  private mapBooks(books: Book[]): Book[] {
    return books.map(b => this.mapBookUrls(b));
  }

  // ----------------------------
  // Local Book APIs
  // ----------------------------
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.api).pipe(map(res => this.mapBooks(res)));
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.api}/${id}`).pipe(map(this.mapBookUrls.bind(this)));
  }

  search(query: string): Observable<Book[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Book[]>(`${this.api}/search`, { params }).pipe(map(res => this.mapBooks(res)));
  }

  filter(author?: string, category?: string, genre?: string, minPrice?: number, maxPrice?: number): Observable<Book[]> {
    let params = new HttpParams();
    if (author) params = params.set('author', author);
    if (category) params = params.set('category', category);
    if (genre) params = params.set('genre', genre);
    if (minPrice != null) params = params.set('minPrice', minPrice.toString());
    if (maxPrice != null) params = params.set('maxPrice', maxPrice.toString());
    return this.http.get<Book[]>(`${this.api}/filter`, { params }).pipe(map(res => this.mapBooks(res)));
  }

  // ----------------------------
  // Admin Book CRUD
  // ----------------------------
  create(book: any, file?: File): Observable<Book> {
    if (file) {
      const formData = new FormData();
      formData.append('title', book.title || '');
      formData.append('authorName', book.authorName || '');
      formData.append('description', book.description || '');
      formData.append('genre', book.genre || '');
      formData.append('price', (book.price ?? 0).toString());
      if (book.coverImageUrl) formData.append('coverImageUrl', book.coverImageUrl);
      formData.append('file', file);

      return this.http.post<Book>(this.api, formData, { headers: this.getAuthHeaders(false) }).pipe(
        map(this.mapBookUrls.bind(this))
      );
    }
    return this.http.post<Book>(this.api, book, { headers: this.getAuthHeaders() }).pipe(
      map(this.mapBookUrls.bind(this))
    );
  }

  update(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.api}/${id}`, book, { headers: this.getAuthHeaders() }).pipe(
      map(this.mapBookUrls.bind(this))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`, { headers: this.getAuthHeaders() });
  }

  // ----------------------------
  // Admin: Toggle book approval/active status
  // ----------------------------
  updateBookStatus(id: number, isApproved: boolean): Observable<Book> {
    return this.http.patch<Book>(
      `${this.api}/${id}/status`,
      { isApproved },
      { headers: this.getAuthHeaders() }
    ).pipe(map(this.mapBookUrls.bind(this)));
  }

  // ----------------------------
  // Authors / Categories
  // ----------------------------
  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(`${environment.apiUrl}/Author`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/Category`);
  }

  // ----------------------------
  // OpenLibrary integration
  // ----------------------------
  searchExternalBooks(q?: string, author?: string, subject?: string, limit = 12, offset = 0): Observable<ExternalBook[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (author) params = params.set('author', author);
    if (subject) params = params.set('subject', subject);
    params = params.set('limit', limit.toString()).set('offset', offset.toString());
    return this.http.get<ExternalBook[]>(`${this.api}/external-search`, { params });
  }

  // ----------------------------
  // Book Requests (Author & Admin)
  // ----------------------------
  private getAuthHeaders(json: boolean = true): HttpHeaders {
    const token = this.auth.currentUser?.token;
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    if (json) headers = headers.set('Content-Type', 'application/json');
    return headers;
  }

  submitBookRequest(formData: FormData): Observable<BookRequest> {
    return this.http.post<BookRequest>(`${this.api}/submit`, formData, {
      headers: this.getAuthHeaders(false) // no Content-Type here
    });
  }

  getMyBookRequests(): Observable<BookRequest[]> {
    return this.http.get<BookRequest[]>(`${this.api}/my-requests`, { headers: this.getAuthHeaders() });
  }

  getPendingBookRequests(): Observable<BookRequest[]> {
    return this.http.get<BookRequest[]>(`${this.api}/requests/pending`, { headers: this.getAuthHeaders() });
  }

  approveBookRequest(id: number): Observable<BookRequest> {
    return this.http.put<BookRequest>(`${this.api}/requests/${id}/approve`, {}, { headers: this.getAuthHeaders() });
  }

  rejectBookRequest(id: number): Observable<BookRequest> {
    return this.http.put<BookRequest>(`${this.api}/requests/${id}/reject`, {}, { headers: this.getAuthHeaders() });
  }
}
