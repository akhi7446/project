import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  template: `
    <header class="header">
      <div class="container row" style="justify-content: space-between; padding:.8rem 0;">
        
        <!-- Left: Logo + Greeting -->
        <div class="row" style="gap:1rem; align-items:center;">
          <a class="row" routerLink="/" style="gap:.6rem; text-decoration:none;">
            <img src="assets/logo.png" alt="logo" style="width:32px; height:32px;" />
            <span style="font-weight:800; font-size:1.2rem; color:var(--brand)">
              Book App
            </span>
          </a>
          <span *ngIf="user() as u">
            👋 Hello, <strong>{{ u.firstName || u.username }}</strong>
          </span>
        </div>

        <!-- Center: Navigation -->
        <div class="row" style="gap:1rem;">
          <a routerLink="/books" class="link">Books</a>
          <a routerLink="/favorites" class="link">Favorites</a>
          <a routerLink="/cart" class="link">Cart</a>
          <a *ngIf="isAdmin()" routerLink="/admin/add-book" class="link">Admin</a>
        </div>

        <!-- Right: User / Guest -->
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
  `
})
export class HeaderComponent implements OnInit {
  user!: typeof this.auth.user;   // declare, but don’t initialize yet
  isAdmin = computed(() => this.user()?.role === 'Admin');

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // ✅ now we can safely initialize it
    this.user = this.auth.user;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
