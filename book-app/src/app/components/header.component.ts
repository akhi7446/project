// src/app/components/header.component.ts
import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/models'; // adjust path if needed

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  template: `
    <header class="header" style="border-bottom:1px solid #eee;">
      <div class="container row" style="justify-content: space-between; padding:.8rem 0;">

        <!-- Logo & Greeting -->
        <div class="row" style="gap:1rem; align-items:center;">
          <a class="row" routerLink="/" style="gap:.6rem; text-decoration:none;">
            <img src="assets/logo.png" alt="logo" style="width:32px; height:32px;" />
            <span style="font-weight:800; font-size:1.2rem; color:var(--brand)">Book App</span>
          </a>

          <span *ngIf="user()">
            👋 Hello, <strong>{{ user()?.firstName || user()?.username }}</strong>
          </span>
        </div>

        <!-- Navigation Links -->
        <div class="row" style="gap:1rem; align-items:center;">
          <a routerLink="/books" class="link">Books</a>

          <!-- Regular User-only links -->
          <ng-container *ngIf="user() && user()?.role === 'User'">
            <a routerLink="/favorites" class="link">Favorites</a>
            <a routerLink="/cart" class="link">Cart</a>
          </ng-container>

          <!-- Author-specific links -->
          <ng-container *ngIf="user()?.role === 'Author'">
            <a routerLink="/author" class="link">Dashboard</a>
            <a routerLink="/author/submit-book" class="link">Submit New Book</a>
          </ng-container>

          <!-- Admin-specific links -->
          <ng-container *ngIf="user()?.role === 'Admin'">
            <a routerLink="/admin/dashboard" class="link">Books Dashboard</a>
            <a routerLink="/admin/requests" class="link">Book Requests</a>
          </ng-container>
        </div>

        <!-- Profile / Auth Links -->
        <div class="row" style="gap:1rem; align-items:center;">
          <ng-container *ngIf="user(); else guest">
            <a routerLink="/profile" class="link">Profile</a>
            <button class="btn" (click)="logout()">Logout</button>
          </ng-container>

          <ng-template #guest>
            <a routerLink="/login" class="link">Login</a>
            <a routerLink="/register" class="link">Register</a>
          </ng-template>
        </div>

      </div>
    </header>
  `,
})
export class HeaderComponent {
  user = computed(() => this.auth.user());

  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/']); // redirect to dashboard
  }
}
