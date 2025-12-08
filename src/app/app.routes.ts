import { Routes } from '@angular/router';
import { QuotationAddComponent } from './quotations/quotation-add/quotation-add.component';
import { QuotationListComponent } from './quotations/quotation-list/quotation-list.component';
import { QuotationViewComponent } from './quotations/quotation-view/quotation-view.component';

export const routes: Routes = [
  { path: 'quotations/add', component: QuotationAddComponent },
  { path: 'quotations', component: QuotationListComponent },
  { path: 'quotations/view/:id', component: QuotationViewComponent },
  { path: '**', redirectTo: 'quotations' }
];
