import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, BarChart3, Coins, Plus } from 'lucide-react';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionList } from '@/components/TransactionList';
import { TransactionForm } from '@/components/TransactionForm';
import { BudgetOverview } from '@/components/BudgetOverview';

export default function Home() {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">CoinKeeper</h1>
              <p className="text-xs text-gray-500">轻松记账，掌握财富</p>
            </div>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>记一笔</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <BalanceCard />
        <BudgetOverview />
        <TransactionList />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-around">
          <button
            className="flex flex-col items-center gap-1 px-6 py-2 text-primary-500"
          >
            <Coins className="w-6 h-6" />
            <span className="text-xs font-medium">首页</span>
          </button>
          <button
            onClick={() => navigate('/budget')}
            className="flex flex-col items-center gap-1 px-6 py-2 text-gray-400 hover:text-primary-500 transition-colors"
          >
            <Target className="w-6 h-6" />
            <span className="text-xs font-medium">预算</span>
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="flex flex-col items-center gap-1 px-6 py-2 text-gray-400 hover:text-primary-500 transition-colors"
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs font-medium">统计</span>
          </button>
        </div>
      </nav>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
