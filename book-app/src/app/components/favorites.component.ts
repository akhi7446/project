// src/app/components/favorites.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../core/services/favorite.service';
import { Favorite, Book } from '../core/models/models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" style="padding:1rem; max-width:900px; margin:2rem auto;">
      <h3>Your Favorites</h3>
      <div class="space"></div>

      <div *ngIf="books.length; else empty">
        <div 
          *ngFor="let b of books" 
          class="row" 
          style="justify-content: space-between; align-items:center; padding:.8rem 0; border-bottom:1px solid #eee;"
        >
          <div>
            <div><strong>{{ b.title }}</strong></div>
            <div class="muted">✍ {{ b.authorName || '-' }}</div>
            <div class="muted">$ {{ b.price || 0 }}</div>
          </div>

          <div style="display:flex; gap:.5rem; align-items:center;">
            <button class="btn" style="background:#ef4444" (click)="remove(b.id)">Remove</button>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <p class="muted">No favorites yet.</p>
      </ng-template>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  books: Book[] = [];

  constructor(private favService: FavoriteService) {}

  ngOnInit() {
    this.favService.getFavorites().subscribe({
      next: (favorites: Favorite[]) => {
        // flatten favorites to Book[]
        this.books = favorites
          .map(f => f.book)
          .filter((b): b is Book => !!b);
      },
      error: err => {
        console.error('Failed to load favorites', err);
        this.books = [];
      }
    });

    // trigger initial load
    this.favService.loadFavorites();
  }

  remove(bookId: number) {
    this.favService.remove(bookId).subscribe({
      next: () => this.favService.loadFavorites(),
      error: err => console.error('Failed to remove favorite', err)
    });
  }
}
