import { Component, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

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
          <!-- Common links -->
          <a routerLink="/books" class="link">Books</a>
          <a *ngIf="isLoggedIn()" routerLink="/favorites" class="link">Favorites</a>
          <a *ngIf="isLoggedIn()" routerLink="/cart" class="link">Cart</a>

          <!-- Admin links -->
          <ng-container *ngIf="isAdmin()">
            <a routerLink="/admin/add-book" class="link">Add Book</a>
            <a routerLink="/admin/requests" class="link">Requests</a>
          </ng-container>

          <!-- Author links -->
          <ng-container *ngIf="isAuthor()">
            <a routerLink="/author" class="link">My Dashboard</a>
            <a routerLink="/author/submit-book" class="link">Submit Book</a>
          </ng-container>
        </div>

        <!-- Right: User / Guest -->
        <div class="row" style="gap:1rem; align-items:center;">
          <ng-container *ngIf="isLoggedIn(); else guest">
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
  user!: typeof this.auth.user;

  // ✅ Role checks
  isAdmin = computed(() => this.user()?.role === 'Admin');
  isAuthor = computed(() => this.user()?.role === 'Author');
  isLoggedIn = computed(() => !!this.user());

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.auth.user;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
