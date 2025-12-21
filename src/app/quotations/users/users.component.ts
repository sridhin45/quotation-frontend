import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-users',
  imports: [CommonModule,MatIconModule,
    MatButtonModule,],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {

  users:any[] = [];
  loading = true;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.auth.getUsers().subscribe(res => {
      this.users = res;
      this.loading = false;
    });
  }

  deleteUser(id:number) {
    if (!confirm("Delete this user?")) return;
    
    this.auth.deleteUser(id).subscribe(() => {
      this.users = this.users.filter(u => u.id !== id);
    });
  }
}
