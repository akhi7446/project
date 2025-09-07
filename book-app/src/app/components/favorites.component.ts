import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteService } from '../core/services/favorite.service';
import { Favorite } from '../core/models/models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" style="padding:1rem;">
      <h3>Your Favorites</h3>
      <div class="space"></div>
      <div *ngIf="items.length; else empty">
        <div *ngFor="let f of items" class="row" style="justify-content: space-between;">
          <div><strong>{{ f.book?.title }}</strong></div>
          <button class="btn" style="background:#ef4444" (click)="remove(f.bookId)">Remove</button>
        </div>
      </div>
      <ng-template #empty><p class="muted">No favorites yet.</p></ng-template>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  items: Favorite[] = [];
  constructor(private fav: FavoriteService) {}
  ngOnInit() { this.load(); }
  load() { this.fav.getFavorites().subscribe(res => this.items = res); }
  remove(bookId: number) { this.fav.remove(bookId).subscribe(() => this.load()); }
}
