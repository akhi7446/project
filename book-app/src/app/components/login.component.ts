import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
      <form (ngSubmit)="onLogin()">
        <label>Username</label>
        <input class="input" [(ngModel)]="username" name="username" required />
        <div class="space"></div>
        <label>Password</label>
        <input class="input" type="password" [(ngModel)]="password" name="password" required />
        <div class="space"></div>
        <button class="btn" type="submit" style="width:100%;">Login</button>
      </form>

      <div class="space"></div>
      <div *ngIf="errorMessage" style="color: red; font-size: 0.9rem;">
        {{ errorMessage }}
      </div>

      <div class="space"></div>
      <a routerLink="/books" class="link">Skip → Continue as guest</a>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.auth.login(this.username, this.password).subscribe({
      next: (user: User) => {
        this.errorMessage = '';
        // ✅ Navigate based on role
        setTimeout(() => {
          if (user.role === 'Admin') {
            this.router.navigate(['/admin']);   // Admin goes to Admin Dashboard
          } else {
            this.router.navigate(['/dashboard']); // Normal user goes to User Dashboard
          }
        }, 0);
      },
      error: (err) => {
        console.error('Login error:', err);
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if backend is running.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }
}
