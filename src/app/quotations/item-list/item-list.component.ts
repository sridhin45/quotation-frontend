import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotationService } from '../../services/quotation.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent implements OnInit {

  imageBase = "https://quotation-backend-1-eewh.onrender.com/uploads/";

  items: any[] = [];
  filteredItems: any[] = [];
  searchText: string = '';

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

  // ========================= LOAD ITEMS =========================
  loadItems() {
    this.itemService.getAllItems().subscribe({
      next: (res) => {
        this.items = res;
        this.filteredItems = res;
      },
      error: (err) => console.error("Load failed", err)
    });
  }

  // ========================= SEARCH FILTER =========================
  applySearch() {
    const q = this.searchText.toLowerCase();
    this.filteredItems = this.items.filter(i =>
      i.name.toLowerCase().includes(q)
    );
  }

  // ========================= OPEN ADD POPUP =========================
  openPopup() {
    this.popupMode = 'add';
    this.editItemId = null;
    this.newItem = {
      name: '',
      unit_price: null,
      imageFile: null,
      previewUrl: ''
    };
    this.showPopup = true;
  }

  // ========================= OPEN EDIT POPUP =========================
  openEditPopup(item: any) {
    this.popupMode = 'edit';
    this.editItemId = item.id;

    this.newItem = {
      name: item.name,
      unit_price: item.unit_price,
      imageFile: null,
      previewUrl: item.image ? this.imageBase + item.image : ''
    };

    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  // ========================= IMAGE SELECT =========================
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

  // ========================= SAVE NEW ITEM =========================
  saveNewItem() {
    if (!this.newItem.name) {
      alert("Name is required");
      return;
    }

    if (!this.newItem.unit_price || this.newItem.unit_price <= 0) {
      alert("Unit price must be greater than 0");
      return;
    }

    if (!this.newItem.imageFile) {
      alert("Image is required for new item");
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const formData = new FormData();
    formData.append("name", this.newItem.name);
    formData.append("unit_price", String(this.newItem.unit_price));
    formData.append("image", this.newItem.imageFile);

    this.itemService.createItem(formData).subscribe({
      next: () => {
        alert("Item added successfully!");
        this.isSubmitting = false;
        this.closePopup();
        this.loadItems();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert("Error: " + (err.error?.detail || err.message));
      }
    });
  }

  // ========================= UPDATE ITEM =========================
  updateItem() {
    if (!this.newItem.name) {
      alert("Name is required");
      return;
    }

    if (this.newItem.unit_price === null || this.newItem.unit_price <= 0) {
      alert("Unit price must be greater than 0");
      return;
    }

    const formData = new FormData();
    formData.append("name", this.newItem.name);
    formData.append("unit_price", String(this.newItem.unit_price));

    // Only upload new image if user selected one
    if (this.newItem.imageFile) {
      formData.append("image", this.newItem.imageFile);
    }

    this.itemService.updateItem(this.editItemId!, formData).subscribe({
      next: () => {
        alert("Item updated successfully!");
        this.closePopup();
        this.loadItems();
        this.editItemId = null;
      },
      error: (err) => {
        alert("Update failed: " + (err.error?.detail || err.message));
      }
    });
  }

  // ========================= DELETE ITEM =========================
  deleteItem(id: number) {
    if (!confirm("Delete this item?")) return;

    this.itemService.deleteItem(id).subscribe({
      next: () => this.loadItems(),
      error: () => alert("Delete failed")
    });
  }

  // ========================= POPUP SUBMIT HANDLER =========================
  submitPopup() {
    if (this.popupMode === 'add') {
      this.saveNewItem();
    } else {
      this.updateItem();
    }
  }
}
