import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;

  if (user && user.token) {
    return true;
  }

  // not logged in → redirect to login
  router.navigate(['/login']);
  return false;
};
