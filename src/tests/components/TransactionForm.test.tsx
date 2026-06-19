import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from '@/components/TransactionForm';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { expenseCategories, incomeCategories } from '@/utils/categories';

vi.mock('@/store/useTransactionStore');
vi.mock('@/store/useCategoryStore');

const mockAddTransaction = vi.fn();
const mockGetAllCategories = vi.fn();

describe('TransactionForm', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTransactionStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: any) => {
        if (selector && typeof selector === 'function') {
          return selector({ addTransaction: mockAddTransaction });
        }
        return { addTransaction: mockAddTransaction };
      }
    );
    (useCategoryStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector: any) => {
        if (selector && typeof selector === 'function') {
          return selector({ getAllCategories: mockGetAllCategories });
        }
        return { getAllCategories: mockGetAllCategories };
      }
    );
    mockGetAllCategories.mockImplementation((type: string) =>
      type === 'expense' ? expenseCategories : incomeCategories
    );
    mockOnClose.mockClear();
  });

  it('isOpen 为 false 时不渲染任何内容', () => {
    render(<TransactionForm isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('记一笔')).not.toBeInTheDocument();
  });

  it('isOpen 为 true 时渲染表单', () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('记一笔')).toBeInTheDocument();
    expect(screen.getByText('金额')).toBeInTheDocument();
    expect(screen.getByText('选择分类')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  it('金额为空时提交应该显示错误', async () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的金额/)).toBeInTheDocument();
    });
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('金额为 0 时提交应该显示错误', async () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '0' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的金额/)).toBeInTheDocument();
    });
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('金额为负数时提交应该显示错误', async () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '-50' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的金额/)).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('金额为非数字时提交应该显示错误', async () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: 'abc' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/请输入有效的金额/)).toBeInTheDocument();
    });
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('未选择分类时提交应该显示错误', async () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/请选择分类/)).toBeInTheDocument();
    });
    expect(mockAddTransaction).not.toHaveBeenCalled();
  });

  it('金额和分类都正确时应该调用 addTransaction 并关闭表单', async () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '25.5' } });

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const noteInput = screen.getByPlaceholderText('添加备注...');
    fireEvent.change(noteInput, { target: { value: '午餐' } });

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 25.5,
          type: 'expense',
          category: 'food',
          note: '午餐',
        })
      );
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('切换类型时应该清空已选分类', () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    const incomeButton = screen.getByText('收入');
    fireEvent.click(incomeButton);

    expect(screen.queryByText('请选择分类')).not.toBeInTheDocument();
  });

  it('点击关闭按钮应该调用 onClose', () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('金额输入有效时应该清除金额错误', () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    expect(screen.getByText(/请输入有效的金额/)).toBeInTheDocument();

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });

    expect(screen.queryByText(/请输入有效的金额/)).not.toBeInTheDocument();
  });

  it('选择分类后应该清除分类错误', () => {
    render(<TransactionForm isOpen={true} onClose={mockOnClose} />);

    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '100' } });

    const submitButton = screen.getByText('保存');
    fireEvent.click(submitButton);

    expect(screen.getByText(/请选择分类/)).toBeInTheDocument();

    const foodButton = screen.getByText('餐饮');
    fireEvent.click(foodButton);

    expect(screen.queryByText(/请选择分类/)).not.toBeInTheDocument();
  });
});
