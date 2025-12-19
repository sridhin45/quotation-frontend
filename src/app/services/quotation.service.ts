import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  private baseUrl = 'https://quotation-backend-3.onrender.com';

  constructor(private http: HttpClient) {}

  // ================= QUOTATIONS =================

  createQuotation(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/quotations/`, formData);
  }

  getQuotations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quotations/`);
  }

  getQuotation(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/quotations/${id}`);
  }

  updateQuotation(id: number, formData: FormData): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/quotations/${id}`, formData);
  }

  deleteQuotation(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/quotations/${id}`);
  }

  // ================= ITEMS =================

  getAllItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/items/`);
  }

  searchItems(query: string): Observable<any[]> {
    // backend currently returns all items
    return this.http.get<any[]>(`${this.baseUrl}/items/`);
  }

  createItem(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/items/`, formData);
  }

  updateItem(id: number, formData: FormData): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/items/${id}`, formData);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/items/${id}`);
  }
}
