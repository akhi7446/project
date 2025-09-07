import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Favorite } from '../models/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private api = `${environment.apiUrl}/Favorite`;
  constructor(private http: HttpClient) {}

  getFavorites(): Observable<Favorite[]> { return this.http.get<Favorite[]>(this.api); }
  add(bookId: number): Observable<void> { return this.http.post<void>(`${this.api}/${bookId}`, {}); }
  remove(bookId: number): Observable<void> { return this.http.delete<void>(`${this.api}/${bookId}`); }

  toggle(bookId: number, current?: boolean): Observable<void> {
    return current ? this.remove(bookId) : this.add(bookId);
  }
}
