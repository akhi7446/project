import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';
import { BookListComponent } from './components/book-list.component';
import { CartComponent } from './components/cart.component';
import { FavoritesComponent } from './components/favorites.component';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { ProfileComponent } from './components/profile.component';
import { AuthorDashboardComponent } from './components/author.component';
import { AdminBookRequestsComponent } from './components/admin-book-requests.component';
import { AuthorSubmitBookComponent } from './components/author-submit-book.component';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { authorGuard } from './core/guards/author.guard'; // ✅ added
import { AdminDashboardComponent } from './components/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent }, // default -> dashboard
  { path: 'books', component: BookListComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  // 🔹 Admin-only routes
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/requests', component: AdminBookRequestsComponent, canActivate: [adminGuard] },

  // 🔹 Author-only routes
  { path: 'author', component: AuthorDashboardComponent, canActivate: [authorGuard] },
  { path: 'author/submit-book', component: AuthorSubmitBookComponent, canActivate: [authorGuard] },

  // 🔹 Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🔹 Always keep wildcard LAST
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
