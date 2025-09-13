import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../core/services/cart.service';
import { CartItem } from '../core/models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-container">
      <h3>Your Cart</h3>

      <ng-container *ngIf="items.length; else empty">
        <div *ngFor="let item of items" class="cart-item">
          <div class="book-info">
            <div class="title">📖 {{ item.title }}</div>
            <div class="author">✍️ {{ item.authorName }}</div>
            <div class="price">₹ {{ item.price }}</div>
          </div>

          <div class="quantity-controls">
            <button (click)="decrement(item)">-</button>
            <span>{{ item.quantity }}</span>
            <button (click)="increment(item)">+</button>
          </div>

          <button class="delete-btn" (click)="remove(item.bookId)">🗑️</button>
        </div>

        <div class="cart-total">
          <span>Total:</span>
          <span>₹ {{ getTotal() }}</span>
        </div>

        <button class="btn-clear" (click)="clear()">Clear Cart</button>
      </ng-container>

      <ng-template #empty>
        <p class="empty-text">Your cart is empty.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 640px;
      margin: 2rem auto;
      padding: 1rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      font-family: Arial, sans-serif;
    }

    h3 { margin-bottom: 1rem; }

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding: 0.75rem 0;
      gap: 1rem;
    }

    .book-info { flex: 2; }
    .title { font-weight: bold; font-size: 1rem; }
    .author { font-size: 0.9rem; color: #555; }
    .price { font-weight: bold; color: #10b981; margin-top: 0.25rem; }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .quantity-controls button {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: #3b82f6;
      color: #fff;
      font-weight: bold;
      cursor: pointer;
    }

    .delete-btn {
      background: #ef4444;
      border: none;
      border-radius: 6px;
      padding: 0.3rem 0.6rem;
      cursor: pointer;
      color: #fff;
      font-size: 0.9rem;
    }

    .cart-total {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      margin-top: 1rem;
      font-size: 1.1rem;
    }

    .btn-clear {
      width: 100%;
      background: #ef4444;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 0.5rem;
      margin-top: 0.5rem;
      cursor: pointer;
    }

    .empty-text {
      text-align: center;
      color: #666;
      font-size: 1rem;
    }
  `]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.getCartItems().subscribe(res => this.items = res);
    this.cartService.loadCart();
  }

  increment(item: CartItem) {
    item.quantity += 1; // optimistic UI
    this.cartService.incrementQuantity(item.bookId).subscribe({
      error: () => item.quantity -= 1
    });
  }

  decrement(item: CartItem) {
    if (item.quantity === 1) {
      this.remove(item.bookId);
    } else {
      const prevQuantity = item.quantity;
      item.quantity -= 1; // optimistic
      this.cartService.decrementQuantity(item.bookId, prevQuantity).subscribe({
        error: () => item.quantity += 1
      });
    }
  }

  remove(bookId: number) {
    this.cartService.removeFromCart(bookId).subscribe(() => {
      this.items = this.items.filter(i => i.bookId !== bookId);
    });
  }

  clear() {
    this.cartService.clearCart().subscribe(() => this.items = []);
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
