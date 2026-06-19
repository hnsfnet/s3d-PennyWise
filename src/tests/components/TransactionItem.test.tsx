import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionItem } from '@/components/TransactionItem';
import { createMockTransaction } from '../test-utils';

describe('TransactionItem', () => {
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  it('应该正确渲染支出记录的金额（红色，带负号）', () => {
    const transaction = createMockTransaction({
      amount: 100,
      type: 'expense',
      category: 'food',
      date: '2026-06-19',
    });

    render(
      <TransactionItem
        transaction={transaction}
        index={0}
        overBudget={false}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('-¥100.00')).toBeInTheDocument();
    expect(screen.getByText('-¥100.00')).toHaveClass('text-expense');
  });

  it('应该正确渲染收入记录的金额（绿色，带正号）', () => {
    const transaction = createMockTransaction({
      amount: 5000,
      type: 'income',
      category: 'salary',
      date: '2026-06-19',
    });

    render(
      <TransactionItem
        transaction={transaction}
        index={0}
        overBudget={false}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('+¥5,000.00')).toBeInTheDocument();
    expect(screen.getByText('+¥5,000.00')).toHaveClass('text-income');
  });

  it('应该正确渲染分类标签', () => {
    const transaction = createMockTransaction({
      category: 'food',
      note: '午餐',
    });

    render(
      <TransactionItem
        transaction={transaction}
        index={0}
        overBudget={false}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('午餐')).toBeInTheDocument();
  });

  it('超支时应该显示红色超支标签和警告图标', () => {
    const transaction = createMockTransaction({
      category: 'food',
      type: 'expense',
    });

    render(
      <TransactionItem
        transaction={transaction}
        index={0}
        overBudget={true}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('超支')).toBeInTheDocument();
    expect(screen.getByText('餐饮')).toHaveClass('text-expense');
  });

  it('超支时卡片边框应该为红色', () => {
    const transaction = createMockTransaction({
      category: 'food',
      type: 'expense',
    });

    const { container } = render(
      <TransactionItem
        transaction={transaction}
        index={0}
        overBudget={true}
        onDelete={mockOnDelete}
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-red-200');
    expect(card).toHaveClass('bg-red-50/30');
  });

  it('点击删除按钮应该调用 onDelete 回调', () => {
    const transaction = createMockTransaction({ id: 'test-id-123' });

    render(
      <TransactionItem
        transaction={transaction}
        index={0}
        overBudget={false}
        onDelete={mockOnDelete}
      />
    );

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const deleteButton = screen.getByTitle('删除记录');
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith('确定要删除这条记录吗？');
    expect(mockOnDelete).toHaveBeenCalledWith('test-id-123');

    confirmSpy.mockRestore();
  });

  it('取消删除时不应该调用 onDelete', () => {
    const transaction = createMockTransaction({ id: 'test-id-456' });

    render(
      <TransactionItem
        transaction={transaction}
        index={0}
        overBudget={false}
        onDelete={mockOnDelete}
      />
    );

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const deleteButton = screen.getByTitle('删除记录');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('收入记录即使 overBudget 为 true 也不应该显示超支标签', () => {
    const transaction = createMockTransaction({
      type: 'income',
      category: 'salary',
    });

    render(
      <TransactionItem
        transaction={transaction}
        index={0}
        overBudget={true}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText('超支')).not.toBeInTheDocument();
  });
});
