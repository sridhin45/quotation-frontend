import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotationService } from '../../services/quotation.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule,  MatIconModule,
    MatButtonModule,],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {

  // ✅ UPDATED BACKEND
// imageBase = 'https://quotation-backend-3.onrender.com/uploads/items/';

  items: any[] = [];
  filteredItems: any[] = [];
  searchText = '';

  showPopup = false;
  popupMode: 'add' | 'edit' = 'add';
  editItemId: number | null = null;
  isSubmitting = false;

  newItem = {
    name: '',
    unit_price: null as number | null,
    imageFile: null as File | null,
    previewUrl: ''
  };

  constructor(private itemService: QuotationService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  // ================= LOAD ITEMS =================
  loadItems() {
    this.itemService.getAllItems().subscribe({
      next: (res: any[]) => {
        this.items = res;
        this.filteredItems = res;
      },
      error: err => console.error('Load failed', err)
    });
  }

  // ================= SEARCH =================
  applySearch() {
    const q = this.searchText.toLowerCase();
    this.filteredItems = this.items.filter(i =>
      i.name.toLowerCase().includes(q)
    );
  }

  // ================= POPUP =================
  openPopup() {
    this.popupMode = 'add';
    this.editItemId = null;
    this.resetForm();
    this.showPopup = true;
  }

  openEditPopup(item: any) {
    this.popupMode = 'edit';
    this.editItemId = item.id;

    this.newItem = {
      name: item.name,
      unit_price: item.unit_price,
      imageFile: null,
previewUrl: item.image || ''
    };

    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.isSubmitting = false;
  }

  resetForm() {
    this.newItem = {
      name: '',
      unit_price: null,
      imageFile: null,
      previewUrl: ''
    };
  }

onImageSelect(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  this.newItem.imageFile = file;

  const reader = new FileReader();
  reader.onload = () => {
    this.newItem.previewUrl = reader.result as string;
  };
  reader.readAsDataURL(file);
}


  // ================= ADD ITEM =================
saveNewItem() {
  if (!this.validate()) return;

  const fd = new FormData();
  fd.append('name', this.newItem.name);
  fd.append('unit_price', String(this.newItem.unit_price));

  if (this.newItem.imageFile) {
    fd.append('image', this.newItem.imageFile);
  }

  this.isSubmitting = true;

  this.itemService.createItem(fd).subscribe({
    next: () => {
      alert('Item added successfully');
      this.closePopup();
      this.loadItems();
    },
    error: err => {
      this.isSubmitting = false;
      alert(err.error?.detail || 'Create failed');
    }
  });
}


  // ================= UPDATE ITEM =================
  updateItem() {
    if (!this.validate(false)) return;

    const fd = new FormData();
    fd.append('name', this.newItem.name);
    fd.append('unit_price', String(this.newItem.unit_price));

    if (this.newItem.imageFile) {
      fd.append('image', this.newItem.imageFile);
    }

    this.isSubmitting = true;

    this.itemService.updateItem(this.editItemId!, fd).subscribe({
      next: () => {
        alert('Item updated successfully');
        this.closePopup();
        this.loadItems();
      },
      error: err => {
        this.isSubmitting = false;
        alert(err.error?.detail || 'Update failed');
      }
    });
  }

  // ================= DELETE =================
  deleteItem(id: number) {
    if (!confirm('Delete this item?')) return;

    this.itemService.deleteItem(id).subscribe({
      next: () => this.loadItems(),
      error: () => alert('Delete failed (item used in quotation)')
    });
  }

  // ================= SUBMIT =================
  submitPopup() {
    this.popupMode === 'add'
      ? this.saveNewItem()
      : this.updateItem();
  }

  // ================= VALIDATION =================
  validate(requireImage = true): boolean {
    if (!this.newItem.name.trim()) {
      alert('Item name required');
      return false;
    }
    if (!this.newItem.unit_price || this.newItem.unit_price <= 0) {
      alert('Unit price must be > 0');
      return false;
    }
    if (requireImage && !this.newItem.imageFile) {
      alert('Image is required');
      return false;
    }
    return true;
  }
}
