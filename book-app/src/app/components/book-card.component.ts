import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../core/models/models';
import { SafeUrlPipe } from '../core/pipes/safe-url.pipe';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  template: `
    <div class="book-card">
      <!-- Favorite heart top-right -->
      <button class="favorite-btn" (click)="toggleFavorite.emit(book)">
        {{ book.isFavorite ? '★' : '☆' }}
      </button>

      <!-- Cover + Genre badge -->
      <div class="cover-wrapper">
        <img *ngIf="book.imageUrl; else placeholder" [src]="book.imageUrl" alt="Cover" class="cover" />
        <ng-template #placeholder>
          <div class="cover-placeholder">No Cover</div>
        </ng-template>
        <div *ngIf="book.genre" class="genre-badge">{{ book.genre }}</div>
      </div>

      <!-- Info -->
      <div class="info">
        <h3 class="title" title="{{ book.title }}">{{ book.title }}</h3>
        <div class="author-price">
          <p class="author">{{ book.authorName }}</p>
          <p class="price">₹ {{ book.price }}</p>
        </div>
      </div>

      <!-- Add to Cart & View Document -->
      <div class="actions">
        <button class="btn btn-primary" (click)="addToCart.emit(book.id)">Add to Cart</button>
        <button *ngIf="book.samplePdfUrl" class="btn btn-secondary small-btn" (click)="openDocument()">View Document</button>
      </div>

      <!-- PDF Modal -->
      <div class="modal" *ngIf="showModal && book.samplePdfUrl" (click)="closeDocument()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeDocument()">✖</button>
          <iframe [src]="book.samplePdfUrl | safeUrl" width="100%" height="100%"></iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Card container */
    .book-card {
      position: relative;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      width: 220px;
      margin: 1rem;
      font-family: Arial, sans-serif;
    }
    .book-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    /* Favorite heart */
    .favorite-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #f59e0b;
      z-index: 2;
      padding: 0;
    }

    /* Cover */
    .cover-wrapper {
      position: relative;
      width: 100%;
      height: 280px;
      overflow: hidden;
    }
    .cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cover-placeholder {
      width: 100%; height: 100%;
      background: #eee;
      display: flex; justify-content: center; align-items: center;
      color: #999; font-weight: bold;
      font-size: 1rem;
    }

    /* Genre badge */
    .genre-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      font-size: 0.75rem;
      font-weight: bold;
      padding: 3px 6px;
      border-radius: 6px;
    }

    /* Info section */
    .info {
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .title {
      font-size: 1rem;
      font-weight: bold;
      margin: 0;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .author-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }
    .author { font-weight: bold; color: #333; margin: 0; }
    .price { font-weight: bold; color: #10b981; margin: 0; }

    /* Buttons */
    .actions {
      display: flex;
      gap: 0.5rem;
      padding: 0 1rem 1rem 1rem;
      margin-top: auto;
    }
    .btn {
      border: none;
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary { background: #3b82f6; color: #fff; flex: 1; }
    .btn-secondary { background: #10b981; color: #fff; }
    .small-btn { font-size: 0.75rem; padding: 0.3rem 0.5rem; }

    /* Modal */
    .modal {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }
    .modal-content {
      background: #fff;
      width: 80%;
      height: 80%;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      animation: scaleIn 0.3s ease;
    }
    .close-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      font-size: 1.5rem;
      background: #ef4444;
      color: #fff;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      border: none;
      cursor: pointer;
      line-height: 0;
    }

    @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
    @keyframes scaleIn { from {transform: scale(0.8);} to {transform: scale(1);} }
  `]
})
export class BookCardComponent {
  @Input() book!: Book;
  @Output() addToCart = new EventEmitter<number>();
  @Output() toggleFavorite = new EventEmitter<Book>();

  showModal = false;
  openDocument() { this.showModal = true; }
  closeDocument() { this.showModal = false; }
}
