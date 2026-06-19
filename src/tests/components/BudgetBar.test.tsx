import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetBar } from '@/components/BudgetBar';
import type { BudgetProgress } from '@/types';

const createMockProgress = (overrides: Partial<BudgetProgress> = {}): BudgetProgress => ({
  categoryKey: 'food',
  categoryLabel: '餐饮',
  color: '#F97316',
  bgColor: '#FFF7ED',
  budget: 2000,
  spent: 1000,
  remaining: 1000,
  percentage: 50,
  isOverBudget: false,
  ...overrides,
});

describe('BudgetBar', () => {
  it('应该正确显示分类名称和金额', () => {
    const progress = createMockProgress();
    render(<BudgetBar progress={progress} />);

    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('¥1,000.00')).toBeInTheDocument();
    expect(screen.getByText('/ ¥2,000.00')).toBeInTheDocument();
  });

  it('未超支时应该显示剩余金额和百分比', () => {
    const progress = createMockProgress({
      spent: 1000,
      remaining: 1000,
      percentage: 50,
      isOverBudget: false,
    });
    render(<BudgetBar progress={progress} />);

    expect(screen.getByText('剩 ¥1,000.00')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('超支时应该显示超支金额和红色样式', () => {
    const progress = createMockProgress({
      spent: 2500,
      remaining: -500,
      percentage: 125,
      isOverBudget: true,
    });
    render(<BudgetBar progress={progress} />);

    expect(screen.getByText('超支 ¥500.00')).toBeInTheDocument();
    expect(screen.getByText('超支 ¥500.00')).toHaveClass('text-expense');
    expect(screen.getByText('餐饮')).toHaveClass('text-expense');
    expect(screen.getByText('¥2,500.00')).toHaveClass('text-expense');
  });

  it('超支时应该显示警告图标', () => {
    const progress = createMockProgress({ isOverBudget: true });
    const { container } = render(<BudgetBar progress={progress} />);

    const alertIcon = container.querySelector('.lucide-triangle-alert');
    expect(alertIcon).toBeInTheDocument();
    expect(alertIcon).toHaveClass('text-expense');
  });

  it('进度条宽度应该等于 percentage', () => {
    const progress = createMockProgress({ percentage: 75 });
    const { container } = render(<BudgetBar progress={progress} />);

    const progressBar = container.querySelector('.h-1\\.5 > div');
    expect(progressBar).toHaveStyle({ width: '75%' });
  });

  it('未超支时进度条应该是主色调', () => {
    const progress = createMockProgress({ isOverBudget: false });
    const { container } = render(<BudgetBar progress={progress} />);

    const progressBar = container.querySelector('.h-1\\.5 > div');
    expect(progressBar).toHaveClass('from-primary-400');
    expect(progressBar).toHaveClass('to-primary-500');
  });

  it('超支时进度条应该是红色', () => {
    const progress = createMockProgress({ isOverBudget: true });
    const { container } = render(<BudgetBar progress={progress} />);

    const progressBar = container.querySelector('.h-1\\.5 > div');
    expect(progressBar).toHaveClass('from-red-400');
    expect(progressBar).toHaveClass('to-red-500');
  });

  it('百分比超过 100% 时进度条宽度应该为 100%', () => {
    const progress = createMockProgress({ percentage: 150, isOverBudget: true });
    const { container } = render(<BudgetBar progress={progress} />);

    const progressBar = container.querySelector('.h-1\\.5 > div');
    expect(progressBar).toHaveStyle({ width: '150%' });
  });
});
