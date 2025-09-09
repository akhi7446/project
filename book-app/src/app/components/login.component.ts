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
    <div class="card" style="max-width:440px; margin:2rem auto; padding:1.2rem;">
      <h3>Login</h3>
      <div class="space"></div>

      <form #loginForm="ngForm" (ngSubmit)="onLogin(loginForm)">
        <label>Username *</label>
        <input
          class="input"
          [(ngModel)]="username"
          name="username"
          required
        />
        <small class="error" *ngIf="loginForm.submitted && !username.trim()">Username is required</small>

        <div class="space"></div>
        <label>Password *</label>
        <input
          class="input"
          type="password"
          [(ngModel)]="password"
          name="password"
          required
          minlength="6"
        />
        <small class="error" *ngIf="loginForm.submitted && password.length < 6">
          Password must be at least 6 characters
        </small>

        <div class="space"></div>
        <button class="btn" type="submit" style="width:100%;" [disabled]="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="space"></div>
      <div *ngIf="errorMessage" style="color: red; font-size: 0.9rem;">
        {{ errorMessage }}
      </div>

      <div class="space"></div>
      <a routerLink="/books" class="link">Skip → Continue as guest</a>
    </div>
  `,
  styles: [`
    .error {
      color: red;
      font-size: 0.8rem;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.username.trim(), this.password).subscribe({
      next: (user: User) => {
        this.loading = false;
         console.log("🔑 Logged in user:", user);

         const role = user.role?.toLowerCase();
        // ✅ Navigate based on role
        if (user.role === 'Admin') {
          this.router.navigate(['/admin/requests']);
        } else if (user.role === 'Author') {
          this.router.navigate(['/author']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading = false;

        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if backend is running.';
        } else {
          this.errorMessage = err?.error?.message || 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }
}
