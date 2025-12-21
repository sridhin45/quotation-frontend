import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls:['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: res => {
        this.auth.saveToken(res.access_token);
        this.router.navigate(['/quotations']);
      },
      error: () => this.error = 'Invalid username or password'
    });
  }
}
