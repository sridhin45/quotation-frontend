import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  private baseUrl = "https://quotation-backend-1-eewh.onrender.com";

  constructor(private http: HttpClient) {}

  createQuotation(formData: FormData) {
    return this.http.post(`${this.baseUrl}/quotations`, formData);
  }

  getQuotations() {
    return this.http.get(`${this.baseUrl}/quotations`);
  }

  getQuotation(id: number) {
    return this.http.get(`${this.baseUrl}/quotations/${id}`);
  }

  downloadPDF(id: number) {
    return this.http.get(`${this.baseUrl}/quotations/${id}/pdf`, {
      responseType: 'blob'
    });
  }

  getCustomers() {
    return this.http.get<any[]>(`${this.baseUrl}/customers`);
  }
  
updateQuotation(id: number, formData: FormData) {
  return this.http.put(`${this.baseUrl}/quotations/${id}`, formData);
}

deleteQuotation(id: number) {
  return this.http.delete(`${this.baseUrl}/quotations/${id}`);
}

searchItems(query: string) {
  return this.http.get<any[]>(`${this.baseUrl}/items/`);
}


  getAllItems() {
    return this.http.get<any[]>(`${this.baseUrl}/items`);
  }
  



  // 🔹 Get all items


  // 🔹 Create item (name + price only)
  createItem(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/items`, data);
  }

  // 🔹 Update item
  updateItem(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/items/${id}`, data);
  }

  // 🔹 Delete item
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/${id}`);
  }

  // 🔹 (Optional) Create item with image
  createItemWithImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/items/upload`, formData);
  }

  // 🔹 (Optional) Update item with image
  updateItemWithImage(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/items/upload/${id}`, formData);
  }
}

