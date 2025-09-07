import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = `${environment.apiUrl}/Cart`;
  constructor(private http: HttpClient) {}

  getCart(): Observable<CartItem[]> { return this.http.get<CartItem[]>(this.api); }
  addToCart(bookId: number): Observable<void> { return this.http.post<void>(`${this.api}/${bookId}`, {}); }
  removeFromCart(bookId: number): Observable<void> { return this.http.delete<void>(`${this.api}/${bookId}`); }
  clearCart(): Observable<void> { return this.http.delete<void>(`${this.api}/clear`); }
}
