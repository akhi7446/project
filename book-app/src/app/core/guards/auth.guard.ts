// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;

  if (user && user.token) {
    return true; // logged in → allow
  }

  // not logged in → redirect to login page
  router.navigate(['/login']);
  return false;
};
