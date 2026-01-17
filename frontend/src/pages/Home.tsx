import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { Wallet, Receipt, PieChart, Users, Settings, Plus, Building2, ClipboardList, FileText } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockSummary } from '@/data/mockData';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { toast } from '@/hooks/use-toast';

interface SummaryData {
  totalMeals: number;
  totalExpense: number;
  totalDeposit: number;
  perMealCost: number;
  currentBalance: number;
  todayExpense?: number;
  todayDeposit?: number;
  yesterdayExpense?: number;
  yesterdayDeposit?: number;
}

const navItems = [
  { icon: Building2, label: 'Hostel Management', path: '/hostel-management', color: 'bg-primary' },
  { icon: Wallet, label: 'Deposit', path: '/deposit', color: 'bg-primary' },
  { icon: Receipt, label: 'Expense', path: '/expenses', color: 'bg-destructive' },
  { icon: Users, label: 'Individual Balance', path: '/individual-balance', color: 'bg-warning' },
  { icon: PieChart, label: 'Summary', path: '/summary', color: 'bg-success' },
  { icon: ClipboardList, label: 'Notice Board', path: '/notice-board', color: 'bg-info' },
  { icon: FileText, label: 'Notes', path: '/notes', color: 'bg-secondary' },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const [summary, setSummary] = useState<SummaryData>(mockSummary);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch real-time dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/dashboard/overview?hostelId=${user?.hostelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const overview = data.overview;
        
        setSummary({
          totalMeals: overview.hostel?._count?.expenses || 0,
          totalExpense: overview.today?.totalExpenses || 0,
          totalDeposit: overview.today?.totalDeposits || 0,
          perMealCost: overview.today?.totalExpenses && overview.hostel?._count?.expenses 
            ? overview.today.totalExpenses / overview.hostel._count.expenses 
            : 0,
          currentBalance: overview.currentBalance || 0,
          todayExpense: overview.today?.totalExpenses || 0,
          todayDeposit: overview.today?.totalDeposits || 0,
          yesterdayExpense: overview.yesterday?.totalExpenses || 0,
          yesterdayDeposit: overview.yesterday?.totalDeposits || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [user?.hostelId]);

  // Setup Socket.IO connection
  useEffect(() => {
    if (!user?.hostelId) return;

    const newSocket = io('http://localhost:3001', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join-hostel', user.hostelId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for real-time updates
    newSocket.on('expense-created', () => {
      fetchDashboardData();
    });

    newSocket.on('deposit-created', () => {
      fetchDashboardData();
    });

    newSocket.on('expense-updated', () => {
      fetchDashboardData();
    });

    newSocket.on('deposit-updated', () => {
      fetchDashboardData();
    });

    newSocket.on('expense-deleted', () => {
      fetchDashboardData();
    });

    newSocket.on('deposit-deleted', () => {
      fetchDashboardData();
    });

    newSocket.on('newNotice', (data) => {
      toast({
        title: 'New Notice',
        description: data.message,
      });
    });

    newSocket.on('updatedNotice', (data) => {
      toast({
        title: 'Notice Updated',
        description: data.message,
      });
    });

    newSocket.on('deletedNotice', (data) => {
      toast({
        title: 'Notice Deleted',
        description: data.message,
      });
    });

    setSocket(newSocket);

    // Initial data fetch
    fetchDashboardData();

    return () => {
      newSocket.close();
    };
  }, [user?.hostelId, fetchDashboardData]);

  return (
    <PageContainer showBack={false}>
      <div className="space-y-8">
        {/* Dashboard Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Box-style Navigation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
          {navItems.map((item) => (
            <Card
              key={item.path}
              className="nav-card hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className={`w-16 h-16 rounded-full ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.label}</h3>
                {item.path === '/summary' && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {isConnected ? '🟢 Live' : '🔴 Offline'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>



        {/* Control Panel - Admin Only */}
        {isAdmin && (
          <button
            onClick={() => navigate('/control-panel')}
            className="w-full nav-card flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-secondary">
                <Settings className="h-6 w-6 text-secondary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Control Panel</span>
            </div>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>
    </PageContainer>
  );
}
