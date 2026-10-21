import React from 'react';
import {
  House,
  ShoppingBasket,
  UtensilsCrossed,
  CarFront,
  ShoppingBag,
  Zap,
  Repeat2,
  HeartPulse,
  Clapperboard,
  Plane,
  Banknote,
  BriefcaseBusiness,
  Wallet,
  LucideIcon,
} from 'lucide-react';
import { Category } from '../types';

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  housing: House,
  groceries: ShoppingBasket,
  dining: UtensilsCrossed,
  transport: CarFront,
  shopping: ShoppingBag,
  utilities: Zap,
  subscriptions: Repeat2,
  health: HeartPulse,
  entertainment: Clapperboard,
  travel: Plane,
  salary: Banknote,
  freelance: BriefcaseBusiness,
};

interface CategoryMarkProps {
  category?: Category;
  size?: number;
}

export const CategoryMark: React.FC<CategoryMarkProps> = ({ category, size = 18 }) => {
  const IconComponent = (category && CATEGORY_ICON_MAP[category.id]) || Wallet;
  const color = category?.color ?? '#74f6c8';

  return (
    <span
      className="category-mark"
      style={{ '--category-color': color } as React.CSSProperties}
    >
      <IconComponent size={size} strokeWidth={1.9} />
    </span>
  );
};
