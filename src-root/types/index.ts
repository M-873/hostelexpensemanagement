export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  spaceId: string;
  hostelId?: string;
  token?: string;
}

export interface Space {
  id: string;
  name: string;
  createdAt: string;
  memberCount: number;
}

export interface DailyExpense {
  date: string;
  meals: Record<string, number>; // memberId -> meal count
  bazarAmount: number;
  totalMeals: number;
  dailyTotalExpense: number;
}

export interface Deposit {
  memberId: string;
  memberName: string;
  amount: number;
}

export interface IndividualBalance {
  memberId: string;
  memberName: string;
  totalMeals: number;
  perMealCost: number;
  individualExpense: number;
  deposit: number;
  finalBalance: number;
}

export interface Summary {
  totalMeals: number;
  totalExpense: number;
  totalDeposit: number;
  perMealCost: number;
  currentBalance: number;
}

export type MembershipStatus = 'pending' | 'approved' | 'rejected';

export interface Hostel {
  id: string;
  name: string;
  registrationNumber: string;
  adminId: string;
  adminName: string;
  createdAt: string;
  memberCount: number;
  maxMembers: number;
  description?: string;
}

export interface MembershipRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  hostelId: string;
  hostelName: string;
  status: MembershipStatus;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}
