import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { DailyExpense, Deposit, IndividualBalance, Summary } from '@/types';
import { mockExpenses as initialExpenses, mockDeposits as initialDeposits } from '@/data/mockData';

interface DataContextType {
  // Expenses
  expenses: DailyExpense[];
  updateMeal: (dateIndex: number, member: string, delta: number) => void;
  updateBazarAmount: (dateIndex: number, value: string) => void;
  
  // Deposits
  deposits: Deposit[];
  updateDeposit: (memberId: string, amount: number) => void;
  addMember: (name: string, initialDeposit: number) => void;
  
  // Members list derived from deposits
  members: string[];
  
  // Computed data
  summary: Summary;
  individualBalances: IndividualBalance[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<DailyExpense[]>(initialExpenses);
  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);

  // Derive members list from deposits
  const members = useMemo(() => deposits.map(d => d.memberName), [deposits]);

  const updateMeal = useCallback((dateIndex: number, member: string, delta: number) => {
    setExpenses(prev => {
      const updated = [...prev];
      const expense = { ...updated[dateIndex] };
      const currentMeals = expense.meals[member] || 0;
      const newMeals = Math.max(0, currentMeals + delta);
      
      expense.meals = { ...expense.meals, [member]: newMeals };
      expense.totalMeals = Object.values(expense.meals).reduce((sum, val) => sum + (val || 0), 0);
      updated[dateIndex] = expense;
      
      return updated;
    });
  }, []);

  const updateBazarAmount = useCallback((dateIndex: number, value: string) => {
    const amount = parseInt(value) || 0;
    setExpenses(prev => {
      const updated = [...prev];
      const expense = { ...updated[dateIndex] };
      expense.bazarAmount = Math.max(0, amount);
      expense.dailyTotalExpense = expense.bazarAmount;
      updated[dateIndex] = expense;
      return updated;
    });
  }, []);

  const updateDeposit = useCallback((memberId: string, amount: number) => {
    setDeposits(prev => prev.map(d => 
      d.memberId === memberId ? { ...d, amount: Math.max(0, amount) } : d
    ));
  }, []);

  const addMember = useCallback((name: string, initialDeposit: number) => {
    const newId = (deposits.length + 1).toString();
    setDeposits(prev => [...prev, {
      memberId: newId,
      memberName: name,
      amount: Math.max(0, initialDeposit)
    }]);
  }, [deposits.length]);

  // Computed summary
  const summary = useMemo((): Summary => {
    const totalMeals = expenses.reduce((sum, exp) => sum + exp.totalMeals, 0);
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.bazarAmount, 0);
    const totalDeposit = deposits.reduce((sum, d) => sum + d.amount, 0);
    const perMealCost = totalMeals > 0 ? totalExpense / totalMeals : 0;
    const currentBalance = totalDeposit - totalExpense;

    return { totalMeals, totalExpense, totalDeposit, perMealCost, currentBalance };
  }, [expenses, deposits]);

  // Computed individual balances
  const individualBalances = useMemo((): IndividualBalance[] => {
    const perMealCost = summary.perMealCost;

    return deposits.map(deposit => {
      const totalMeals = expenses.reduce((sum, exp) => sum + (exp.meals[deposit.memberName] || 0), 0);
      const individualExpense = totalMeals * perMealCost;
      const finalBalance = deposit.amount - individualExpense;

      return {
        memberId: deposit.memberId,
        memberName: deposit.memberName,
        totalMeals,
        perMealCost,
        individualExpense,
        deposit: deposit.amount,
        finalBalance
      };
    });
  }, [expenses, deposits, summary.perMealCost]);

  return (
    <DataContext.Provider value={{
      expenses,
      updateMeal,
      updateBazarAmount,
      deposits,
      updateDeposit,
      addMember,
      members,
      summary,
      individualBalances
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
