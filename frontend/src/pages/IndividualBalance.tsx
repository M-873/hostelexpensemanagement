import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';

export default function IndividualBalance() {
  const { individualBalances } = useData();

  return (
    <PageContainer title="Individual Balance">
      <div className="space-y-6">
        {/* Header */}
        <h2 className="section-header">Member Balances</h2>

        {/* Balance Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Total Meals</th>
                    <th>Per Meal Cost</th>
                    <th>Individual Expense</th>
                    <th>Deposit</th>
                    <th>Final Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {individualBalances.map((item) => (
                    <tr key={item.memberId}>
                      <td className="font-medium">{item.memberName}</td>
                      <td className="bg-highlight/30">{item.totalMeals}</td>
                      <td>৳{item.perMealCost.toFixed(2)}</td>
                      <td className="text-destructive">৳{item.individualExpense.toFixed(2)}</td>
                      <td className="text-success">৳{item.deposit}</td>
                      <td className={`font-bold ${item.finalBalance >= 0 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                        ৳{item.finalBalance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-success/20" />
            <span className="text-muted-foreground">Positive Balance (Credit)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-destructive/20" />
            <span className="text-muted-foreground">Negative Balance (Debit)</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
