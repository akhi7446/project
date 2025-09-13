// src/app/core/services/favorite.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Favorite, Book } from '../models/models';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface BookDto {
  id: number;
  title: string;
  authorName?: string;
  categoryName?: string;
  genre?: string;
  price?: number;
  imageUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private api = `${environment.apiUrl}/Favorite`;

  // Observable cache for components
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);

  constructor(private http: HttpClient) {}

  /** Observable to subscribe to favorites */
  getFavorites(): Observable<Favorite[]> {
    return this.favoritesSubject.asObservable();
  }

  /** Load favorites from backend */
  loadFavorites(): void {
    this.http.get<BookDto[]>(this.api).pipe(
      catchError(err => {
        console.error('Failed to load favorites', err);
        return of([] as BookDto[]);
      }),
      map((books: BookDto[]) => books.map(b => this.mapBookDtoToFavorite(b)))
    ).subscribe(mapped => this.favoritesSubject.next(mapped));
  }

  /** Add favorite */
  add(bookId: number): Observable<void> {
    return this.http.post<void>(`${this.api}/${bookId}`, {}).pipe(
      tap(() => this.loadFavorites())
    );
  }

  /** Remove favorite */
  remove(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${bookId}`).pipe(
      tap(() => this.loadFavorites())
    );
  }

  /** Toggle favorite */
  toggle(bookId: number, current?: boolean): Observable<void> {
    return current ? this.remove(bookId) : this.add(bookId);
  }

  /** Map backend BookDto to frontend Favorite object */
  private mapBookDtoToFavorite(b: BookDto): Favorite {
    const book: Book = {
      id: b.id,
      title: b.title,
      description: undefined,
      price: Number(b.price ?? 0),
      genre: b.genre ?? '',
      authorId: 0,
      authorName: b.authorName,
      categoryId: 0,
      categoryName: b.categoryName,
      imageUrl: b.imageUrl ?? undefined,
      isApproved: true,
      isFavorite: true
    };

    return {
      id: 0,         // backend doesn't return favorite id here
      userId: 0,
      bookId: b.id,
      book
    };
  }
}
