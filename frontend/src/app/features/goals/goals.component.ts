import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Goal, GoalRequest, Category } from '../../core/models';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss',
})
export class GoalsComponent implements OnInit {
  goals = signal<Goal[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');

  // Modal
  showModal = signal(false);
  editingGoal = signal<Goal | null>(null);
  saving = signal(false);

  // Delete
  showDeleteConfirm = signal(false);
  deletingGoal = signal<Goal | null>(null);
  deleting = signal(false);

  // Fund modal
  showFundModal = signal(false);
  fundingGoal = signal<Goal | null>(null);
  fundAmount: number | null = null;
  fundError = '';
  fundSaving = signal(false);

  // Form
  formName = '';
  formTargetAmount: number | null = null;
  formDeadline = '';
  formCategoryId: number | null = null;
  formError = '';

  // Computed
  totalGoals = computed(() => this.goals().length);

  completedGoals = computed(() =>
    this.goals().filter((g) => g.progressPercentage >= 100).length
  );

  inProgressGoals = computed(() =>
    this.goals().filter((g) => g.progressPercentage < 100).length
  );

  nearDeadlineGoals = computed(() => {
    const now = new Date();
    return this.goals().filter((g) => {
      if (!g.deadline || g.progressPercentage >= 100) return false;
      const deadline = new Date(g.deadline);
      const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    }).length;
  });

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
      if (loaded >= 2) this.loading.set(false);
    };

    this.api.getGoals().subscribe({
      next: (data) => {
        this.goals.set(data);
        checkDone();
      },
      error: () => {
        this.error.set('Failed to load goals');
        checkDone();
      },
    });

    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        checkDone();
      },
      error: () => checkDone(),
    });
  }

  // --- Modal ---
  openAddModal() {
    this.editingGoal.set(null);
    this.formName = '';
    this.formTargetAmount = null;
    this.formDeadline = '';
    this.formCategoryId = null;
    this.formError = '';
    this.showModal.set(true);
  }

  openEditModal(goal: Goal) {
    this.editingGoal.set(goal);
    this.formName = goal.name;
    this.formTargetAmount = goal.targetAmount;
    this.formDeadline = goal.deadline || '';
    this.formCategoryId = goal.categoryId || null;
    this.formError = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingGoal.set(null);
  }

  saveGoal() {
    if (!this.formName.trim()) {
      this.formError = 'Goal name is required';
      return;
    }
    if (!this.formTargetAmount || this.formTargetAmount <= 0) {
      this.formError = 'Target amount must be greater than 0';
      return;
    }

    this.formError = '';
    this.saving.set(true);

    const request: GoalRequest = {
      name: this.formName.trim(),
      targetAmount: this.formTargetAmount,
      deadline: this.formDeadline || undefined,
      categoryId: this.formCategoryId || undefined,
    };

    const editing = this.editingGoal();

    if (editing) {
      this.api.updateGoal(editing.id, request).subscribe({
        next: () => {
          this.loadAll();
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.formError = 'Failed to update goal';
          this.saving.set(false);
        },
      });
    } else {
      this.api.createGoal(request).subscribe({
        next: () => {
          this.loadAll();
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.formError = 'Failed to create goal';
          this.saving.set(false);
        },
      });
    }
  }

  // --- Fund Modal ---
  openFundModal(goal: Goal) {
    this.fundingGoal.set(goal);
    this.fundAmount = null;
    this.fundError = '';
    this.showFundModal.set(true);
  }

  closeFundModal() {
    this.showFundModal.set(false);
    this.fundingGoal.set(null);
  }

  saveFund() {
    const goal = this.fundingGoal();
    if (!goal) return;

    if (!this.fundAmount || this.fundAmount <= 0) {
      this.fundError = 'Amount must be greater than 0';
      return;
    }

    this.fundError = '';
    this.fundSaving.set(true);

    const newAmount = goal.currentAmount + this.fundAmount;

    const request: GoalRequest = {
      name: goal.name,
      targetAmount: goal.targetAmount,
      deadline: goal.deadline || undefined,
      categoryId: goal.categoryId || undefined,
    };

    // NOTE: This uses the standard update endpoint.
    // If backend supports currentAmount in GoalRequest, add it here:
    (request as any).currentAmount = newAmount;

    this.api.updateGoal(goal.id, request).subscribe({
      next: () => {
        this.loadAll();
        this.closeFundModal();
        this.fundSaving.set(false);
      },
      error: () => {
        this.fundError = 'Failed to add funds';
        this.fundSaving.set(false);
      },
    });
  }

  // --- Delete ---
  openDeleteConfirm(goal: Goal) {
    this.deletingGoal.set(goal);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.deletingGoal.set(null);
  }

  confirmDelete() {
    const goal = this.deletingGoal();
    if (!goal) return;

    this.deleting.set(true);
    this.api.deleteGoal(goal.id).subscribe({
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

  getDaysLeft(deadline: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(deadline);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDeadlineLabel(deadline: string): string {
    const days = this.getDaysLeft(deadline);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  }

  isOverdue(deadline: string): boolean {
    return this.getDaysLeft(deadline) < 0;
  }

  isNearDeadline(deadline: string): boolean {
    const days = this.getDaysLeft(deadline);
    return days >= 0 && days <= 7;
  }

  getProgressColor(pct: number): string {
    if (pct >= 100) return 'var(--green, #81B29A)';
    if (pct >= 75) return 'var(--green, #81B29A)';
    if (pct >= 50) return 'var(--sand, #F2CC8F)';
    return 'var(--accent, #E07A5F)';
  }

  getProgressClass(pct: number): string {
    if (pct >= 75) return 'progress--green';
    if (pct >= 50) return 'progress--sand';
    return 'progress--accent';
  }

  getCategoryName(catId: number): string {
    const cat = this.categories().find((c) => c.id === catId);
    return cat?.name || '';
  }

  getCategoryIcon(catId: number): string {
    const cat = this.categories().find((c) => c.id === catId);
    return cat?.icon || '';
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

  onFundBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeFundModal();
    }
  }
}