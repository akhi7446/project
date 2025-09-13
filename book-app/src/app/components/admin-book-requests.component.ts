// src/app/components/admin-book-requests.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, BookRequest } from '../core/services/book.service';
import { environment } from '../environments/environment';

// Extend BookRequest with optional error message
interface BookRequestWithError extends BookRequest {
  errorMessage?: string;
}

@Component({
  selector: 'app-admin-book-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1 class="title">Pending Book Requests</h1>

      <div *ngIf="requests.length === 0" class="no-requests">
        🎉 No pending requests at the moment
      </div>

      <div class="request-list">
        <div *ngFor="let r of requests" class="request-card">
          <div class="request-header">
            <h3 class="book-title">{{ r.title }}</h3>
            <span class="genre-badge">{{ r.genre || 'N/A' }}</span>
          </div>

          <div class="request-body">
            <div class="cover-section">
              <img *ngIf="r.coverImageUrl" [src]="getFullFileUrl(r.coverImageUrl)" alt="cover" class="cover-image" />
              <div *ngIf="!r.coverImageUrl" class="no-cover">No Image</div>
            </div>

            <div class="details">
              <p><strong>Author:</strong> {{ r.authorName || 'Unknown' }}</p>
              <p><strong>Price:</strong> {{ r.price | currency:'USD' }}</p>
              <p class="description">{{ r.description || 'No description provided' }}</p>
              <p *ngIf="r.samplePdfUrl" class="pdf-link">
                <a [href]="getFullFileUrl(r.samplePdfUrl)" target="_blank">📄 View Sample PDF</a>
              </p>
            </div>
          </div>

          <div class="actions">
            <button class="btn approve" (click)="approve(r.id)">Approve</button>
            <button class="btn reject" (click)="reject(r.id)">Reject</button>
          </div>

          <p *ngIf="r.errorMessage" class="error-message">
            ⚠ {{ r.errorMessage }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1000px; margin: 2rem auto; padding: 1rem; }
    .title { text-align: center; font-size: 2rem; font-weight: bold; margin-bottom: 2rem; color: #111827; }

    .no-requests { text-align: center; color: #6b7280; font-style: italic; font-size: 1.1rem; margin-top: 1rem; }

    .request-list { display: flex; flex-direction: column; gap: 1.5rem; }

    .request-card { background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; }
    .request-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }

    .request-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .book-title { font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0; }
    .genre-badge { background-color: #3b82f6; color: white; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.85rem; }

    .request-body { display: flex; gap: 1rem; flex-wrap: wrap; }
    .cover-section { flex: 0 0 120px; display: flex; align-items: center; justify-content: center; }
    .cover-image { width: 120px; height: 160px; object-fit: cover; border-radius: 6px; }
    .no-cover { width: 120px; height: 160px; background: #f3f4f6; color: #9ca3af; display: flex; justify-content: center; align-items: center; border-radius: 6px; font-size: 0.85rem; text-align: center; }

    .details { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
    .description { color: #374151; font-size: 0.95rem; margin-top: 0.25rem; }
    .pdf-link a { color: #2563eb; text-decoration: underline; }

    .actions { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
    .btn { flex: 1; padding: 0.6rem 0.8rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; color: white; transition: background 0.2s; }
    .approve { background-color: #10b981; }
    .approve:hover { background-color: #059669; }
    .reject { background-color: #ef4444; }
    .reject:hover { background-color: #dc2626; }

    .error-message { color: #b91c1c; font-size: 0.85rem; margin-top: 0.5rem; }

    @media (max-width: 640px) {
      .request-body { flex-direction: column; align-items: flex-start; }
      .cover-section { margin-bottom: 0.5rem; }
      .actions { flex-direction: column; }
    }
  `]
})
export class AdminBookRequestsComponent implements OnInit {
  requests: BookRequestWithError[] = [];

  constructor(private bookService: BookService) {}

  ngOnInit() { this.loadRequests(); }

  loadRequests() {
    this.bookService.getPendingBookRequests().subscribe({
      next: res => this.requests = res.map(r => ({ ...r, errorMessage: '' })),
      error: err => alert(err?.error?.message || 'Failed to load requests')
    });
  }

  approve(id: number) {
    this.clearRequestError(id);
    this.bookService.approveBookRequest(id).subscribe({
      next: () => this.requests = this.requests.filter(r => r.id !== id),
      error: err => this.setRequestError(id, err?.error?.message || 'Failed to approve request')
    });
  }

  reject(id: number) {
    this.clearRequestError(id);
    this.bookService.rejectBookRequest(id).subscribe({
      next: () => this.requests = this.requests.filter(r => r.id !== id),
      error: err => this.setRequestError(id, err?.error?.message || 'Failed to reject request')
    });
  }

  getFullFileUrl(path?: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${environment.apiUrl.replace(/\/api$/, '')}${path}`;
  }

  private setRequestError(id: number, message: string) {
    const req = this.requests.find(r => r.id === id);
    if (req) req.errorMessage = message;
  }

  private clearRequestError(id: number) {
    const req = this.requests.find(r => r.id === id);
    if (req) req.errorMessage = '';
  }
}
