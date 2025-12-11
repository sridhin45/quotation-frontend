import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuotationService } from '../../services/quotation.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quotation-add',
  standalone: true,
  imports: [FormsModule, CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './quotation-add.component.html',
  styleUrls: ['./quotation-add.component.css']
})
export class QuotationAddComponent implements OnInit {

  isSubmitting = false;
  mode: 'add' | 'edit' = 'add';
  quotationId!: number;

  customerName = '';
  customerPhone = '';
  salesmanName = '';
  tax: number = 0;

  itemSuggestions: { [key: number]: any[] } = {};
  focusedIndex: number | null = null;

  backendImageBase = "https://quotation-backend-1-eewh.onrender.com/uploads/";

  items: any[] = [
    { description: '', quantity: 1, unit_price: 0, image: null, imageFile: null }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qs: QuotationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode = 'edit';
      this.quotationId = Number(id);
      this.loadQuotation();
    }
  }

  // ================= LOAD QUOTATION =================
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
          image: it.image,        // FILENAME ONLY
          imageFile: null         // no new upload
        }));
      }
    });
  }

  // ================= ADD / REMOVE ITEM =================
  addItem() {
    this.items.push({
      description: '',
      quantity: 1,
      unit_price: 0,
      image: null,
      imageFile: null
    });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  // ================= FILE UPLOAD (MANUAL IMAGE) =================
  onItemImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.items[index].imageFile = file;
      this.items[index].image = null;  // remove old dropdown filename
    }
  }

  // ================= AUTOCOMPLETE SEARCH =================
  onItemSearch(event: any, index: number) {
    const q = event.target.value.trim().toLowerCase();

    // hide dropdown on empty
    if (!q) {
      this.itemSuggestions[index] = [];
      this.focusedIndex = null;
      return;
    }

    this.qs.searchItems(q).subscribe((results: any[]) => {
      const filtered = results.filter(item =>
        item.name.toLowerCase().includes(q)
      );

      // if no match → allow manual typing
      if (filtered.length === 0) {
        this.itemSuggestions[index] = [];
        this.focusedIndex = null;
        return;
      }

      this.itemSuggestions[index] = filtered;
      this.focusedIndex = index;
    });
  }

  // ================= SELECT FROM DROPDOWN =================
  selectItemMaster(item: any, index: number) {
    this.items[index].description = item.name;
    this.items[index].unit_price = item.unit_price;

    this.items[index].image = item.image; // dropdown image filename
    this.items[index].imageFile = null;   // not a new upload

    this.itemSuggestions[index] = [];
    this.focusedIndex = null;
  }

  // ================= SUBMIT FORM =================
  submit() {

    // -------- VALIDATION --------
    if (!this.customerName.trim()) return alert("Customer name required");
    if (!this.salesmanName.trim()) return alert("Salesman name required");

    for (let i = 0; i < this.items.length; i++) {
      const it = this.items[i];

      if (!it.description.trim()) return alert(`Item ${i + 1}: Description required`);
      if (!it.quantity || it.quantity <= 0) return alert(`Item ${i + 1}: Quantity required`);
      if (!it.unit_price || it.unit_price <= 0) return alert(`Item ${i + 1}: Unit price required`);

      // MUST HAVE: dropdown image OR uploaded image
      if (!it.image && !it.imageFile) {
        return alert(`Item ${i + 1}: Image is required`);
      }
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // -------- FORMDATA --------
    const formData = new FormData();
    formData.append("customer_name", this.customerName);
    formData.append("customer_phone", this.customerPhone);
    formData.append("salesman_name", this.salesmanName);
    formData.append("tax", String(this.tax));

    // send item JSON (dropdown image kept)
    const itemsJson = this.items.map(it => ({
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      image: it.image // may be filename or null
    }));

    formData.append("items", JSON.stringify(itemsJson));

    // send ONLY uploaded images
    this.items.forEach(it => {
      if (it.imageFile) {
        formData.append("item_images", it.imageFile);
      }
    });

    // -------- API CALL --------
    const request = this.mode === 'add'
      ? this.qs.createQuotation(formData)
      : this.qs.updateQuotation(this.quotationId, formData);

    request.subscribe({
      next: () => {
        alert(`Quotation ${this.mode === 'add' ? 'created' : 'updated'} successfully!`);
        this.router.navigate(['/quotations']);
      },
      error: (err) => {
        alert("Error: " + (err.error?.detail || err.message));
        this.isSubmitting = false;
      }
    });
  }

  previewImage(file: File) {
    return URL.createObjectURL(file);
  }
}
