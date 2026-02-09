import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController,
  PieController,
} from 'chart.js';
import { ApiService } from '../../core/services/api.service';
import { Expense, Account, Category } from '../../core/models';

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarController,
  PieController
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  expenses = signal<Expense[]>([]);
  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  // Stats
  totalBalance = computed(() =>
    this.accounts().reduce((s, a) => s + a.currentBalance, 0)
  );

  currentMonthExpenses = computed(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return this.expenses()
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === y && d.getMonth() === m && !e.isReturn;
      })
      .reduce((s, e) => s + e.amount, 0);
  });

  currentMonthReturns = computed(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return this.expenses()
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === y && d.getMonth() === m && e.isReturn;
      })
      .reduce((s, e) => s + e.amount, 0);
  });

  totalAccounts = computed(() => this.accounts().length);

  recentExpenses = computed(() => this.expenses().slice(0, 7));

  // Pie chart
  pieData = computed<ChartData<'pie'>>(() => {
    const map = new Map<string, number>();
    const colorMap = new Map<string, string>();

    this.expenses()
      .filter((e) => !e.isReturn)
      .forEach((e) => {
        const name = e.categoryName || 'Other';
        map.set(name, (map.get(name) || 0) + e.amount);
        if (!colorMap.has(name)) {
          colorMap.set(name, e.categoryColor || '#6B7B8D');
        }
      });

    const labels = Array.from(map.keys());
    const data = Array.from(map.values());
    const colors = labels.map((l) => colorMap.get(l) || '#6B7B8D');

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: 'var(--bg-card)',
          hoverOffset: 6,
        },
      ],
    };
  });

  pieOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 12, family: 'DM Sans' },
        },
      },
      tooltip: {
        backgroundColor: '#1A1A2E',
        titleFont: { family: 'DM Sans', weight: 'bold' },
        bodyFont: { family: 'DM Sans' },
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed || 0;
            return ` ${ctx.label}: ${val.toLocaleString('pl-PL', {
              style: 'currency',
              currency: 'PLN',
            })}`;
          },
        },
      },
    },
  };

  // Bar chart — last 6 months
  barData = computed<ChartData<'bar'>>(() => {
    const now = new Date();
    const months: string[] = [];
    const spent: number[] = [];
    const returns: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      months.push(
        d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      );

      const monthExps = this.expenses().filter((e) => {
        const ed = new Date(e.date);
        return ed.getFullYear() === y && ed.getMonth() === m;
      });

      spent.push(
        monthExps.filter((e) => !e.isReturn).reduce((s, e) => s + e.amount, 0)
      );
      returns.push(
        monthExps.filter((e) => e.isReturn).reduce((s, e) => s + e.amount, 0)
      );
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Expenses',
          data: spent,
          backgroundColor: '#E07A5F',
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
        {
          label: 'Returns',
          data: returns,
          backgroundColor: '#81B29A',
          borderRadius: 8,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    };
  });

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'DM Sans' } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(128,128,128,0.1)' },
        ticks: {
          font: { size: 11, family: 'DM Sans' },
          callback: (v) => v.toLocaleString('pl-PL') + ' zł',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 12, family: 'DM Sans' },
        },
      },
      tooltip: {
        backgroundColor: '#1A1A2E',
        titleFont: { family: 'DM Sans', weight: 'bold' },
        bodyFont: { family: 'DM Sans' },
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y || 0;
            return ` ${ctx.dataset.label}: ${val.toLocaleString('pl-PL', {
              style: 'currency',
              currency: 'PLN',
            })}`;
          },
        },
      },
    },
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    let loaded = 0;
    const done = () => {
      loaded++;
      if (loaded >= 3) this.loading.set(false);
    };

    this.api.getExpenses().subscribe({
      next: (d) => { this.expenses.set(d); done(); },
      error: () => done(),
    });
    this.api.getAccounts().subscribe({
      next: (d) => { this.accounts.set(d); done(); },
      error: () => done(),
    });
    this.api.getCategories().subscribe({
      next: (d) => { this.categories.set(d); done(); },
      error: () => done(),
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
    });
  }

  getCategoryColor(catId: number): string {
    const cat = this.categories().find((c) => c.id === catId);
    return cat?.color || '#6B7B8D';
  }
}