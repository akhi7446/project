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
    <div class="card" style="max-width:900px; margin:2rem auto; padding:1.5rem;">
      <h2>Author Dashboard</h2>
      <p>Welcome, {{ user?.username }}!</p>

      <button class="btn" style="margin:1rem 0;" (click)="goToSubmitBook()">
        ➕ Submit New Book
      </button>

      <h3>📚 My Submitted Books</h3>

      <div *ngIf="myRequests.length === 0">
        <p>No submissions yet.</p>
      </div>

      <div *ngIf="myRequests.length > 0">
        <div *ngFor="let req of myRequests" class="book-card">
          <img
            *ngIf="req.coverImageUrl; else noCover"
            [src]="normalizeUrl(req.coverImageUrl)"
            alt="Cover"
          />
          <ng-template #noCover>
            <div class="no-cover">No Image</div>
          </ng-template>

          <div class="book-info">
            <strong>{{ req.title }}</strong> - {{ req.genre }} - 💲{{ req.price }}
            <p>Status: 
              <span [ngClass]="{
                'status-pending': req.status === 'Pending',
                'status-approved': req.status === 'Approved',
                'status-rejected': req.status === 'Rejected'
              }">{{ req.status }}</span>
            </p>
            <p *ngIf="req.samplePdfUrl">
              <a [href]="normalizeUrl(req.samplePdfUrl)" target="_blank">View Sample PDF</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-card { display: flex; gap: 1rem; margin: 0.5rem 0; padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px; align-items: center; }
    .book-card img { width: 80px; height: 100px; object-fit: cover; border-radius: 4px; }
    .no-cover { width: 80px; height: 100px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; border-radius: 4px; font-size: 12px; }
    .book-info { flex: 1; }
    .status-pending { color: orange; font-weight: bold; }
    .status-approved { color: green; font-weight: bold; }
    .status-rejected { color: red; font-weight: bold; }
  `]
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
      this.bookService.getMyBookRequests().subscribe({
        next: (requests) => {
          this.myRequests = requests;
        },
        error: (err) => {
          console.error('Failed to load my submissions', err);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToSubmitBook() {
    this.router.navigate(['/author/submit-book']);
  }

  // Ensures proper full URL for images or PDFs
  normalizeUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `https://localhost:7000${path}`;
  }
}
