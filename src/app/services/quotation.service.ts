import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  private baseUrl = 'https://quotation-backend-e2jd.onrender.com';

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

  
  
}
