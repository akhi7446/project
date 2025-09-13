import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/models';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = `${environment.apiUrl}/Cart`;
  private cart$ = new BehaviorSubject<CartItem[]>([]);

  constructor(private http: HttpClient) {}

  getCartItems(): Observable<CartItem[]> {
    return this.cart$.asObservable();
  }

  loadCart(): void {
    this.http.get<CartItem[]>(this.api).subscribe({
      next: items => this.cart$.next(items || []),
      error: () => this.cart$.next([])
    });
  }

  addToCart(bookId: number, quantity: number = 1): Observable<void> {
    return this.http
      .post<void>(`${this.api}/${bookId}`, {}, { params: { quantity: quantity.toString() } })
      .pipe(tap(() => this.loadCart()));
  }

  removeFromCart(bookId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${bookId}`).pipe(tap(() => this.loadCart()));
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.api}/clear`).pipe(tap(() => this.loadCart()));
  }

  /** Increment quantity by 1 using existing backend */
  incrementQuantity(bookId: number): Observable<void> {
    return this.addToCart(bookId, 1);
  }

  /** Decrement quantity by 1 using remove + re-add (if quantity > 1) */
  decrementQuantity(bookId: number, currentQuantity: number): Observable<void> {
    if (currentQuantity <= 1) {
      return this.removeFromCart(bookId);
    } else {
      return this.removeFromCart(bookId).pipe(
        switchMap(() => this.addToCart(bookId, currentQuantity - 1))
      );
    }
  }
}
