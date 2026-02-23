import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="verify-container">
      <div *ngIf="loading">Verifying your email...</div>
      <div *ngIf="success">
        <h2>Email verified!</h2>
        <p>Your account is active. You can now log in.</p>
        <a routerLink="/login" class="btn-primary">Go to Login</a>
      </div>
      <div *ngIf="error">
        <h2>Verification failed</h2>
        <p>{{ error }}</p>
        <a routerLink="/register">Register again</a>
      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  success = false;
  error = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.loading = false;
      this.error = 'No verification token provided.';
      return;
    }

    this.http.get<any>(`/api/auth/verify-email?token=${token}`)
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Invalid or expired link.';
        }
      });
  }
}