import { Injectable, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/User`;

  // 🔹 Signal for reactive user
  private _user = signal<User | null>(this.readUser());
  readonly user: Signal<User | null> = this._user.asReadonly();

  constructor(private http: HttpClient) {}

  /** 🔹 Get current user snapshot */
  get currentUser(): User | null {
    return this._user();
  }

  /** 🔹 Read user from localStorage */
  private readUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  /** 🔹 Write user to localStorage + update signal */
  private writeUser(u: User | null) {
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
      this._user.set(u);
    } else {
      localStorage.removeItem('user');
      this._user.set(null);
    }
  }

  /** 🔹 Update current user manually */
  updateCurrentUser(user: User) {
    this.writeUser(user);
  }

  /** ✅ Login */
  login(username: string, password: string): Observable<User> {
    const body = { username, password };
    return this.http.post<{ token: string }>(`${this.api}/login`, body).pipe(
      switchMap(res => {
        // Minimal user with token
        const user: User = {
          id: 0,
          username,
          email: '',
          token: res.token,
          phoneNumber: '',
          profileImageUrl: null,
          role: undefined
        };

        this.writeUser(user);

        // Fetch profile right after login
        return this.getProfile().pipe(
          map(() => this.currentUser!)
        );
      })
    );
  }

  /** ✅ Register (only User & Author allowed) */
  register(
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    role: 'User' | 'Author',
    imageFile?: File
  ): Observable<User> {
    const formData = new FormData();
    formData.append('Username', username);
    formData.append('Email', email);
    formData.append('Password', password);
    formData.append('FirstName', firstName);
    formData.append('LastName', lastName);
    formData.append('PhoneNumber', phoneNumber);
    formData.append('Role', role);
    if (imageFile) formData.append('File', imageFile, imageFile.name);

    return this.http
      .post<{ message: string; user: User }>(`${this.api}/register`, formData)
      .pipe(
        map(res => res.user),
        tap(u => {
          const enriched: User = {
            ...u,
            phoneNumber: u.phoneNumber || phoneNumber,
            profileImageUrl: u.profileImageUrl || null,
            role: (u.role as 'User' | 'Author') || role
          };
          this.writeUser(enriched);
        })
      );
  }

  /** ✅ Get Profile */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.api}/profile`).pipe(
      tap(u => {
        const merged: User = { ...(this.currentUser || {}), ...u };
        merged.role = (u.role as 'User' | 'Author') || this.currentUser?.role || 'User';
        this.writeUser(merged);
      })
    );
  }

  /** ✅ Update Profile */
  updateProfile(
    firstName?: string,
    lastName?: string,
    phoneNumber?: string
  ): Observable<User> {
    const body: any = { firstName, lastName, phoneNumber };
    Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);

    return this.http.put<User>(`${this.api}/update`, body).pipe(
      tap(u => {
        const merged: User = { ...(this.currentUser || {}), ...u };
        this.writeUser(merged);
      })
    );
  }

  /** ✅ Upload/replace profile image */
  uploadProfileImage(file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('File', file);
    return this.http
      .post<{ imageUrl: string }>(`${this.api}/upload-profile-image`, form)
      .pipe(
        tap(res => {
          const merged: User = {
            ...(this.currentUser || { id: 0, username: '', email: '', token: '' }),
            profileImageUrl: res.imageUrl
          };
          this.writeUser(merged);
        })
      );
  }

  /** ✅ Logout */
  logout() {
    this.writeUser(null);
  }
}
