export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: Date;
  userId: string;
  familyId: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetLimit {
  id: string;
  categoryId: string;
  amount: number;
  period: 'month' | 'quarter' | 'year';
  familyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIInsight {
  id: string;
  type: 'savings' | 'alert' | 'tip' | 'recommendation';
  title: string;
  message: string;
  category?: string;
  familyId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: 'limit_exceeded' | 'budget_alert' | 'ai_insight' | 'system';
  title: string;
  message: string;
  read: boolean;
  userId: string;
  familyId: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  budgetUsage: number;
  period: string;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}
