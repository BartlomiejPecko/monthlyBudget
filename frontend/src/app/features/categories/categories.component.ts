import { Component, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Category, CategoryRequest } from '../../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');

  // Modal
  showModal = signal(false);
  editingCategory = signal<Category | null>(null);
  saving = signal(false);

  // Delete
  showDeleteConfirm = signal(false);
  deletingCategory = signal<Category | null>(null);
  deleting = signal(false);

  // Form
  formName = '';
  formIcon = '';
  formColor = '';
  formIsDefault = false;
  formError = '';

  // Preset colors from design system
  colorPresets = [
    { name: 'Terracotta', value: '#E07A5F' },
    { name: 'Green', value: '#81B29A' },
    { name: 'Sand', value: '#F2CC8F' },
    { name: 'Plum', value: '#BC6C8A' },
    { name: 'Navy', value: '#3D405B' },
    { name: 'Sky', value: '#5B9BD5' },
    { name: 'Lavender', value: '#9B8EC4' },
    { name: 'Coral', value: '#F4845F' },
    { name: 'Mint', value: '#56C596' },
    { name: 'Amber', value: '#E6A23C' },
    { name: 'Rose', value: '#E8657D' },
    { name: 'Slate', value: '#6B7B8D' },
  ];

  // Icon options (emoji-style labels)
  iconPresets = [
    '🍔', '🛒', '🏠', '🚗', '💊', '🎮', '👕', '✈️',
    '📚', '💡', '🎵', '🏋️', '☕', '🎁', '💼', '📱',
    '🐾', '🔧', '💇', '🎬',
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.error.set('');
    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load categories');
        this.loading.set(false);
      },
    });
  }

  // --- Modal ---
  openAddModal() {
    this.editingCategory.set(null);
    this.formName = '';
    this.formIcon = '🛒';
    this.formColor = this.colorPresets[0].value;
    this.formIsDefault = false;
    this.formError = '';
    this.showModal.set(true);
  }

  openEditModal(cat: Category) {
    this.editingCategory.set(cat);
    this.formName = cat.name;
    this.formIcon = cat.icon || '🛒';
    this.formColor = cat.color || this.colorPresets[0].value;
    this.formIsDefault = cat.isDefault || false;
    this.formError = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCategory.set(null);
  }

  selectColor(color: string) {
    this.formColor = color;
  }

  selectIcon(icon: string) {
    this.formIcon = icon;
  }

  saveCategory() {
    if (!this.formName.trim()) {
      this.formError = 'Category name is required';
      return;
    }

    this.formError = '';
    this.saving.set(true);

    const request: CategoryRequest = {
      name: this.formName.trim(),
      icon: this.formIcon,
      color: this.formColor,
      isDefault: this.formIsDefault,
    };

    const editing = this.editingCategory();

    if (editing) {
      this.api.updateCategory(editing.id, request).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.formError = 'Failed to update category';
          this.saving.set(false);
        },
      });
    } else {
      this.api.createCategory(request).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.formError = 'Failed to create category';
          this.saving.set(false);
        },
      });
    }
  }

  // --- Delete ---
  openDeleteConfirm(cat: Category) {
    this.deletingCategory.set(cat);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.deletingCategory.set(null);
  }

  confirmDelete() {
    const cat = this.deletingCategory();
    if (!cat) return;

    this.deleting.set(true);
    this.api.deleteCategory(cat.id).subscribe({
      next: () => {
        this.loadCategories();
        this.closeDeleteConfirm();
        this.deleting.set(false);
      },
      error: () => {
        this.deleting.set(false);
      },
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
}