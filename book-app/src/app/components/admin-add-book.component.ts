import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../core/services/book.service';
import { Book, Author, Category } from '../core/models/models';

@Component({
  selector: 'app-admin-add-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" style="max-width:720px; margin:2rem auto; padding:1.2rem;">
      <h3>Add a new book</h3>
      <div class="space"></div>
      <form (ngSubmit)="save()">
        <label>Title</label>
        <input class="input" [(ngModel)]="model.title" name="title" required />
        <div class="space"></div>

        <label>Description</label>
        <textarea
          class="input"
          [(ngModel)]="model.description"
          name="description"
          rows="4"
        ></textarea>
        <div class="space"></div>

        <div class="grid grid-2">
          <div>
            <label>Price</label>
            <input
              class="input"
              type="number"
              [(ngModel)]="model.price"
              name="price"
              required
            />
          </div>
          <div>
            <label>Genre</label>
            <input class="input" [(ngModel)]="model.genre" name="genre" />
          </div>
        </div>
        <div class="space"></div>

        <div class="grid grid-2">
          <div>
            <label>Author</label>
            <select class="input" [(ngModel)]="model.authorId" name="authorId" required>
              <option value="">-- Select Author --</option>
              <option *ngFor="let a of authors" [value]="a.id">{{ a.name }}</option>
            </select>
          </div>
          <div>
            <label>Category</label>
            <select class="input" [(ngModel)]="model.categoryId" name="categoryId" required>
              <option value="">-- Select Category --</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>
        <div class="space"></div>

        <label>Image URL</label>
        <input
          class="input"
          [(ngModel)]="model.imageUrl"
          name="imageUrl"
          placeholder="https://..."
        />
        <div class="space"></div>

        <button class="btn" type="submit" style="width:100%;">Save</button>
      </form>
    </div>
  `,
})
export class AdminAddBookComponent implements OnInit {
  model: Partial<Book> = {
    title: '',
    description: '',
    price: 0,
    genre: '',
    authorId: undefined,
    categoryId: undefined,
    imageUrl: '',
  };

  authors: Author[] = [];
  categories: Category[] = [];

  constructor(private book: BookService, private router: Router) {}

  ngOnInit() {
    this.loadAuthors();
    this.loadCategories();
  }

  loadAuthors() {
    this.book.getAuthors().subscribe({
      next: (res) => (this.authors = res),
      error: (err) => console.error('Failed to load authors', err),
    });
  }

  loadCategories() {
    this.book.getCategories().subscribe({
      next: (res) => (this.categories = res),
      error: (err) => console.error('Failed to load categories', err),
    });
  }

  save() {
    if (!this.model.authorId || !this.model.categoryId) {
      alert('Please select an author and a category');
      return;
    }

    this.book.create(this.model).subscribe({
      next: () => this.router.navigate(['/books']),
      error: (err) => {
        console.error(err);
        alert('Failed to add book');
      },
    });
  }
}
