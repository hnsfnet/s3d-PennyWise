import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getCategoryByKey } from '@/utils/categories';
import type { TransactionType } from '@/types';

interface CategoryIconProps {
  categoryKey: string;
  type: TransactionType;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed: Icons.UtensilsCrossed,
  Car: Icons.Car,
  ShoppingBag: Icons.ShoppingBag,
  Gamepad2: Icons.Gamepad2,
  Wallet: Icons.Wallet,
  Briefcase: Icons.Briefcase,
  Gift: Icons.Gift,
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function CategoryIcon({ categoryKey, type, size = 'md' }: CategoryIconProps) {
  const category = getCategoryByKey(categoryKey, type);

  if (!category) {
    return null;
  }

  const IconComponent = iconMap[category.icon] || Icons.Circle;

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-transform duration-200`}
      style={{ backgroundColor: category.bgColor }}
    >
      <IconComponent
        className={iconSizeClasses[size]}
        style={{ color: category.color }}
      />
    </div>
  );
}
