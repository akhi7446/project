import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';
import { BookListComponent } from './components/book-list.component';
import { CartComponent } from './components/cart.component';
import { FavoritesComponent } from './components/favorites.component';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { ProfileComponent } from './components/profile.component';
import { AdminAddBookComponent } from './components/admin-add-book.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { AuthorDashboardComponent } from './components/author.component'; // ✅ FIXED import
import { AdminBookRequestsComponent } from './components/admin-book-requests.component';
import { AuthorSubmitBookComponent } from './components/author-submit-book.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent }, // default -> dashboard
  { path: 'books', component: BookListComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  // 🔹 Admin-only routes
  { path: 'admin/add-book', component: AdminAddBookComponent, canActivate: [adminGuard] },
  { path: 'admin/requests', component: AdminBookRequestsComponent, canActivate: [adminGuard] },

  // 🔹 Author-only routes
  { path: 'author', component: AuthorDashboardComponent },
  { path: 'author/submit-book', component: AuthorSubmitBookComponent },

  // 🔹 Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // 🔹 Always keep wildcard LAST
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
