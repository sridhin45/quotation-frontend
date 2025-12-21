import { Routes } from '@angular/router';
import { LoginComponent } from './quotations/login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'register',
    loadComponent: () =>
      import('./quotations/register/register.component')
        .then(m => m.RegisterComponent)
  },

  {
    path: 'quotations',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./quotations/quotation-list/quotation-list.component')
        .then(m => m.QuotationListComponent)
  },

  {
    path: 'quotations/add',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./quotations/quotation-add/quotation-add.component')
        .then(m => m.QuotationAddComponent)
  },

  {
    path: 'quotations/edit/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./quotations/quotation-add/quotation-add.component')
        .then(m => m.QuotationAddComponent)
  },

  {
    path: 'quotations/view/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./quotations/quotation-view/quotation-view.component')
        .then(m => m.QuotationViewComponent)
  },

  {
    path: 'quotations/item-list',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./quotations/item-list/item-list.component')
        .then(m => m.ItemListComponent)
  },
  {
  path:'users',
  canActivate:[AuthGuard],
  loadComponent:()=>import('./quotations/users/users.component')
    .then(m=>m.UsersComponent)
},


{ path: '', redirectTo:'quotations', pathMatch:'full' },
];
