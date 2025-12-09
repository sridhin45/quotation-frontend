import { Routes } from '@angular/router';

export const routes: Routes = [

  // ADD NEW QUOTATION
  {
    path: 'quotations/add',
    loadComponent: () =>
      import('./quotations/quotation-add/quotation-add.component')
        .then(m => m.QuotationAddComponent)
  },

  // EDIT EXISTING QUOTATION
  {
    path: 'quotations/edit/:id',
    loadComponent: () =>
      import('./quotations/quotation-add/quotation-add.component')
        .then(m => m.QuotationAddComponent)
  },

  // LIST PAGE
  {
    path: 'quotations',
    loadComponent: () =>
      import('./quotations/quotation-list/quotation-list.component')
        .then(m => m.QuotationListComponent)
  },

  // VIEW PAGE
  {
    path: 'quotations/view/:id',
    loadComponent: () =>
      import('./quotations/quotation-view/quotation-view.component')
        .then(m => m.QuotationViewComponent)
  },

  // DEFAULT ROUTE
  { path: '**', redirectTo: 'quotations' }
];
