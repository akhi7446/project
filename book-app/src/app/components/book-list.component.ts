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
  imports: [CommonModule, FormsModule, BookCardComponent,],
  template: `
    <div class="grid" style="grid-template-columns: 280px 1fr;">
      <!-- Filters -->
      <aside class="card sidebar" style="padding:1rem;">
        <h3>Filters</h3>
        <div class="space"></div>

        <label>Search</label>
        <div style="display:flex; gap:.5rem;">
          <input class="input" [(ngModel)]="searchTerm" (keyup.enter)="applySearch()" placeholder="Book or author..." style="flex:1;" />
          <button class="btn" (click)="applySearch()" title="Search">Search</button>
        </div>

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
        <button class="btn" style="background:#6b7280; margin-left:.5rem;" (click)="clearFilters()">Clear</button>
      </aside>

      <!-- List -->
      <section class="grid grid-3">
        <app-book-card *ngFor="let b of books" [book]="b"
          (addToCart)="add(b.id)"
          (toggleFavorite)="toggleFav(b)">
        </app-book-card>
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
  genres = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Romance', 'Mystery', 'Biography', 'Fantasy', 'Adventure'];

  constructor(
    private bookService: BookService,
    private favService: FavoriteService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getBooks().subscribe({
      next: (res) => this.books = res,
      error: (err) => {
        console.error('Failed to load books', err);
        this.books = [];
      }
    });
  }

  applySearch() {
    const q = this.searchTerm?.trim();
    if (!q) {
      this.loadBooks();
      return;
    }

    this.bookService.search(q).subscribe({
      next: (res) => this.books = res,
      error: (err) => {
        console.error('Search failed', err);
        this.books = [];
      }
    });
  }

  applyFilters() {
    if (this.searchTerm && this.searchTerm.trim()) {
      this.applySearch();
      return;
    }

    let min = this.minPrice !== null ? this.minPrice : undefined;
    let max = this.maxPrice !== null ? this.maxPrice : undefined;

    if (min !== undefined && max === undefined) {
      max = min;
    }

    this.bookService
      .filter(undefined, undefined, this.genre || undefined, min, max)
      .subscribe({
        next: res => this.books = res,
        error: err => {
          console.error('Filter failed', err);
          this.books = [];
        }
      });
  }

  clearFilters() {
    this.searchTerm = '';
    this.genre = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.loadBooks();
  }

  add(bookId: number) {
    this.cartService.addToCart(bookId).subscribe({
      next: () => console.log('Added to cart'),
      error: (err) => console.error('Failed to add to cart', err)
    });
  }

  toggleFav(book: Book) {
    this.favService.toggle(book.id, book.isFavorite).subscribe({
      next: () => {
        book.isFavorite = !book.isFavorite;
        console.log('Toggled favorite');
      },
      error: (err) => console.error('Failed toggle fav', err)
    });
  }
}
