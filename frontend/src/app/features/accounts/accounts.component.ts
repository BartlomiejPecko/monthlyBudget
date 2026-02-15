import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Account, AccountRequest, Income, IncomeRequest, Category } from '../../core/models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit {
  accounts = signal<Account[]>([]);
  incomes = signal<Income[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');

  showModal = signal(false);
  editingAccount = signal<Account | null>(null);
  saving = signal(false);

  showDeleteConfirm = signal(false);
  deletingAccount = signal<Account | null>(null);
  deleting = signal(false);

  showIncomeModal = signal(false);
  editingIncome = signal<Income | null>(null);
  incomeSaving = signal(false);

  showIncomeDeleteConfirm = signal(false);
  deletingIncome = signal<Income | null>(null);
  incomeDeleting = signal(false);

  formName = '';
  formInitialBalance: number | null = null;
  formError = '';

  incomeFormAmount: number | null = null;
  incomeFormDescription = '';
  incomeFormDate = '';
  incomeFormAccountId: number | null = null;
  incomeFormCategoryId: number | null = null;
  incomeFormError = '';

  totalBalance = computed(() =>
    this.accounts().reduce((sum, acc) => sum + acc.currentBalance, 0)
  );

  totalInitial = computed(() =>
    this.accounts().reduce((sum, acc) => sum + acc.initialBalance, 0)
  );

  balanceDiff = computed(() => this.totalBalance() - this.totalInitial());

  totalIncome = computed(() =>
    this.incomes().reduce((sum, inc) => sum + inc.amount, 0)
  );

  recentIncomes = computed(() => this.incomes().slice(0, 5));

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    this.error.set('');

    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded >= 3) this.loading.set(false);
    };

    this.api.getAccounts().subscribe({
      next: (data) => {
        this.accounts.set(data);
        checkDone();
      },
      error: () => {
        this.error.set('Failed to load accounts');
        checkDone();
      },
    });

    this.api.getIncomes().subscribe({
      next: (data) => {
        this.incomes.set(data);
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
          this.loadAll();
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
          this.loadAll();
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
        this.loadAll();
        this.closeDeleteConfirm();
        this.deleting.set(false);
      },
      error: () => {
        this.deleting.set(false);
      },
    });
  }

  openIncomeModal(preselectedAccountId?: number) {
    this.editingIncome.set(null);
    this.incomeFormAmount = null;
    this.incomeFormDescription = '';
    this.incomeFormDate = new Date().toISOString().split('T')[0];
    this.incomeFormAccountId = preselectedAccountId ||
      (this.accounts().length > 0 ? this.accounts()[0].id : null);
    this.incomeFormCategoryId = null;
    this.incomeFormError = '';
    this.showIncomeModal.set(true);
  }

  openEditIncomeModal(income: Income) {
    this.editingIncome.set(income);
    this.incomeFormAmount = income.amount;
    this.incomeFormDescription = income.description || '';
    this.incomeFormDate = income.date;
    this.incomeFormAccountId = income.accountId;
    this.incomeFormCategoryId = income.categoryId || null;
    this.incomeFormError = '';
    this.showIncomeModal.set(true);
  }

  closeIncomeModal() {
    this.showIncomeModal.set(false);
    this.editingIncome.set(null);
  }

  saveIncome() {
    if (!this.incomeFormAmount || this.incomeFormAmount <= 0) {
      this.incomeFormError = 'Amount must be greater than 0';
      return;
    }
    if (!this.incomeFormDate) {
      this.incomeFormError = 'Date is required';
      return;
    }
    if (!this.incomeFormAccountId) {
      this.incomeFormError = 'Please select an account';
      return;
    }

    this.incomeFormError = '';
    this.incomeSaving.set(true);

    const request: IncomeRequest = {
      amount: this.incomeFormAmount,
      description: this.incomeFormDescription.trim(),
      date: this.incomeFormDate,
      accountId: this.incomeFormAccountId,
      categoryId: this.incomeFormCategoryId || undefined,
    };

    const editing = this.editingIncome();

    if (editing) {
      this.api.updateIncome(editing.id, request).subscribe({
        next: () => {
          this.loadAll();
          this.closeIncomeModal();
          this.incomeSaving.set(false);
        },
        error: () => {
          this.incomeFormError = 'Failed to update income';
          this.incomeSaving.set(false);
        },
      });
    } else {
      this.api.createIncome(request).subscribe({
        next: () => {
          this.loadAll();
          this.closeIncomeModal();
          this.incomeSaving.set(false);
        },
        error: () => {
          this.incomeFormError = 'Failed to add income';
          this.incomeSaving.set(false);
        },
      });
    }
  }

  openIncomeDeleteConfirm(income: Income) {
    this.deletingIncome.set(income);
    this.showIncomeDeleteConfirm.set(true);
  }

  closeIncomeDeleteConfirm() {
    this.showIncomeDeleteConfirm.set(false);
    this.deletingIncome.set(null);
  }

  confirmIncomeDelete() {
    const income = this.deletingIncome();
    if (!income) return;

    this.incomeDeleting.set(true);
    this.api.deleteIncome(income.id).subscribe({
      next: () => {
        this.loadAll();
        this.closeIncomeDeleteConfirm();
        this.incomeDeleting.set(false);
      },
      error: () => {
        this.incomeDeleting.set(false);
      },
    });
  }

  getAccountIncomes(accountId: number): Income[] {
    return this.incomes().filter((i) => i.accountId === accountId);
  }

  getAccountIncomeTotal(accountId: number): number {
    return this.getAccountIncomes(accountId).reduce((sum, i) => sum + i.amount, 0);
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
      year: 'numeric',
    });
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

  onIncomeBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeIncomeModal();
    }
  }

  onIncomeDeleteBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeIncomeDeleteConfirm();
    }
  }
}