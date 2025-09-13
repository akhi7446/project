import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">

      <!-- Role Selection -->
      <div *ngIf="!roleSelected" class="role-selection">
        <h2>Select your role</h2>

        <div class="role-row">
          <div class="role-box" (click)="selectRole('User')">Login as User</div>
          <div class="role-box" (click)="selectRole('Author')">Login as Author</div>
        </div>

        <div class="role-row single">
          <div class="role-box" (click)="selectRole('Admin')">Login as Admin</div>
        </div>

        <a routerLink="/books" class="guest-link">Continue as Guest →</a>
      </div>

      <!-- Login Form -->
      <div *ngIf="roleSelected" class="login-form-card">
        <h2>Login as {{ roleSelected }}</h2>
        <button class="back-btn" (click)="resetRole()">← Back to role selection</button>

        <form #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)">
          <div class="input-group">
            <label>Username</label>
            <input [(ngModel)]="username" name="username" required />
            <small *ngIf="loginForm.submitted && !username.trim()" class="error">Username is required</small>
          </div>

          <div class="input-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6" />
            <small *ngIf="loginForm.submitted && password.length < 6" class="error">
              Password must be at least 6 characters
            </small>
          </div>

          <button class="btn-login" type="submit" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
        <a routerLink="/books" class="guest-link">Continue as Guest →</a>
      </div>

    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      font-family: Arial, sans-serif;
    }

    h2 { text-align: center; margin-bottom: 1.5rem; }

    /* Role Boxes Layout */
    .role-row {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .role-row.single {
      justify-content: center;
    }

    .role-box {
      flex: 2;
      min-width: 150px;
      max-width: 225px;
      height: 40px;             /* compact height */
      background-color: #2196F3; /* blue */
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      font-size: 1rem;           /* smaller text */
      border-radius: 10px;
      cursor: pointer;
      transition: transform 0.2s;
      text-align: center;
    }

    .role-box:hover { transform: translateY(-2px); }

    /* Guest link */
    .guest-link {
      display: block;
      text-align: center;
      margin-top: 1rem;
      font-size: 0.95rem;
      color: #555;
      text-decoration: underline;
      cursor: pointer;
    }

    /* Login Form */
    .login-form-card {
      width: 100%;
      max-width: 400px;
      background: #fff;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      margin-top: 1rem;
    }

    .back-btn {
      background: none;
      border: none;
      color: #555;
      margin-bottom: 1rem;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .input-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
    label { margin-bottom: 0.3rem; font-weight: bold; }
    input { padding: 0.5rem; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }

    .btn-login {
      width: 100%;
      padding: 0.8rem;
      background-color: #2196F3;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-login:hover { background-color: #1976d2; }

    .error { color: red; font-size: 0.8rem; margin-top: 0.2rem; }
    .error-message { color: red; margin-top: 1rem; text-align: center; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  roleSelected: string | null = null;
  errorMessage = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  selectRole(role: string) { this.roleSelected = role; }

  resetRole() {
    this.roleSelected = null;
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  onLogin(form: NgForm) {
    if (!form.valid) return;

    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.username.trim(), this.password).subscribe({
      next: (user: User) => {
        this.loading = false;
        if (user.role === 'Admin') this.router.navigate(['/admin/requests']);
        else if (user.role === 'Author') this.router.navigate(['/author']);
        else this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) this.errorMessage = 'Invalid username or password.';
        else if (err.status === 0) this.errorMessage = 'Cannot connect to server.';
        else this.errorMessage = err?.error?.message || 'An unexpected error occurred.';
      }
    });
  }
}
