import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../core/models/models';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" style="padding:1rem;">
      <!-- Book Cover -->
      <ng-container *ngIf="book.imageUrl; else noCover">
        <img
          [src]="book.imageUrl"
          alt="{{ book.title }}"
          style="width:100%; height:180px; object-fit:cover; border-radius:8px;"
        />
      </ng-container>
      <ng-template #noCover>
        <div
          style="width:100%; height:180px; display:flex; align-items:center; justify-content:center; background:#f3f4f6; border-radius:8px; color:#9ca3af;"
        >
          No Image
        </div>
      </ng-template>

      <div class="space"></div>

      <!-- Title + Genre -->
      <div class="row" style="justify-content: space-between;">
        <h4 style="margin:0;">{{ book.title }}</h4>
        <span class="badge">{{ book.genre }}</span>
      </div>

      <!-- Author -->
      <p class="muted">{{ book.authorName }}</p>

      <!-- Price -->
      <p class="price">$ {{ book.price }}</p>

      <!-- Actions -->
      <div class="row" style="justify-content: space-between;">
        <button class="btn" (click)="addToCart.emit(book.id)">Add to Cart</button>
        <div
          class="heart"
          (click)="toggleFavorite.emit(book.id)"
          [title]="book.isFavorite ? 'Remove favorite' : 'Add favorite'"
        >
          <span [style.color]="book.isFavorite ? '#ef4444' : '#9ca3af'">❤</span>
        </div>
      </div>
    </div>
  `
})
export class BookCardComponent {
  @Input() book!: Book;
  @Output() addToCart = new EventEmitter<number>();
  @Output() toggleFavorite = new EventEmitter<number>();
}
