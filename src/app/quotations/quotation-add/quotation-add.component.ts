import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuotationService } from '../../services/quotation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-quotation-add',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './quotation-add.component.html',
  styleUrls: ['./quotation-add.component.css']
})
export class QuotationAddComponent implements OnInit {

  mode: 'add' | 'edit' = 'add';
  quotationId!: number;

  customerName = '';
  customerPhone = '';
  salesmanName = '';
  tax: number = 0;

  items: any[] = [
    { description: '', quantity: 1, unit_price: 0, image: null, imageFile: null }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qs: QuotationService
  ) {}

  ngOnInit(): void {

    // Detect ADD or EDIT mode
    if (this.route.snapshot.paramMap.get('id')) {
      this.mode = 'edit';
      this.quotationId = Number(this.route.snapshot.paramMap.get('id'));
      this.loadQuotation();
    }
  }

  // ---------------- LOAD QUOTATION (EDIT MODE) ----------------
  loadQuotation() {
    this.qs.getQuotation(this.quotationId).subscribe({
      next: (data: any) => {
        this.customerName = data.customer_name;
        this.customerPhone = data.customer_phone;
        this.salesmanName = data.salesman_name;
        this.tax = data.tax;

        this.items = data.items.map((it: any) => ({
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          image: it.image,
          imageFile: null
        }));
      }
    });
  }

  // ---------------- ADD ITEM ----------------
  addItem() {
    this.items.push({
      description: '',
      quantity: 1,
      unit_price: 0,
      image: null,
      imageFile: null
    });
  }

  // ---------------- REMOVE ITEM ----------------
  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  // ---------------- FILE SELECT ----------------
  onItemImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) this.items[index].imageFile = file;
  }

  // ---------------- SUBMIT FORM ----------------
  submit() {
    const formData = new FormData();

    formData.append("customer_name", this.customerName);
    formData.append("customer_phone", this.customerPhone);
    formData.append("salesman_name", this.salesmanName);
    formData.append("tax", this.tax.toString());

    const itemsJson = this.items.map((it: any) => ({
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      image: it.image
    }));

    formData.append("items", JSON.stringify(itemsJson));

    this.items.forEach(item => {
      if (item.imageFile) {
        formData.append("item_images", item.imageFile);
      }
    });

    // ---------- ADD MODE ----------
    if (this.mode === 'add') {
      this.qs.createQuotation(formData).subscribe({
        next: () => {
          alert("Quotation created!");
          this.router.navigate(['/quotations']);
        },
        error: (err: HttpErrorResponse) =>
          alert("Create failed: " + (err.error?.detail || err.message))
      });

      return;
    }

    // ---------- EDIT MODE ----------
    this.qs.updateQuotation(this.quotationId, formData).subscribe({
      next: () => {
        alert("Quotation updated!");
        this.router.navigate(['/quotations/view', this.quotationId]);
      },
      error: (err: HttpErrorResponse) =>
        alert("Update failed: " + (err.error?.detail || err.message))
    });
  }
}