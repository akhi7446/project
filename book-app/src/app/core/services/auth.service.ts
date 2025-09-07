import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/User`;

  private _user = signal<User | null>(this.readUser());
  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient) {}

  get currentUser(): User | null {
    return this._user();
  }

  /** 🔹 LocalStorage helpers */
  private readUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  private writeUser(u: User | null) {
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
      this._user.set(u);
    } else {
      localStorage.removeItem('user');
      this._user.set(null);
    }
  }

  /** 🔹 Update current user */
  updateCurrentUser(user: User) {
    this.writeUser(user);
  }

  /** ✅ Login */
  login(username: string, password: string): Observable<User> {
    const body = { username, password };
    console.log('Sending login request:', body, 'to', `${this.api}/login`);

    return this.http.post<{ token: string }>(`${this.api}/login`, body).pipe(
      switchMap(res => {
        console.log('Login response:', res);

        // Minimal user with token (id will be updated when profile loads)
        const user: User = {
          id: 0,
          username,
          email: '',
          token: res.token,
          phoneNumber: '',
          profileImageUrl: null
        };

        this.writeUser(user);

        // 🔹 Fetch profile right after login
        return this.getProfile().pipe(map(() => this.currentUser!));
      })
    );
  }

  /** ✅ Register */
  register(
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    imageFile?: File
  ): Observable<User> {
    const formData = new FormData();
    formData.append('Username', username);
    formData.append('Email', email);
    formData.append('Password', password);
    formData.append('FirstName', firstName || '');
    formData.append('LastName', lastName || '');
    formData.append('PhoneNumber', phoneNumber || '');
    if (imageFile) formData.append('File', imageFile);

    return this.http.post<User>(`${this.api}/register`, formData).pipe(
      tap(u => {
        const enriched: User = {
          ...u,
          phoneNumber: u.phoneNumber || phoneNumber,
          profileImageUrl: u.profileImageUrl || null
        };
        this.writeUser(enriched);
      })
    );
  }

  /** ✅ Get Profile */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.api}/profile`).pipe(
      tap(u => {
        console.log('Profile API returned', u);
        const merged: User = { ...(this.currentUser || {}), ...u };
        this.writeUser(merged);
      })
    );
  }

  /** ✅ Update Profile (new) */
  updateProfile(firstName?: string, lastName?: string, phoneNumber?: string): Observable<User> {
    const body: any = { firstName, lastName, phoneNumber };
    // remove undefined values so we only send what user changed
    Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);

    return this.http.put<User>(`${this.api}/update`, body).pipe(
      tap(u => {
        const merged: User = { ...(this.currentUser || {}), ...u };
        this.writeUser(merged);
      })
    );
  }

  /** ✅ Upload/replace profile image (new) */
  uploadProfileImage(file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('File', file);
    return this.http.post<{ imageUrl: string }>(`${this.api}/upload-profile-image`, form).pipe(
      tap(res => {
        const merged: User = { ...(this.currentUser || {id: 0, username: '', email: '' }), profileImageUrl: res.imageUrl };
        this.writeUser(merged);
      })
    );
  }

  /** ✅ Logout */
  logout() {
    this.writeUser(null);
  }
}
