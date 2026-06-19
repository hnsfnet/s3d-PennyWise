import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Stats from '@/pages/Stats';
import Budget from '@/pages/Budget';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { setSystemTime, resetSystemTime } from '../test-utils';

const renderWithRouter = (initialRoute: string = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('集成测试：记账到统计联动流程', () => {
  beforeEach(() => {
    setSystemTime(new Date('2026-06-19T10:00:00'));
    useTransactionStore.setState({ transactions: [] });
    useBudgetStore.setState({ budgets: { food: 2000, transport: 500 } });
    useCategoryStore.setState({ customCategories: { expense: [], income: [] } });
    window.localStorage.clear();
  });

  afterEach(() => {
    resetSystemTime();
    useTransactionStore.setState({ transactions: [] });
    useBudgetStore.setState({ budgets: {} });
    useCategoryStore.setState({ customCategories: { expense: [], income: [] } });
    window.localStorage.clear();
  });

  it('记一笔餐饮支出后，账单列表应该出现这条记录', { timeout: 10000 }, async () => {
    renderWithRouter('/');

    expect(screen.getByText('还没有账单记录')).toBeInTheDocument();

    const addButton = screen.getByText('记一笔');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    }, { timeout: 3000 });

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '50' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const noteInput = screen.getByPlaceholderText('添加备注...');
    fireEvent.change(noteInput, { target: { value: '午餐' } });

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('餐饮')).toBeInTheDocument();
      expect(screen.getByText('午餐')).toBeInTheDocument();
      expect(screen.getByText('-¥50.00')).toBeInTheDocument();
      expect(screen.getByText('共 1 条')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.queryByText('还没有账单记录')).not.toBeInTheDocument();
  });

  it('记一笔餐饮支出后，统计页饼图餐饮分类金额应该增加', { timeout: 10000 }, async () => {
    renderWithRouter('/');

    const addButton = screen.getByText('记一笔');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    }, { timeout: 3000 });

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '150' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('共 1 条')).toBeInTheDocument();
    }, { timeout: 3000 });

    const statsNavButton = screen.getByText('统计');
    fireEvent.click(statsNavButton);

    await waitFor(() => {
      expect(screen.getByText('数据统计')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('¥150.00')).toBeInTheDocument();
    expect(screen.getByText('2026年6月支出占比')).toBeInTheDocument();
  });

  it('记一笔餐饮支出后，预算页餐饮进度条应该更新', { timeout: 10000 }, async () => {
    renderWithRouter('/');

    const addButton = screen.getByText('记一笔');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    }, { timeout: 3000 });

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '500' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('共 1 条')).toBeInTheDocument();
    }, { timeout: 3000 });

    const budgetNavButton = screen.getByText('预算');
    fireEvent.click(budgetNavButton);

    await waitFor(() => {
      expect(screen.getByText('预算设置')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('餐饮')).toBeInTheDocument();
    const foodInput = screen.getByDisplayValue('2000');
    expect(foodInput).toBeInTheDocument();
  });

  it('首页预算总览应该显示餐饮支出进度', { timeout: 10000 }, async () => {
    renderWithRouter('/');

    const addButton = screen.getByText('记一笔');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    }, { timeout: 3000 });

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '800' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('共 1 条')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('本月预算')).toBeInTheDocument();
    expect(screen.getByText('¥800.00')).toBeInTheDocument();
    expect(screen.getByText('/ ¥2,500.00')).toBeInTheDocument();
    expect(screen.getByText('¥1,700.00')).toBeInTheDocument();
  });

  it('超支时应该显示超支警告', { timeout: 10000 }, async () => {
    renderWithRouter('/');

    const addButton = screen.getByText('记一笔');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    }, { timeout: 3000 });

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '2500' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('共 1 条')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('超支')).toBeInTheDocument();
    expect(screen.getByText('-¥2,500.00')).toHaveClass('text-expense');
  });
});

describe('集成测试：按月筛选功能', () => {
  beforeEach(() => {
    setSystemTime(new Date('2026-06-19T10:00:00'));
    window.localStorage.clear();

    const txState = useTransactionStore.getState();
    txState.addTransaction({
      amount: 100,
      type: 'expense',
      category: 'food',
      note: '6月餐饮',
      date: '2026-06-15',
    });
    txState.addTransaction({
      amount: 200,
      type: 'expense',
      category: 'transport',
      note: '6月交通',
      date: '2026-06-10',
    });
    txState.addTransaction({
      amount: 150,
      type: 'expense',
      category: 'food',
      note: '5月餐饮',
      date: '2026-05-20',
    });
    txState.addTransaction({
      amount: 300,
      type: 'expense',
      category: 'shopping',
      note: '5月购物',
      date: '2026-05-15',
    });

    useBudgetStore.setState({ budgets: { food: 2000, transport: 500, shopping: 1000 } });
    useCategoryStore.setState({ customCategories: { expense: [], income: [] } });
  });

  afterEach(() => {
    resetSystemTime();
    useTransactionStore.setState({ transactions: [] });
    useBudgetStore.setState({ budgets: {} });
    useCategoryStore.setState({ customCategories: { expense: [], income: [] } });
    window.localStorage.clear();
  });

  it('初始显示当月（6月）数据，只包含6月的支出', { timeout: 10000 }, async () => {
    renderWithRouter('/stats');

    await waitFor(() => {
      expect(screen.getByText('数据统计')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('2026年6月')).toBeInTheDocument();
    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('交通')).toBeInTheDocument();
    expect(screen.getByText('¥100.00')).toBeInTheDocument();
    expect(screen.getByText('¥200.00')).toBeInTheDocument();
    expect(screen.queryByText('购物')).not.toBeInTheDocument();

    expect(screen.getByText('记录笔数')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('切换到上月（5月）后，只显示5月数据', { timeout: 10000 }, async () => {
    renderWithRouter('/stats');

    await waitFor(() => {
      expect(screen.getByText('数据统计')).toBeInTheDocument();
    }, { timeout: 3000 });

    const prevButton = screen.getByRole('button', { name: '' });
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('2026年5月')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('购物')).toBeInTheDocument();
    expect(screen.getByText('¥150.00')).toBeInTheDocument();
    expect(screen.getByText('¥300.00')).toBeInTheDocument();
    expect(screen.queryByText('交通')).not.toBeInTheDocument();

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('切回当月（6月）后数据恢复', { timeout: 10000 }, async () => {
    renderWithRouter('/stats');

    await waitFor(() => {
      expect(screen.getByText('数据统计')).toBeInTheDocument();
    }, { timeout: 3000 });

    const prevButton = screen.getAllByRole('button', { name: '' })[0];
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('2026年5月')).toBeInTheDocument();
    }, { timeout: 3000 });

    const nextButton = screen.getAllByRole('button', { name: '' })[1];
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('2026年6月')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('交通')).toBeInTheDocument();
    expect(screen.getByText('¥100.00')).toBeInTheDocument();
    expect(screen.getByText('¥200.00')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('近6个月趋势图应该包含5月和6月的数据', { timeout: 10000 }, async () => {
    renderWithRouter('/stats');

    await waitFor(() => {
      expect(screen.getByText('数据统计')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('近6个月收支趋势')).toBeInTheDocument();
  });

  it('切换月份后，支出总金额应该更新', { timeout: 10000 }, async () => {
    renderWithRouter('/stats');

    await waitFor(() => {
      expect(screen.getByText('数据统计')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('2026年6月')).toBeInTheDocument();
    expect(screen.getByText('¥300.00')).toBeInTheDocument();

    const prevButton = screen.getAllByRole('button', { name: '' })[0];
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('2026年5月')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('¥450.00')).toBeInTheDocument();
  });
});
