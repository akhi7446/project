// src/app/core/guards/author.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;

  if (user && user.token && user.role === 'Author') {
    return true; // logged in & role = Author → allow
  }

  // not an author → redirect to home
  router.navigate(['/']);
  return false;
};
