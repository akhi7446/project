import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ Skip adding token for OpenLibrary requests
  if (req.url.includes('openlibrary.org')) {
    return next(req);
  }

  const raw = localStorage.getItem('user');
  const token = raw ? (JSON.parse(raw)?.token as string | undefined) : undefined;

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
