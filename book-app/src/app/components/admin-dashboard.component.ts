import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../core/services/book.service';
import { Book } from '../core/models/models';
import { environment } from '../environments/environment';

// ✅ Extend Book type locally to include frontend-only 'isUpdating'
interface BookWithUpdate extends Book {
  isUpdating?: boolean;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h2>Admin: Books Dashboard</h2>
      <div *ngIf="books.length === 0" class="no-books">No books available.</div>

      <div *ngFor="let book of books" 
           class="card book-card" 
           [class.inactive]="!book.isApproved">
        <div class="book-info">
          <img *ngIf="book.imageUrl" [src]="getFullFileUrl(book.imageUrl)" alt="cover" />
          <div>
            <h4>{{ book.title }}</h4>
            <p><strong>Author:</strong> {{ book.authorName || 'Unknown' }}</p>
            <p><strong>Price:</strong> {{ book.price | currency:'USD' }}</p>
          </div>
        </div>

        <div class="actions">
          <label>
            <input type="checkbox" 
                   [checked]="book.isApproved" 
                   (change)="toggleApproved(book)" 
                   [disabled]="book.isUpdating" />
            Active
          </label>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 2rem auto; padding: 1rem; }
    .book-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem; background-color: #ffffff; transition: opacity 0.3s; }
    .book-info { display: flex; gap: 1rem; align-items: center; }
    .book-info img { width: 80px; height: 100px; object-fit: cover; border-radius: 4px; }
    .actions { display: flex; align-items: center; gap: 0.5rem; }
    .no-books { text-align: center; color: #6b7280; font-style: italic; margin-top: 1rem; }
    .inactive { opacity: 0.5; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  books: BookWithUpdate[] = [];

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (res: Book[]) => this.books = res.map(b => ({ ...b, isUpdating: false })),
      error: (err: any) => alert(err?.error?.message || 'Failed to load books')
    });
  }

  toggleApproved(book: BookWithUpdate): void {
    const oldStatus = book.isApproved ?? false;
    const newStatus = !oldStatus;

    // Optimistic update
    book.isApproved = newStatus;
    book.isUpdating = true;

    this.bookService.updateBookStatus(book.id, newStatus).subscribe({
      next: (updatedBook: Book) => {
        book.isApproved = updatedBook.isApproved ?? false;
        book.isUpdating = false;
      },
      error: (err: any) => {
        book.isApproved = oldStatus;
        book.isUpdating = false;
        alert(err?.error?.message || 'Failed to update book status');
      }
    });
  }

  getFullFileUrl(path?: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
  }
}
