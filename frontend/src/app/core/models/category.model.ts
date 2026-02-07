export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface CategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}