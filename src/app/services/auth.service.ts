import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = 'https://quotation-backend-3.onrender.com/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    return this.http.post<any>(`${this.baseUrl}/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // -------------- USER REGISTER --------------
  register(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/register`, { username, password });
  }

  // -------------- USERS LIST / DELETE --------------
  getUsers() {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // -------------- GET LOGGED USER NAME --------------
  getLoggedUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return decoded?.sub || null;
    } catch {
      return null;
    }
  }

}
