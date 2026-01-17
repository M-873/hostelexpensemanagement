import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

export default function Summary() {
  const { summary } = useData();

  return (
    <PageContainer title="Summary">
      <div className="space-y-6">
        {/* Header */}
        <h2 className="section-header">Financial Summary</h2>

        {/* Summary Table */}
        <Card className="max-w-lg">
          <CardContent className="p-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Total Meals</td>
                  <td className="font-semibold">{summary.totalMeals}</td>
                </tr>
                <tr>
                  <td className="font-medium">Total Expense</td>
                  <td className="text-destructive font-semibold">৳{summary.totalExpense}</td>
                </tr>
                <tr>
                  <td className="font-medium">Total Deposit</td>
                  <td className="text-success font-semibold">৳{summary.totalDeposit}</td>
                </tr>
                <tr className="bg-primary/10">
                  <td className="font-semibold">Per Meal Cost</td>
                  <td className="font-bold">৳{summary.perMealCost.toFixed(2)}</td>
                </tr>
                <tr className="bg-success/20">
                  <td className="font-semibold">Current Balance</td>
                  <td className="font-bold text-success text-lg">৳{summary.currentBalance}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-secondary">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{summary.totalMeals}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Meals</p>
            </CardContent>
          </Card>
          
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">৳{summary.totalExpense}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Expense</p>
            </CardContent>
          </Card>
          
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">৳{summary.totalDeposit}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Deposit</p>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">৳{summary.perMealCost.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">Per Meal Cost</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
