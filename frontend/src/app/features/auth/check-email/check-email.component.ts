import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="check-email-container">
      <h2>Check your inbox!</h2>
      <p>We sent a confirmation link to <strong>{{ email }}</strong></p>
      <p>Click the link in the email to activate your account.</p>
      <p class="hint">Didn't get it? Check spam, or
        <button (click)="resend()" [disabled]="resending">
          {{ resending ? 'Sending...' : 'resend the email' }}
        </button>
      </p>
      <p *ngIf="resendMessage" class="success">{{ resendMessage }}</p>
      <a routerLink="/login">Back to login</a>
    </div>
  `
})
export class CheckEmailComponent {
  email = '';
  resending = false;
  resendMessage = '';

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.email = this.route.snapshot.queryParams['email'] || '';
  }

  resend() {
    this.resending = true;
    this.http.post('/api/auth/resend-verification', { email: this.email })
      .subscribe({
        next: () => {
          this.resendMessage = 'Verification email sent!';
          this.resending = false;
        },
        error: () => {
          this.resendMessage = 'Failed to resend. Try again later.';
          this.resending = false;
        }
      });
  }
}