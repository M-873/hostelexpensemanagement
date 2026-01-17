import { DailyExpense, Deposit, IndividualBalance, Summary, User } from '@/types';

export const members = ['Mahfuz', 'Rakib', 'Bipu', 'Ahsan'];

export const mockExpenses: DailyExpense[] = [
  { date: '2026-01-01', meals: {}, bazarAmount: 0, totalMeals: 0, dailyTotalExpense: 0 },
  { date: '2026-01-02', meals: {}, bazarAmount: 0, totalMeals: 0, dailyTotalExpense: 0 },
  { date: '2026-01-03', meals: {}, bazarAmount: 0, totalMeals: 0, dailyTotalExpense: 0 },
  { date: '2026-01-04', meals: {}, bazarAmount: 0, totalMeals: 0, dailyTotalExpense: 0 },
  { date: '2026-01-05', meals: { Mahfuz: 1, Bipu: 1, Ahsan: 1 }, bazarAmount: 2065, totalMeals: 3, dailyTotalExpense: 2065 },
  { date: '2026-01-06', meals: { Mahfuz: 1, Rakib: 1, Bipu: 2, Ahsan: 2 }, bazarAmount: 0, totalMeals: 6, dailyTotalExpense: 0 },
  { date: '2026-01-07', meals: { Mahfuz: 1, Rakib: 1, Bipu: 2, Ahsan: 2 }, bazarAmount: 0, totalMeals: 6, dailyTotalExpense: 0 },
  { date: '2026-01-08', meals: { Mahfuz: 1, Rakib: 1, Bipu: 2, Ahsan: 1 }, bazarAmount: 0, totalMeals: 5, dailyTotalExpense: 0 },
  { date: '2026-01-09', meals: { Mahfuz: 2, Bipu: 2 }, bazarAmount: 665, totalMeals: 4, dailyTotalExpense: 665 },
  { date: '2026-01-10', meals: {}, bazarAmount: 0, totalMeals: 0, dailyTotalExpense: 0 },
  { date: '2026-01-11', meals: {}, bazarAmount: 0, totalMeals: 0, dailyTotalExpense: 0 },
];

// Generate remaining days of the month
for (let i = 12; i <= 31; i++) {
  const day = i.toString().padStart(2, '0');
  mockExpenses.push({
    date: `2026-01-${day}`,
    meals: {},
    bazarAmount: 0,
    totalMeals: 0,
    dailyTotalExpense: 0
  });
}

export const mockDeposits: Deposit[] = [
  { memberId: '1', memberName: 'Mahfuz', amount: 1280 },
  { memberId: '2', memberName: 'Rakib', amount: 500 },
  { memberId: '3', memberName: 'Bipu', amount: 1000 },
  { memberId: '4', memberName: 'Ahsan', amount: 1000 },
];

export const mockIndividualBalances: IndividualBalance[] = [
  { memberId: '1', memberName: 'Mahfuz', totalMeals: 6, perMealCost: 113.75, individualExpense: 682.5, deposit: 1280, finalBalance: 597.5 },
  { memberId: '2', memberName: 'Rakib', totalMeals: 3, perMealCost: 113.75, individualExpense: 341.25, deposit: 500, finalBalance: 158.75 },
  { memberId: '3', memberName: 'Bipu', totalMeals: 9, perMealCost: 113.75, individualExpense: 1023.75, deposit: 1000, finalBalance: -23.75 },
  { memberId: '4', memberName: 'Ahsan', totalMeals: 6, perMealCost: 113.75, individualExpense: 682.5, deposit: 1000, finalBalance: 317.5 },
];

export const mockSummary: Summary = {
  totalMeals: 24,
  totalExpense: 2730,
  totalDeposit: 3780,
  perMealCost: 113.75,
  currentBalance: 1050,
};

export const mockSpaceMembers: User[] = [
  { id: '1', name: 'Mahfuz', email: 'mahfuz@gmail.com', role: 'admin', spaceId: 'space-1' },
  { id: '2', name: 'Rakib', email: 'rakib@gmail.com', role: 'user', spaceId: 'space-1' },
  { id: '3', name: 'Bipu', email: 'bipu@gmail.com', role: 'admin', spaceId: 'space-1' },
  { id: '4', name: 'Ahsan', email: 'ahsan@gmail.com', role: 'user', spaceId: 'space-1' },
  { id: '5', name: 'User5', email: 'user5@gmail.com', role: 'user', spaceId: 'space-1' },
  { id: '6', name: 'User6', email: 'user6@gmail.com', role: 'user', spaceId: 'space-1' },
];
