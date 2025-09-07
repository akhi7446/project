import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../core/services/cart.service';
import { CartItem } from '../core/models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" style="padding:1rem;">
      <h3>Your Cart</h3>
      <div class="space"></div>
      <div *ngIf="items.length; else empty">
        <div *ngFor="let item of items" class="row" style="justify-content: space-between;">
          <div>
            <div><strong>{{ item.book?.title }}</strong></div>
            <div class="muted">x{{ item.quantity }}</div>
          </div>
          <button class="btn" style="background:#ef4444" (click)="remove(item.bookId)">Remove</button>
        </div>
        <div class="space"></div>
        <button class="btn" style="background:#ef4444" (click)="clear()">Clear Cart</button>
      </div>
      <ng-template #empty><p class="muted">Your cart is empty.</p></ng-template>
    </div>
  `
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  constructor(private cart: CartService) {}
  ngOnInit() { this.load(); }
  load() { this.cart.getCart().subscribe(res => this.items = res); }
  remove(bookId: number) { this.cart.removeFromCart(bookId).subscribe(() => this.load()); }
  clear() { this.cart.clearCart().subscribe(() => this.load()); }
}
