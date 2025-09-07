import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

      <form (ngSubmit)="onRegister()" enctype="multipart/form-data">
        <div class="grid grid-2">
          <div>
            <label>First Name *</label>
            <input class="input" [(ngModel)]="firstName" name="firstName" required />
          </div>
          <div>
            <label>Last Name *</label>
            <input class="input" [(ngModel)]="lastName" name="lastName" required />
          </div>
        </div>

        <div class="space"></div>
        <label>Username *</label>
        <input class="input" [(ngModel)]="username" name="username" required />

        <div class="space"></div>
        <label>Email *</label>
        <input class="input" type="email" [(ngModel)]="email" name="email" required />

        <div class="space"></div>
        <label>Phone *</label>
        <input class="input" [(ngModel)]="phoneNumber" name="phoneNumber" required />

        <div class="space"></div>
        <label>Password *</label>
        <input class="input" type="password" [(ngModel)]="password" name="password" required />

        <div class="space"></div>
        <label>Profile Image</label>
        <input type="file" (change)="onFileSelected($event)" />

        <div class="space"></div>
        <button class="btn" type="submit" style="width:100%;">Register</button>
      </form>
    </div>
  `
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  phoneNumber = '';
  selectedFile: File | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onRegister() {
    console.log('Registering with:', {
      username: this.username,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      file: this.selectedFile
    });

    this.auth.register(
      this.username,
      this.email,
      this.password,
      this.firstName,
      this.lastName,
      this.phoneNumber,
      this.selectedFile ?? undefined
    ).subscribe({
      next: () => {
        alert('Registration successful');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        alert('Registration failed. Please check required fields.');
      }
    });
  }
}
