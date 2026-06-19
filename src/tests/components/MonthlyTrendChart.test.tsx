import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MonthlyTrendChart } from '@/components/MonthlyTrendChart';
import type { MonthlyStat } from '@/types';

describe('MonthlyTrendChart', () => {
  const mockData: MonthlyStat[] = [
    { month: '2026-01', monthLabel: '1月', income: 8000, expense: 5000 },
    { month: '2026-02', monthLabel: '2月', income: 8500, expense: 4500 },
    { month: '2026-03', monthLabel: '3月', income: 9000, expense: 6000 },
  ];

  it('应该渲染折线图容器', () => {
    const { container } = render(<MonthlyTrendChart data={mockData} />);
    const chartContainer = container.querySelector('.h-72');
    expect(chartContainer).toBeInTheDocument();
  });

  it('应该包含 Recharts 图表组件', () => {
    const { container } = render(<MonthlyTrendChart data={mockData} />);
    const rechartsContainer = container.querySelector('.recharts-responsive-container');
    expect(rechartsContainer).toBeInTheDocument();
  });

  it('空数据时也应该渲染图表容器', () => {
    const { container } = render(<MonthlyTrendChart data={[]} />);
    const chartContainer = container.querySelector('.h-72');
    expect(chartContainer).toBeInTheDocument();
  });

  it('单月数据时也应该正常渲染', () => {
    const singleData: MonthlyStat[] = [
      { month: '2026-06', monthLabel: '6月', income: 10000, expense: 5000 },
    ];
    const { container } = render(<MonthlyTrendChart data={singleData} />);
    const chartContainer = container.querySelector('.h-72');
    expect(chartContainer).toBeInTheDocument();
  });

  it('数据应该传递给图表组件', () => {
    const { container } = render(<MonthlyTrendChart data={mockData} />, {
      wrapper: ({ children }) => <div style={{ width: '500px', height: '300px' }}>{children}</div>,
    });
    const rechartsContainer = container.querySelector('.recharts-responsive-container');
    expect(rechartsContainer).toBeInTheDocument();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
