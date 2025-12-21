import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  username = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.error = '';
    this.success = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.error = 'Username & password required';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.auth.register(this.username, this.password).subscribe({
      next: () => {
        this.success = 'User created successfully!';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: err => {
        this.error = err.error?.detail || 'Registration failed';
      }
    });
  }
}
