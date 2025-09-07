import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser; // safely access current user
  const isAdmin = user && user.role === 'Admin';

  if (isAdmin) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
