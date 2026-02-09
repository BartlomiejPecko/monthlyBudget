import { Component, OnInit, signal, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import {
  Expense,
  ExpenseRequest,
  Account,
  Category,
} from '../../core/models';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss',
})
export class ExpensesComponent implements OnInit {
  expenses = signal<Expense[]>([]);
  accounts = signal<Account[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');

  // Modal
  showModal = signal(false);
  editingExpense = signal<Expense | null>(null);
  saving = signal(false);

  // Delete
  showDeleteConfirm = signal(false);
  deletingExpense = signal<Expense | null>(null);
  deleting = signal(false);

  // Filters
  filterCategory = '';
  filterDateFrom = '';
  filterDateTo = '';
  filterReturnOnly = false;

  // Form
  formAmount: number | null = null;
  formDescription = '';
  formDate = '';
  formIsReturn = false;
  formAccountId: number | null = null;
  formCategoryId: number | null = null;
  formError = '';

  // Computed filtered list
  filteredExpenses = computed(() => {
    let list = this.expenses();

    if (this.filterCategory) {
      const catId = Number(this.filterCategory);
      list = list.filter((e) => e.categoryId === catId);
    }

    if (this.filterDateFrom) {
      list = list.filter((e) => e.date >= this.filterDateFrom);
    }

    if (this.filterDateTo) {
      list = list.filter((e) => e.date <= this.filterDateTo);
    }

    if (this.filterReturnOnly) {
      list = list.filter((e) => e.isReturn);
    }

    return list;
  });

  totalExpenses = computed(() =>
    this.filteredExpenses()
      .filter((e) => !e.isReturn)
      .reduce((sum, e) => sum + e.amount, 0)
  );

  totalReturns = computed(() =>
    this.filteredExpenses()
      .filter((e) => e.isReturn)
      .reduce((sum, e) => sum + e.amount, 0)
  );

  netTotal = computed(() => this.totalExpenses() - this.totalReturns());

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.error.set('');

    // Load expenses, accounts, categories in parallel
    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded >= 3) this.loading.set(false);
    };

    this.api.getExpenses().subscribe({
      next: (data) => {
        this.expenses.set(data);
        checkDone();
      },
      error: () => {
        this.error.set('Failed to load expenses');
        checkDone();
      },
    });

    this.api.getAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        checkDone();
      },
      error: () => checkDone(),
    });

    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        checkDone();
      },
      error: () => checkDone(),
    });
  }

  // --- Filters ---
  clearFilters() {
    this.filterCategory = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterReturnOnly = false;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filterCategory ||
      this.filterDateFrom ||
      this.filterDateTo ||
      this.filterReturnOnly
    );
  }

  // --- Modal ---
  openAddModal() {
    this.editingExpense.set(null);
    this.formAmount = null;
    this.formDescription = '';
    this.formDate = new Date().toISOString().split('T')[0];
    this.formIsReturn = false;
    this.formAccountId =
      this.accounts().length > 0 ? this.accounts()[0].id : null;
    this.formCategoryId =
      this.categories().length > 0 ? this.categories()[0].id : null;
    this.formError = '';
    this.showModal.set(true);
  }

  openEditModal(exp: Expense) {
    this.editingExpense.set(exp);
    this.formAmount = exp.amount;
    this.formDescription = exp.description || '';
    this.formDate = exp.date;
    this.formIsReturn = exp.isReturn;
    this.formAccountId = exp.accountId;
    this.formCategoryId = exp.categoryId;
    this.formError = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingExpense.set(null);
  }

  saveExpense() {
    if (!this.formAmount || this.formAmount <= 0) {
      this.formError = 'Amount must be greater than 0';
      return;
    }
    if (!this.formDate) {
      this.formError = 'Date is required';
      return;
    }
    if (!this.formAccountId) {
      this.formError = 'Please select an account';
      return;
    }
    if (!this.formCategoryId) {
      this.formError = 'Please select a category';
      return;
    }

    this.formError = '';
    this.saving.set(true);

    const request: ExpenseRequest = {
      amount: this.formAmount,
      description: this.formDescription.trim(),
      date: this.formDate,
      isReturn: this.formIsReturn,
      accountId: this.formAccountId,
      categoryId: this.formCategoryId,
    };

    const editing = this.editingExpense();

    if (editing) {
      this.api.updateExpense(editing.id, request).subscribe({
        next: () => {
          this.loadAll();
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.formError = 'Failed to update expense';
          this.saving.set(false);
        },
      });
    } else {
      this.api.createExpense(request).subscribe({
        next: () => {
          this.loadAll();
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.formError = 'Failed to create expense';
          this.saving.set(false);
        },
      });
    }
  }

  // --- Delete ---
  openDeleteConfirm(exp: Expense) {
    this.deletingExpense.set(exp);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.deletingExpense.set(null);
  }

  confirmDelete() {
    const exp = this.deletingExpense();
    if (!exp) return;

    this.deleting.set(true);
    this.api.deleteExpense(exp.id).subscribe({
      next: () => {
        this.loadAll();
        this.closeDeleteConfirm();
        this.deleting.set(false);
      },
      error: () => {
        this.deleting.set(false);
      },
    });
  }

  // --- Helpers ---
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
      year: 'numeric',
    });
  }

  getCategoryIcon(catId: number): string {
    const cat = this.categories().find((c) => c.id === catId);
    return cat?.icon || '📁';
  }

  getCategoryColor(catId: number): string {
    const cat = this.categories().find((c) => c.id === catId);
    return cat?.color || '#6B7B8D';
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  onDeleteBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeDeleteConfirm();
    }
  }
}