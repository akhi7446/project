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

export const routes: Routes = [
  { path: '', component: DashboardComponent }, // default -> dashboard
  { path: 'books', component: BookListComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'favorites', component: FavoritesComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin/add-book', component: AdminAddBookComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' } // ✅ safer fallback
];
