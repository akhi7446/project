import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../core/services/favorite.service';
import { RecommendationService } from '../core/services/recommendation.service';
import { AuthService } from '../core/services/auth.service';
import { Favorite, Recommendation, ExternalBook, User } from '../core/models/models';
import { RouterModule, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule],
  template: `
    <div class="dashboard">

      <!-- ✅ Welcome Banner -->
      <div class="welcome-banner">
        <img 
          *ngIf="currentUser?.profileImageUrl; else defaultAvatar" 
          [src]="currentUser?.profileImageUrl" 
          alt="Profile" 
          class="avatar"
        />
        <ng-template #defaultAvatar>
          <img src="assets/default-avatar.png" alt="Default Avatar" class="avatar"/>
        </ng-template>
        <h2>Welcome, {{ currentUser?.firstName || currentUser?.username }} 👋</h2>
      </div>

      <div class="grid grid-3">

        <!-- Favorites -->
        <div class="card">
          <h3>❤️ Favorites</h3>
          <ul *ngIf="favorites.length; else emptyFav">
            <li *ngFor="let f of favorites">{{ f.book?.title }}</li>
          </ul>
          <ng-template #emptyFav><p class="muted">No favorites yet.</p></ng-template>
          <a class="link" routerLink="/favorites">View all →</a>
        </div>

        <!-- Authors -->
        <div class="card">
          <h3>✍️ Authors</h3>
          <ul *ngIf="authors.length; else emptyAuthors">
            <li *ngFor="let a of authors">{{ a }}</li>
          </ul>
          <ng-template #emptyAuthors><p class="muted">No authors to show.</p></ng-template>
        </div>

        <!-- Local Recommendations -->
        <div class="card">
          <h3>✨ Recommendations</h3>
          <ul *ngIf="recs.length; else emptyRecs">
            <li *ngFor="let r of recs">{{ r.bookTitle }} by {{ r.authorName }}</li>
          </ul>
          <ng-template #emptyRecs><p class="muted">No recommendations yet.</p></ng-template>
          <a class="link" routerLink="/books">Browse books →</a>
        </div>
      </div>

      <!-- 📚 Book Explorer (Full Width) -->
      <div class="card full-width">
        <h3>📚 Book Explorer</h3>

        <!-- 🔎 Search Bar -->
        <div class="search-bar">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search books..."
          />
          <button class="btn" (click)="searchBooks()">Search</button>
        </div>

        <!-- Loading -->
        <p *ngIf="loading" class="muted">
          <span class="spinner"></span> Loading books...
        </p>

        <!-- Book Cards -->
        <div class="book-grid" *ngIf="!loading && openLibRecs.length; else emptyOL">
          <a *ngFor="let b of openLibRecs"
             [href]="b.openLibraryUrl"
             target="_blank"
             rel="noopener noreferrer"
             class="book-card">
            <img
              *ngIf="b.coverUrl; else noCover"
              [src]="b.coverUrl"
              [alt]="b.title"
            />
            <ng-template #noCover>
              <div class="no-cover">No Image</div>
            </ng-template>
            <div class="book-info">
              <strong>{{ b.title }}</strong>
              <p class="muted" *ngIf="b.authorName">by {{ b.authorName }}</p>
            </div>
          </a>
        </div>

        <ng-template #emptyOL>
          <p *ngIf="!loading" class="muted">No OpenLibrary books loaded.</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 1rem; }
    .welcome-banner { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .avatar { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; }
    .card { padding: 1rem; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
    .full-width { grid-column: span 3; }
    .search-bar { display: flex; gap: .5rem; margin-bottom: 1rem; }
    .search-bar input { flex: 1; padding: .5rem; border: 1px solid #ddd; border-radius: 4px; }
    .book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
    .book-card { display: block; text-decoration: none; color: inherit; border: 1px solid #eee; border-radius: 6px; padding: .5rem; background: #fafafa; transition: transform .2s; }
    .book-card:hover { transform: translateY(-2px); }
    .book-card img { width: 100%; height: 200px; object-fit: cover; border-radius: 4px; }
    .no-cover { width: 100%; height: 200px; display:flex; align-items:center; justify-content:center; background:#f3f4f6; color:#9ca3af; border-radius:4px; }
    .book-info { margin-top: .5rem; }
    .spinner { display:inline-block; width:14px; height:14px; border:2px solid #ccc; border-top-color:#4f46e5; border-radius:50%; animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  favorites: Favorite[] = [];
  recs: Recommendation[] = [];
  openLibRecs: ExternalBook[] = [];
  authors: string[] = [];
  searchQuery: string = '';
  currentUser?: User | null;
  loading: boolean = false;

  private cache: { [query: string]: ExternalBook[] } = {};
  private searchQueryChanged = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(
    private favoriteService: FavoriteService,
    private recService: RecommendationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;

    // Debounced search handler
    const sub = this.searchQueryChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(query => {
        if (query.trim()) this.loadOpenLibRecs(query.trim());
      });
    this.subs.push(sub);

    // Load favorites & authors
    this.favoriteService.getFavorites().subscribe({
      next: favs => {
        this.favorites = favs;
        const set = new Set<string>();
        favs.forEach(f => f.book?.authorName && set.add(f.book.authorName));
        this.authors = [...set];
        const firstQuery = this.authors.length > 0 ? this.authors[0] : 'fiction';
        this.loadOpenLibRecs(firstQuery);
      },
      error: () => {
        this.favorites = [];
        this.authors = [];
        this.loadOpenLibRecs('fiction');
      }
    });

    // Local recommendations
    this.recService.getRecommendations().subscribe({
      next: res => (this.recs = res),
      error: () => (this.recs = [])
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadOpenLibRecs(query: string) {
    const key = query.toLowerCase();
    if (this.cache[key]) {
      this.openLibRecs = this.cache[key];
      return;
    }

    this.loading = true;
    this.recService.getOpenLibraryRecommendations(query, 12).subscribe({
      next: res => {
        this.openLibRecs = res || [];
        this.cache[key] = this.openLibRecs;
        this.loading = false;
      },
      error: () => {
        this.openLibRecs = [];
        this.loading = false;
      }
    });
  }

  onSearchChange(query: string) {
    this.searchQueryChanged.next(query);
  }

  searchBooks() {
    if (!this.searchQuery.trim()) return;
    this.loadOpenLibRecs(this.searchQuery.trim());
  }
}
