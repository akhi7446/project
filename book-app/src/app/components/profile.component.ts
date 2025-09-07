import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" style="max-width:720px; margin:2rem auto; padding:1.2rem;" *ngIf="user">

      <!-- Header -->
      <div class="row" style="gap:1rem; align-items:center;">
        <img
          [src]="user.profileImageUrl || defaultAvatar "
          alt="Profile"
          class="avatar"
          style="width:80px; height:80px; border-radius:50%; object-fit:cover;"
        />

        <div>
          <h3 style="margin:0;">{{ user.firstName || user.username }} {{ user.lastName || '' }}</h3>
          <div class="muted">{{ user.email }}</div>
        </div>
      </div>

      <div class="space"></div>

      <!-- Profile info -->
      <div class="grid grid-2">
        <div><strong>Username</strong><div class="muted">{{ user.username }}</div></div>
        <div><strong>Phone</strong><div class="muted">{{ user.phoneNumber || '-' }}</div></div>
        <div><strong>Role</strong><div class="muted">{{ user.role || 'User' }}</div></div>
      </div>

      <div class="space"></div>
      <hr/>
      <div class="space"></div>

      <!-- Edit form -->
      <form (ngSubmit)="save()" style="display:grid; gap:.75rem;">
        <h4 style="margin:0 0 .25rem 0;">Edit details</h4>

        <label>First Name</label>
        <input class="input" type="text" [(ngModel)]="firstName" name="firstName"/>

        <label>Last Name</label>
        <input class="input" type="text" [(ngModel)]="lastName" name="lastName"/>

        <label>Phone</label>
        <input class="input" type="text" [(ngModel)]="phoneNumber" name="phoneNumber"/>

        <button class="btn" type="submit" [disabled]="saving">
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>
      </form>

      <div class="space"></div>
      <hr/>
      <div class="space"></div>

      <!-- Image upload -->
      <div style="display:grid; gap:.75rem;">
        <h4 style="margin:0 0 .25rem 0;">Profile photo</h4>

        <input type="file" accept="image/*" (change)="onFileSelected($event)"/>

        <div *ngIf="previewUrl" style="display:flex; align-items:center; gap:1rem;">
          <img [src]="previewUrl" alt="Preview" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:1px solid #eee;"/>
          <span class="muted">Preview</span>
        </div>

        <button class="btn" (click)="upload()" [disabled]="!selectedFile || uploading">
          {{ uploading ? 'Uploading...' : 'Upload new photo' }}
        </button>
      </div>

      <div class="space"></div>

      <p *ngIf="message" style="color:#065f46;">{{ message }}</p>
      <p *ngIf="error" style="color:#991b1b;">{{ error }}</p>
    </div>

    <ng-template #loading>
      <p>Loading profile...</p>
    </ng-template>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  defaultAvatar = '../../assets/default-avatar.png';

  // editable fields
  firstName = '';
  lastName = '';
  phoneNumber = '';

  // image upload
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // ui state
  saving = false;
  uploading = false;
  message = '';
  error = '';

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: u => {
        this.user = u;
        this.firstName = u.firstName || '';
        this.lastName = u.lastName || '';
        this.phoneNumber = u.phoneNumber || '';
      },
      error: () => {
        this.user = this.auth.currentUser;
        if (this.user) {
          this.firstName = this.user.firstName || '';
          this.lastName  = this.user.lastName || '';
          this.phoneNumber = this.user.phoneNumber || '';
        }
      }
    });
  }

  save() {
    this.clearFeedback();
    this.saving = true;
    this.auth.updateProfile(this.firstName, this.lastName, this.phoneNumber).subscribe({
      next: updated => {
        this.user = updated;
        this.message = 'Profile updated successfully.';
        this.saving = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to update profile.';
        this.saving = false;
      }
    });
  }

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.selectedFile = input.files[0];
    this.previewUrl = URL.createObjectURL(this.selectedFile);
  }

  upload() {
    if (!this.selectedFile) return;
    this.clearFeedback();
    this.uploading = true;
    this.auth.uploadProfileImage(this.selectedFile).subscribe({
      next: res => {
        if (this.user) this.user.profileImageUrl = res.imageUrl; // absolute URL from API
        this.message = 'Profile image updated.';
        this.uploading = false;
        // cleanup preview blob
        if (this.previewUrl) {
          URL.revokeObjectURL(this.previewUrl);
          this.previewUrl = null;
        }
        this.selectedFile = null;
      },
      error: err => {
        console.error(err);
        this.error = 'Failed to upload image.';
        this.uploading = false;
      }
    });
  }

  private clearFeedback() {
    this.message = '';
    this.error = '';
  }
}
