import React from 'react';
import * as Icons from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/categories';
import type { Category } from '../types';

interface CategoryIconProps {
  category?: Category | string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-5 h-5', size = 20 }) => {
  let catObj: Category | undefined;
  if (typeof category === 'string') {
    catObj = DEFAULT_CATEGORIES.find((c) => c.id === category);
  } else {
    catObj = category;
  }

  const iconName = catObj?.icon || 'MoreHorizontal';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[iconName] || Icons.CircleDollarSign;

  return <IconComponent className={className} size={size} />;
};

export const getCategoryById = (categoryId: string): Category => {
  return (
    DEFAULT_CATEGORIES.find((c) => c.id === categoryId) || {
      id: categoryId,
      name: categoryId,
      name_fa: categoryId,
      icon: 'MoreHorizontal',
      color: '#64748b',
      type: 'expense',
    }
  );
};
