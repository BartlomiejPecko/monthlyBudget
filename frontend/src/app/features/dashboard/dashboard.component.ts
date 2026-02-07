import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <h1 class="page-title">Dashboard</h1>
    <p class="page-sub">Tu wkrótce pojawią się wykresy i statystyki</p>
  `,
  styles: [`
    .page-title {
      font-family: var(--font-display);
      font-size: 32px;
      margin-bottom: 8px;
    }
    .page-sub {
      color: var(--text-muted);
      font-size: 14px;
    }
  `],
})
export class DashboardComponent {}
