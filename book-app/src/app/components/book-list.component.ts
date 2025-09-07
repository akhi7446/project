import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book } from '../core/models/models';
import { BookService } from '../core/services/book.service';
import { FavoriteService } from '../core/services/favorite.service';
import { CartService } from '../core/services/cart.service';
import { BookCardComponent } from './book-card.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  template: `
    <div class="grid" style="grid-template-columns: 280px 1fr;">
      <!-- Filters -->
      <aside class="card sidebar" style="padding:1rem;">
        <h3>Filters</h3>
        <div class="space"></div>

        <label>Search</label>
        <input
          class="input"
          [(ngModel)]="searchTerm"
          (keyup.enter)="applySearch()"
          placeholder="Book or author..."
        />
        <div class="space"></div>

        <label>Genre</label>
        <select [(ngModel)]="genre" class="input">
          <option value="">All</option>
          <option *ngFor="let g of genres" [value]="g">{{ g }}</option>
        </select>
        <div class="space"></div>

        <label>Price</label>
        <div class="row">
          <input class="input" type="number" [(ngModel)]="minPrice" placeholder="Min" />
          <input class="input" type="number" [(ngModel)]="maxPrice" placeholder="Max" />
        </div>
        <div class="space"></div>

        <button class="btn" (click)="applyFilters()">Apply</button>
        <button
          class="btn"
          style="background:#6b7280; margin-left:.5rem;"
          (click)="clearFilters()"
        >
          Clear
        </button>
      </aside>

      <!-- List -->
      <section class="grid grid-3">
        <app-book-card
          *ngFor="let b of books"
          [book]="b"
          (addToCart)="add(b.id)"
          (toggleFavorite)="toggleFav(b)"
        ></app-book-card>
      </section>
    </div>
  `
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  searchTerm = '';
  genre: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  genres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Romance', 'Mystery', 'Biography'];

  constructor(
    private bookService: BookService,
    private favService: FavoriteService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getBooks().subscribe(res => (this.books = res));
  }

  applySearch() {
    const q = this.searchTerm.trim();
    if (!q) {
      this.loadBooks();
      return;
    }
    this.bookService.search(q).subscribe(res => (this.books = res));
  }

  applyFilters() {
    this.bookService
      .filter(
        undefined,
        undefined,
        this.genre || undefined,
        this.minPrice !== null ? this.minPrice : undefined,
        this.maxPrice !== null ? this.maxPrice : undefined
      )
      .subscribe(res => (this.books = res));
  }

  clearFilters() {
    this.searchTerm = '';
    this.genre = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.loadBooks();
  }

  add(bookId: number) {
    this.cartService.addToCart(bookId).subscribe();
  }

  toggleFav(book: Book) {
    this.favService.toggle(book.id, book.isFavorite).subscribe(() => {
      book.isFavorite = !book.isFavorite;
    });
  }
}
