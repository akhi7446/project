import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;

  if (user && user.role?.toLowerCase() === 'admin') {
    return true; // ✅ allow admin
  }

  console.warn('⛔ Access denied. Admin role required.', user);
  return router.createUrlTree(['/']); // ✅ safer redirect
};
