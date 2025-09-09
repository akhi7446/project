import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, BookRequest } from '../core/services/book.service';

@Component({
  selector: 'app-admin-book-requests',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" style="max-width:900px; margin:2rem auto; padding:1.2rem;">
      <h3>Pending Book Requests</h3>
      <div *ngIf="requests.length === 0">No pending requests.</div>

      <div *ngFor="let r of requests" class="card" style="margin:1rem 0; padding:1rem;">
        <h4>{{ r.title }}</h4>
        <p><strong>Author:</strong> {{ r.authorName }}</p>
        <p><strong>Genre:</strong> {{ r.genre }}</p>
        <p><strong>Price:</strong> {{ r.price | currency }}</p>
        <p>{{ r.description }}</p>
        <img *ngIf="r.coverImageUrl" [src]="r.coverImageUrl" alt="cover" style="max-width:120px; display:block; margin:.5rem 0;" />

        <div class="row" style="gap:.5rem;">
          <button class="btn" (click)="approve(r.id)">Approve</button>
          <button class="btn btn-danger" (click)="reject(r.id)">Reject</button>
        </div>
      </div>
    </div>
  `
})
export class AdminBookRequestsComponent implements OnInit {
  requests: BookRequest[] = [];

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.bookService.getBookRequests().subscribe({
      next: (res) => (this.requests = res.filter(r => r.status === 'Pending')),
      error: (err) => console.error('Failed to load requests', err)
    });
  }

  approve(id: number) {
    this.bookService.approveBookRequest(id).subscribe({
      next: () => this.loadRequests(),
      error: (err) => console.error('Failed to approve request', err)
    });
  }

  reject(id: number) {
    this.bookService.rejectBookRequest(id).subscribe({
      next: () => this.loadRequests(),
      error: (err) => console.error('Failed to reject request', err)
    });
  }
}
