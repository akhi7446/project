import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Book, Author, Category, ExternalBook } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookService {
  private api = `${environment.apiUrl}/Book`;

  constructor(private http: HttpClient) {}

  // --- Local Book APIs ---
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.api);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.api}/${id}`);
  }

  search(query: string): Observable<Book[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Book[]>(`${this.api}/search`, { params });
  }

  filter(
    author?: string,
    category?: string,
    genre?: string,
    minPrice?: number,
    maxPrice?: number
  ): Observable<Book[]> {
    let params = new HttpParams();
    if (author) params = params.set('author', author);
    if (category) params = params.set('category', category);
    if (genre) params = params.set('genre', genre);
    if (minPrice != null) params = params.set('minPrice', minPrice.toString());
    if (maxPrice != null) params = params.set('maxPrice', maxPrice.toString());

    return this.http.get<Book[]>(`${this.api}/filter`, { params });
  }

  create(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(this.api, book);
  }

  update(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.api}/${id}`, book);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  approve(id: number): Observable<Book> {
    return this.http.put<Book>(`${this.api}/${id}/approve`, {});
  }

  // --- Authors / Categories ---
  getAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(`${environment.apiUrl}/Author`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/Category`);
  }

  // --- 🔥 OpenLibrary integration ---
  searchExternalBooks(
    q?: string,
    author?: string,
    subject?: string,
    limit = 12,
    offset = 0
  ): Observable<ExternalBook[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (author) params = params.set('author', author);
    if (subject) params = params.set('subject', subject);
    params = params.set('limit', limit.toString()).set('offset', offset.toString());

    return this.http.get<ExternalBook[]>(`${this.api}/external-search`, {
      params,
    });
  }
}
