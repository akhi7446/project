import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../core/services/book.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-add-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" style="max-width:640px; margin:2rem auto; padding:1.5rem;">
      <h2>Add New Book (Admin)</h2>
      <form (ngSubmit)="onSubmit()" #bookForm="ngForm">

        <label>Title *</label>
        <input class="input" name="title" [(ngModel)]="book.title" required />

        <div class="space"></div>
        <label>Author *</label>
        <input class="input" name="authorName" [(ngModel)]="book.authorName" required />

        <div class="space"></div>
        <label>Description</label>
        <textarea class="input" name="description" [(ngModel)]="book.description"></textarea>

        <div class="space"></div>
        <label>Genre</label>
        <input class="input" name="genre" [(ngModel)]="book.genre" />

        <div class="space"></div>
        <label>Price</label>
        <input type="number" class="input" name="price" [(ngModel)]="book.price" required min="0" />

        <div class="space"></div>
        <label>Cover Image</label>
        <input type="file" (change)="onFileSelected($event)" />

        <div class="space"></div>
        <button class="btn" type="submit" [disabled]="bookForm.invalid">Add Book</button>
      </form>
    </div>
  `
})
export class AdminAddBookComponent {
  book = {
    title: '',
    authorName: '',
    description: '',
    genre: '',
    price: 0
  };

  selectedFile: File | null = null;

  constructor(private bookService: BookService, private router: Router) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('title', this.book.title);
    formData.append('authorName', this.book.authorName);
    formData.append('description', this.book.description);
    formData.append('genre', this.book.genre);
    formData.append('price', this.book.price.toString());
    if (this.selectedFile) {
      formData.append('coverImage', this.selectedFile);
    }

    this.bookService.create(formData).subscribe({
      next: () => {
        alert('✅ Book added successfully!');
        this.router.navigate(['/admin']); // better redirect for Admins
      },
      error: (err) => {
        console.error('Book creation failed', err);
        alert('❌ Failed to add book. Please try again.');
      }
    });
  }
}
