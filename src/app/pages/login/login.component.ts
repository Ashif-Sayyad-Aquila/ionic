import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  isDarkMode = false; // ✅ Added this line
  credentials = { username: '', password: '' };

  constructor(private router: Router) {
    // Optional: detect system theme automatically
    this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Listen to system theme changes dynamically
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.isDarkMode = e.matches;
    });
  }

  // Optional: toggle manually with a button
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
  }

  login() {
    if (this.credentials.username && this.credentials.password) {
      console.log('Logged in:', this.credentials);
      this.router.navigate(['/projects']);
    } else {
      alert('Please enter username and password');
    }
  }
}
