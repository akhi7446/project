import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService, BookRequest } from '../core/services/book.service';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-author-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" style="max-width:800px; margin:2rem auto; padding:1.5rem;">
      <h2>Author Dashboard</h2>
      <p>Welcome, {{ user?.username }}!</p>

      <button class="btn" style="margin:1rem 0;" (click)="goToSubmitBook()">
        ➕ Submit New Book
      </button>

      <h3>📚 My Submitted Books</h3>

      <div *ngIf="myRequests.length === 0">
        <p>No submissions yet.</p>
      </div>

      <ul *ngIf="myRequests.length > 0">
        <li *ngFor="let req of myRequests" style="margin:0.5rem 0; padding:0.5rem; border:1px solid #ddd; border-radius:6px;">
          <strong>{{ req.title }}</strong> - {{ req.genre }} - 💲{{ req.price }}
          <br />
          <small>Status: <b>{{ req.status }}</b></small>
        </li>
      </ul>
    </div>
  `
})
export class AuthorDashboardComponent implements OnInit {
  user: any;
  myRequests: BookRequest[] = [];

  constructor(
    private bookService: BookService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.user();

    if (this.user) {
      // ✅ call backend /api/book/my-requests
      this.bookService.getMyBookRequests().subscribe({
        next: (requests) => {
          this.myRequests = requests;
        },
        error: (err) => {
          console.error('Failed to load my submissions', err);
        }
      });
    }
  }

  goToSubmitBook() {
    this.router.navigate(['/author/submit-book']);
  }
}
