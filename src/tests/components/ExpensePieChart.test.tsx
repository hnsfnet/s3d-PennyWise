import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import type { CategoryStat } from '@/types';

describe('ExpensePieChart', () => {
  const mockData: CategoryStat[] = [
    { name: '餐饮', value: 1500, color: '#F97316' },
    { name: '交通', value: 300, color: '#3B82F6' },
    { name: '购物', value: 800, color: '#EC4899' },
  ];

  it('数据为空时应该显示空状态提示', () => {
    render(<ExpensePieChart data={[]} />);
    expect(screen.getByText('该月暂无支出记录')).toBeInTheDocument();
  });

  it('应该渲染分类图例列表', () => {
    render(<ExpensePieChart data={mockData} />);
    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('交通')).toBeInTheDocument();
    expect(screen.getByText('购物')).toBeInTheDocument();
  });

  it('应该正确显示各分类金额', () => {
    render(<ExpensePieChart data={mockData} />);
    expect(screen.getByText('¥1,500.00')).toBeInTheDocument();
    expect(screen.getByText('¥300.00')).toBeInTheDocument();
    expect(screen.getByText('¥800.00')).toBeInTheDocument();
  });

  it('图例颜色应该与数据中的颜色一致', () => {
    const { container } = render(<ExpensePieChart data={mockData} />);
    const colorDots = container.querySelectorAll('.rounded-full.w-3.h-3');
    expect(colorDots).toHaveLength(3);
    expect(colorDots[0]).toHaveStyle('background-color: #F97316');
    expect(colorDots[1]).toHaveStyle('background-color: #3B82F6');
    expect(colorDots[2]).toHaveStyle('background-color: #EC4899');
  });

  it('应该渲染饼图容器', () => {
    const { container } = render(<ExpensePieChart data={mockData} />);
    const pieChartContainer = container.querySelector('.h-64');
    expect(pieChartContainer).toBeInTheDocument();
  });

  it('单条数据时也应该正常渲染', () => {
    const singleData: CategoryStat[] = [
      { name: '餐饮', value: 2000, color: '#F97316' },
    ];
    render(<ExpensePieChart data={singleData} />);
    expect(screen.getByText('餐饮')).toBeInTheDocument();
    expect(screen.getByText('¥2,000.00')).toBeInTheDocument();
  });
});
