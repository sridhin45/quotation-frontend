import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuotationService } from '../../services/quotation.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-quotation-add',
  standalone: true,              // <-- Must be TRUE for Standalone
  imports: [
    FormsModule,                 // <-- Fixes ngModel
    CommonModule                 // <-- Fixes *ngIf, *ngFor
  ],
  templateUrl: './quotation-add.component.html',
  styleUrls: ['./quotation-add.component.css']
})

export class QuotationAddComponent {

  customerName = '';
  customerPhone = '';
  salesmanName = '';
  tax: number = 0;

  items = [
    { description: '', quantity: 1, unit_price: 0, imageFile: null }
  ];

  // projectImageFile: File | null = null;

  constructor(private qs: QuotationService) {}

  addItem() {
    this.items.push({ description: '', quantity: 1, unit_price: 0, imageFile: null });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  onItemImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) this.items[index].imageFile = file;
  }

  // onProjectImageSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) this.projectImageFile = file;
  // }

  submit() {
    if (!this.customerName || !this.salesmanName) {
      alert('Customer and Salesman are required');
      return;
    }

    const itemsJson = this.items.map(x => ({
      description: x.description,
      quantity: x.quantity,
      unit_price: x.unit_price
    }));

    const formData = new FormData();

    formData.append("customer_name", this.customerName);
    formData.append("customer_phone", this.customerPhone);
    formData.append("salesman_name", this.salesmanName);
    formData.append("tax", this.tax.toString());
    formData.append("items", JSON.stringify(itemsJson));

    // Append item images
    this.items.forEach(item => {
      if (item.imageFile) {
        formData.append("item_images", item.imageFile);
      }
    });

    // Append project image
    // if (this.projectImageFile) {
    //   formData.append("project_image", this.projectImageFile);
    // }

    this.qs.createQuotation(formData).subscribe({
      next: res => {
        alert("Quotation created successfully!");
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        alert("Error creating quotation: " + (err.error?.detail || err.message));
      }
    });
  }
}
