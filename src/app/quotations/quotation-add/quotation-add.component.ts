import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuotationService } from '../../services/quotation.service';
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
  tax = 0;

  itemSuggestions: { [key: number]: any[] } = {};
  focusedIndex: number | null = null;

  // backendImageBase = 'https://quotation-backend-3.onrender.com/uploads/items/';

  items: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qs: QuotationService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.items = [this.createEmptyItem()];

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam !== null) {
      const id = Number(idParam);

      if (isNaN(id)) {
        alert('Invalid quotation ID');
        this.router.navigate(['/quotations']);
        return;
      }

      this.mode = 'edit';
      this.quotationId = id;
      this.loadQuotation();
    }
  }

  // ================= FACTORY =================
  createEmptyItem() {
    return {
      item_id: null,
      item_name: '',
      qty: 1,
      price: 0,
      total: 0,
      image: null,
      imageFile: null,
      previewUrl: null
    };
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
        item_id: it.item?.id ?? null,
        item_name: it.item?.name ?? '',
        qty: it.qty,
        price: it.price,
        total: it.total,
        image: it.item?.image ?? null,
        imageFile: null,
     previewUrl: it.item?.image || null

      }));
    },
    error: (err) => {
      console.error('Failed to load quotation', err);
      alert('Quotation not found or server error');
      this.router.navigate(['/quotations']);
    }
  });
}


  // ================= ITEMS =================
  addItem() {
    this.items.push(this.createEmptyItem());
  }

  removeItem(index: number) {
    this.revokePreviewUrl(this.items[index]);
    this.items.splice(index, 1);

    if (this.items.length === 0) {
      this.items.push(this.createEmptyItem());
    }
  }

  // ================= IMAGE =================
  onItemImageSelected(event: any, index: number) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.revokePreviewUrl(this.items[index]);

    this.items[index].imageFile = file;
    this.items[index].previewUrl = URL.createObjectURL(file);
    this.items[index].image = null;
  }

  revokePreviewUrl(item: any) {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
      item.previewUrl = null;
    }
  }

  // ================= AUTOCOMPLETE =================
  onItemSearch(event: any, index: number) {
    const q = event.target.value.trim().toLowerCase();

    if (!q) {
      this.itemSuggestions[index] = [];
      this.focusedIndex = null;
      return;
    }

    this.qs.searchItems(q).subscribe((results: any[]) => {
      const filtered = results.filter(r =>
        r.name.toLowerCase().includes(q)
      );

      this.itemSuggestions[index] = filtered;
      this.focusedIndex = filtered.length ? index : null;
    });
  }

  selectItemMaster(item: any, index: number) {
    this.revokePreviewUrl(this.items[index]);

    this.items[index] = {
      ...this.items[index],
      item_id: item.id,
      item_name: item.name,
      qty: 1,
      price: item.unit_price,
      total: item.unit_price,
      imageFile: null,
      image: item.image,
previewUrl: null

    };

    this.itemSuggestions[index] = [];
    this.focusedIndex = null;
  }

  // ================= CALC =================
  recalculate(index: number) {
    const it = this.items[index];
    it.total = it.qty * it.price;
  }

// ================= SUBMIT =================
submit() {
  if (this.isSubmitting) return;
  this.isSubmitting = true;

  if (!this.customerName.trim()) return this.fail('Customer name required');
  if (!this.salesmanName.trim()) return this.fail('Salesman name required');

  const payloadItems: any[] = [];
  const formData = new FormData();

  for (let i = 0; i < this.items.length; i++) {
    const it = this.items[i];

    if (!it.item_name.trim()) {
      return this.fail(`Item ${i + 1}: Name required`);
    }

    if (it.qty <= 0 || it.price <= 0) {
      return this.fail(`Item ${i + 1}: Invalid qty or price`);
    }

    const itemPayload: any = {
      qty: it.qty,
      price: it.price,
      total: it.qty * it.price,
      replace_image: !!it.imageFile
    };

    // ================= EXISTING ITEM =================
    if (it.item_id) {
      itemPayload.item_id = it.item_id;

      // ✅ IMPORTANT: append image if replacing
      if (it.imageFile) {
        formData.append('images', it.imageFile);
      }

    // ================= NEW ITEM =================
    } else {
      itemPayload.item_name = it.item_name;

      if (!it.imageFile) {
        return this.fail(`Item ${i + 1}: Image required`);
      }

      formData.append('images', it.imageFile);
    }

    payloadItems.push(itemPayload);
  }

  const data = {
    customer_name: this.customerName,
    customer_phone: this.customerPhone,
    salesman_name: this.salesmanName,
    tax: this.tax,
    items: payloadItems
  };

  formData.append('data', JSON.stringify(data));

  const req = this.mode === 'add'
    ? this.qs.createQuotation(formData)
    : this.qs.updateQuotation(this.quotationId, formData);

  req.subscribe({
    next: () => {
      alert(`Quotation ${this.mode === 'add' ? 'created' : 'updated'} successfully`);
      this.router.navigate(['/quotations']);
    },
    error: () => this.fail('Failed to save quotation')
  });
}


  fail(msg: string) {
    alert(msg);
    this.isSubmitting = false;
  }
}
