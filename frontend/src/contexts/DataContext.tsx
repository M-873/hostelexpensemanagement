import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { DailyExpense, Deposit as DepositType, IndividualBalance, Summary } from '@/types';
import { expenseService } from '@/services/expenseService';
import { depositService } from '@/services/depositService';
import { mealService } from '@/services/mealService';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface DataContextType {
  // Expenses
  expenses: DailyExpense[];
  updateMeal: (dateIndex: number, member: string, delta: number) => void;
  updateBazarAmount: (dateIndex: number, value: string) => void;

  // Deposits
  deposits: Deposit[];
  updateDeposit: (memberId: string, amount: number) => void;
  addMember: (name: string, initialDeposit: number) => void;
  addEntry: (date: string) => void;
  isLoading: boolean;

  // Members list derived from deposits
  members: string[];

  // Computed data
  summary: Summary;
  individualBalances: IndividualBalance[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);
  const [deposits, setDeposits] = useState<DepositType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!user?.hostelId) return;

    setIsLoading(true);
    try {
      const [expenseRes, mealRes, depositRes] = await Promise.all([
        expenseService.getExpenses(user.hostelId),
        mealService.getMeals(user.hostelId),
        depositService.getDeposits(user.hostelId)
      ]);

      // Merge backend data into frontend DailyExpense structure
      // Group by date
      const dateMap: Record<string, DailyExpense> = {};

      // Initialize with dates from expenses
      expenseRes.expenses.forEach((exp: any) => {
        const dateStr = new Date(exp.date).toISOString().split('T')[0];
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = {
            date: dateStr,
            meals: {},
            totalMeals: 0,
            bazarAmount: 0,
            dailyTotalExpense: 0
          };
        }
        if (exp.category === 'Bazar') {
          dateMap[dateStr].bazarAmount += exp.amount;
        }
      });

      // Merge meals
      mealRes.meals.forEach((meal: any) => {
        const dateStr = new Date(meal.date).toISOString().split('T')[0];
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = {
            date: dateStr,
            meals: {},
            totalMeals: 0,
            bazarAmount: 0,
            dailyTotalExpense: 0
          };
        }
        dateMap[dateStr].meals[meal.userId] = meal.count;
      });

      // Final processing
      const dailyExpenses = Object.values(dateMap).map(day => {
        const totalMeals = Object.values(day.meals).reduce((sum, val) => sum + val, 0);
        return {
          ...day,
          totalMeals,
          dailyTotalExpense: day.bazarAmount // or however they prefer to show it
        };
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setExpenses(dailyExpenses);

      // Set deposits
      const formattedDeposits = depositRes.deposits.map((d: any) => ({
        memberId: d.userId,
        memberName: d.user?.name || 'Unknown',
        amount: d.amount
      }));
      setDeposits(formattedDeposits);

    } catch (error) {
      console.error('Fetch data error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data from server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.hostelId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Derive members list from deposits
  const members = useMemo(() => deposits.map(d => d.memberName), [deposits]);

  const updateMeal = useCallback(async (dateIndex: number, memberName: string, delta: number) => {
    if (user?.role !== 'admin' || !user.hostelId) return;

    const day = expenses[dateIndex];
    // Find member ID from deposits
    const member = deposits.find(d => d.memberName === memberName);
    if (!member) return;

    const currentMeals = day.meals[member.memberId] || 0;
    const newMeals = Math.max(0, currentMeals + delta);

    try {
      await mealService.upsertMeal({
        date: day.date,
        count: newMeals,
        userId: member.memberId,
        hostelId: user.hostelId
      });
      fetchAllData(); // Refresh to get latest state
    } catch (error) {
      toast({ title: "Error", description: "Failed to update meal.", variant: "destructive" });
    }
  }, [user, expenses, deposits, fetchAllData]);

  const updateBazarAmount = useCallback(async (dateIndex: number, value: string) => {
    if (user?.role !== 'admin' || !user.hostelId) return;

    const amount = parseInt(value) || 0;
    const day = expenses[dateIndex];

    try {
      // Find existing bazar expense for this date
      const existing = await expenseService.getExpenses(user.hostelId, { date: day.date });
      const bazarExp = existing.expenses.find((e: any) => e.category === 'Bazar');

      if (bazarExp) {
        await expenseService.updateExpense(bazarExp.id, { amount });
      } else {
        await expenseService.createExpense({
          amount,
          description: 'Daily Bazar',
          category: 'Bazar',
          date: new Date(day.date).toISOString(),
          hostelId: user.hostelId
        });
      }
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update expense.", variant: "destructive" });
    }
  }, [user, expenses, fetchAllData]);

  const updateDeposit = useCallback(async (memberId: string, amount: number) => {
    if (user?.role !== 'admin' || !user.hostelId) return;

    try {
      // Logic for updating deposit... 
      // Need to find the deposit record ID in backend
      const existing = await depositService.getDeposits(user.hostelId);
      const dep = existing.deposits.find((d: any) => d.userId === memberId);

      if (dep) {
        await depositService.updateDeposit(dep.id, { amount });
      } else {
        await depositService.createDeposit({
          amount,
          description: 'Standard Deposit',
          date: new Date().toISOString(),
          userId: memberId,
          hostelId: user.hostelId
        });
      }
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update deposit.", variant: "destructive" });
    }
  }, [user, fetchAllData]);

  const addMember = useCallback(async (name: string, initialDeposit: number) => {
    // Note: Membership is handled via join requests mostly.
    toast({ title: "Note", description: "Members should join via the Hostel Management page." });
  }, []);

  const addEntry = useCallback(async (date: string) => {
    if (user?.role !== 'admin' || !user.hostelId) return;

    try {
      await expenseService.createExpense({
        amount: 0,
        description: 'New Day Entry',
        category: 'Bazar',
        date: new Date(date).toISOString(),
        hostelId: user.hostelId
      });
      fetchAllData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add entry.", variant: "destructive" });
    }
  }, [user, fetchAllData]);

  // Computed summary

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
      addEntry,
      isLoading,
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
