import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Account, AccountRequest } from '../../core/models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit {
  accounts = signal<Account[]>([]);
  loading = signal(true);
  error = signal('');

  // Modal state
  showModal = signal(false);
  editingAccount = signal<Account | null>(null);
  saving = signal(false);

  // Delete confirm state
  showDeleteConfirm = signal(false);
  deletingAccount = signal<Account | null>(null);
  deleting = signal(false);

  // Form fields
  formName = '';
  formInitialBalance: number | null = null;
  formError = '';

  // Computed
  totalBalance = computed(() =>
    this.accounts().reduce((sum, acc) => sum + acc.currentBalance, 0)
  );

  totalInitial = computed(() =>
    this.accounts().reduce((sum, acc) => sum + acc.initialBalance, 0)
  );

  balanceDiff = computed(() => this.totalBalance() - this.totalInitial());

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading.set(true);
    this.error.set('');
    this.api.getAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load accounts');
        this.loading.set(false);
      },
    });
  }

  // --- Modal ---
  openAddModal() {
    this.editingAccount.set(null);
    this.formName = '';
    this.formInitialBalance = null;
    this.formError = '';
    this.showModal.set(true);
  }

  openEditModal(account: Account) {
    this.editingAccount.set(account);
    this.formName = account.name;
    this.formInitialBalance = account.initialBalance;
    this.formError = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingAccount.set(null);
  }

  saveAccount() {
    if (!this.formName.trim()) {
      this.formError = 'Account name is required';
      return;
    }
    if (this.formInitialBalance === null || this.formInitialBalance < 0) {
      this.formError = 'Initial balance must be 0 or more';
      return;
    }

    this.formError = '';
    this.saving.set(true);

    const request: AccountRequest = {
      name: this.formName.trim(),
      initialBalance: this.formInitialBalance,
    };

    const editing = this.editingAccount();

    if (editing) {
      this.api.updateAccount(editing.id, request).subscribe({
        next: () => {
          this.loadAccounts();
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.formError = 'Failed to update account';
          this.saving.set(false);
        },
      });
    } else {
      this.api.createAccount(request).subscribe({
        next: () => {
          this.loadAccounts();
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.formError = 'Failed to create account';
          this.saving.set(false);
        },
      });
    }
  }

  // --- Delete ---
  openDeleteConfirm(account: Account) {
    this.deletingAccount.set(account);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.deletingAccount.set(null);
  }

  confirmDelete() {
    const account = this.deletingAccount();
    if (!account) return;

    this.deleting.set(true);
    this.api.deleteAccount(account.id).subscribe({
      next: () => {
        this.loadAccounts();
        this.closeDeleteConfirm();
        this.deleting.set(false);
      },
      error: () => {
        this.deleting.set(false);
      },
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(value);
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
