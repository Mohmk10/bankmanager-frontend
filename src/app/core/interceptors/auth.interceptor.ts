import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // URLs publiques qui ne nécessitent pas de token
  const publicUrls = ['/auth/login', '/auth/register'];
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));


  let authReq = req;
  if (token && !isPublicUrl) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }


  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401 && !isPublicUrl) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
