import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../core/services/book.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-author-submit-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" style="max-width:640px; margin:2rem auto; padding:1.2rem;">
      <h3>Submit a Book Request</h3>
      <form (ngSubmit)="submitRequest()" enctype="multipart/form-data">
        
        <div class="space"></div>
        <label>Title *</label>
        <input class="input" [(ngModel)]="title" name="title" required />

        <div class="space"></div>
        <label>Author Name *</label>
        <input class="input" [(ngModel)]="authorName" name="authorName" required readonly />

        <div class="space"></div>
        <label>Description *</label>
        <textarea class="input" [(ngModel)]="description" name="description" required></textarea>

        <div class="space"></div>
        <label>Genre *</label>
        <select class="input" [(ngModel)]="genre" name="genre" required>
          <option value="" disabled selected>Select a genre</option>
          <option *ngFor="let g of genres" [value]="g">{{ g }}</option>
        </select>

        <div class="space"></div>
        <label>Price *</label>
        <input class="input" type="number" [(ngModel)]="price" name="price" required />

        <div class="space"></div>
        <label>Upload Cover Image</label>
        <input type="file" (change)="onCoverImageSelected($event)" accept="image/*" />

        <div class="space"></div>
        <label>Upload Sample PDF (5–6 pages)</label>
        <input type="file" (change)="onSamplePdfSelected($event)" accept="application/pdf" />

        <div class="space"></div>
        <button class="btn" type="submit" style="width:100%;">Submit Request</button>
      </form>
    </div>
  `
})
export class AuthorSubmitBookComponent implements OnInit {
  title = '';
  authorName = '';
  description = '';
  genre = '';
  price: number | null = null;

  coverImageFile: File | null = null;
  samplePdfFile: File | null = null;

  // ✅ Dropdown options
  genres: string[] = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Romance', 'Mystery', 'Biography', 'Fantasy', 'Adventure'];

  constructor(
    private bookService: BookService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) {
      this.authorName = user.username;
    } else {
      alert('Please login first.');
      this.router.navigate(['/login']);
    }
  }

  onCoverImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      this.coverImageFile = file;
    }
  }

  onSamplePdfSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.samplePdfFile = file;
    } else {
      alert('Please upload a valid PDF file.');
      this.samplePdfFile = null;
    }
  }

  submitRequest() {
    if (!this.title || !this.authorName || !this.description || !this.genre || this.price == null) {
      alert('Please fill all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('Title', this.title);
    formData.append('AuthorName', this.authorName);
    formData.append('Description', this.description);
    formData.append('Genre', this.genre);
    formData.append('Price', String(this.price));

    if (this.coverImageFile) {
      formData.append('CoverImage', this.coverImageFile);
    }

    if (this.samplePdfFile) {
      formData.append('SamplePdf', this.samplePdfFile);
    }

    this.bookService.submitBookRequest(formData).subscribe({
      next: () => {
        alert('✅ Book request submitted!');
        this.router.navigate(['/author']);
      },
      error: (err) => {
        console.error('❌ Failed to submit request', err);
        if (err.status === 401) {
          alert('Unauthorized. Please login again.');
          this.auth.logout();
          this.router.navigate(['/login']);
        } else {
          alert('Failed to submit request. Please check console for details.');
        }
      }
    });
  }
}
