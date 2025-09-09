import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" style="max-width:640px; margin:2rem auto; padding:1.2rem;">
      <h3>Create your account</h3>
      <div class="space"></div>

      <form #registerForm="ngForm" (ngSubmit)="onRegister(registerForm)" enctype="multipart/form-data">
        <div class="grid grid-2">
          <div>
            <label>First Name *</label>
            <input class="input" [(ngModel)]="firstName" name="firstName" required />
            <small class="error" *ngIf="registerForm.submitted && !firstName.trim()">First name is required</small>
          </div>
          <div>
            <label>Last Name *</label>
            <input class="input" [(ngModel)]="lastName" name="lastName" required />
            <small class="error" *ngIf="registerForm.submitted && !lastName.trim()">Last name is required</small>
          </div>
        </div>

        <div class="space"></div>
        <label>Username *</label>
        <input class="input" [(ngModel)]="username" name="username" required />
        <small class="error" *ngIf="registerForm.submitted && !username.trim()">Username is required</small>

        <div class="space"></div>
        <label>Email *</label>
        <input class="input" type="email" [(ngModel)]="email" name="email" required email />
        <small class="error" *ngIf="registerForm.submitted && !email.trim()">Email is required</small>

        <div class="space"></div>
        <label>Phone *</label>
        <input class="input" [(ngModel)]="phoneNumber" name="phoneNumber" required />
        <small class="error" *ngIf="registerForm.submitted && !phoneNumber.trim()">Phone is required</small>

        <div class="space"></div>
        <label>Password *</label>
        <input class="input" type="password" [(ngModel)]="password" name="password" required minlength="6" />
        <small class="error" *ngIf="registerForm.submitted && password.length < 6">
          Password must be at least 6 characters
        </small>

        <div class="space"></div>
        <label>Role *</label>
        <select class="input" [(ngModel)]="role" name="role" required>
          <option value="User">User</option>
          <option value="Author">Author</option>
        </select>

        <div class="space"></div>
        <label>Profile Image (optional)</label>
        <input type="file" (change)="onFileSelected($event)" />

        <div class="space"></div>
        <button class="btn" type="submit" style="width:100%;" [disabled]="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .error {
      color: red;
      font-size: 0.8rem;
    }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  phoneNumber = '';
  selectedFile: File | null = null;
  role: 'User' | 'Author' = 'User'; // ✅ restrict type
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onRegister(form: NgForm) {
    console.log('Register Clicked',form.value)
    if (!form.valid) {
      console.log('Form invalid')
      return;
    }

    this.loading = true;

    this.auth.register(
      this.username.trim(),
      this.email.trim(),
      this.password,
      this.firstName.trim(),
      this.lastName.trim(),
      this.phoneNumber.trim(),
      this.role, // ✅ only User or Author
      this.selectedFile ?? undefined
    ).subscribe({
      next: () => {
        alert(`Registration successful as ${this.role}`);
        this.router.navigate(['/login']);
        this.loading = false;
      },
      error: (err) => {
        console.error('Registration failed', err);
        alert(err?.error?.message || 'Registration failed. Please try again.');
        this.loading = false;
      }
    });
  }
}
