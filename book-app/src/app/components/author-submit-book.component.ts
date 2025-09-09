import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService, CreateBookRequest } from '../core/services/book.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-author-submit-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" style="max-width:640px; margin:2rem auto; padding:1.2rem;">
      <h3>Submit a Book Request</h3>
      <form (ngSubmit)="submitRequest()">
        
        <div class="space"></div>
        <label>Title *</label>
        <input class="input" [(ngModel)]="title" name="title" required />

        <div class="space"></div>
        <label>Author Name *</label>
        <input class="input" [(ngModel)]="authorName" name="authorName" required />

        <div class="space"></div>
        <label>Description *</label>
        <textarea class="input" [(ngModel)]="description" name="description" required></textarea>

        <div class="space"></div>
        <label>Cover Image URL</label>
        <input class="input" [(ngModel)]="coverImageUrl" name="coverImageUrl" />

        <div class="space"></div>
        <label>Genre *</label>
        <input class="input" [(ngModel)]="genre" name="genre" required />

        <div class="space"></div>
        <label>Price *</label>
        <input class="input" type="number" [(ngModel)]="price" name="price" required />

        <div class="space"></div>
        <button class="btn" type="submit" style="width:100%;">Submit Request</button>
      </form>
    </div>
  `
})
export class AuthorSubmitBookComponent {
  title = '';
  authorName = '';
  description = '';
  coverImageUrl = '';
  genre = '';
  price!: number;

  constructor(
    private bookService: BookService,
    private auth: AuthService,
    private router: Router
  ) {}

  submitRequest() {
    const user = this.auth.user();
    if (!user) {
      alert('You must be logged in as an author.');
      return;
    }

    // ✅ Use CreateBookRequest (matches backend)
    const request: CreateBookRequest = {
      title: this.title,
      authorName: this.authorName,
      description: this.description,
      coverImageUrl: this.coverImageUrl || '',
      genre: this.genre,
      price: Number(this.price),
    };

    this.bookService.submitBookRequest(request).subscribe({
      next: () => {
        alert('Book request submitted!');
        this.router.navigate(['/author']);
      },
      error: (err) => {
        console.error('Failed to submit request', err);
        alert('Failed to submit request.');
      }
    });
  }
}
