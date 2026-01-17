import { Plus, Minus, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Expenses() {
  const { isAdmin } = useAuth();
  const { expenses, members, updateMeal, updateBazarAmount } = useData();
  
  const [editingCell, setEditingCell] = useState<{dateIndex: number, type: 'meal' | 'bazar', member?: string} | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEditClick = (dateIndex: number, type: 'meal' | 'bazar', member?: string, currentValue?: number) => {
    setEditingCell({ dateIndex, type, member });
    setEditValue(currentValue?.toString() || '');
  };

  const handleSave = () => {
    if (!editingCell) return;
    
    const { dateIndex, type, member } = editingCell;
    const value = parseInt(editValue) || 0;
    
    if (type === 'meal' && member) {
      const currentMeals = expenses[dateIndex].meals[member] || 0;
      const delta = value - currentMeals;
      if (delta !== 0) {
        updateMeal(dateIndex, member, delta);
      }
    } else if (type === 'bazar') {
      updateBazarAmount(dateIndex, editValue);
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  return (
    <PageContainer title="Expenses">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="section-header">Daily Expense Tracker</h2>
          {isAdmin && (
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          )}
        </div>

        {/* Expense Table - Transposed: Members as rows, Dates as columns */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-card z-10 min-w-[120px]">Member</th>
                    {expenses.map((expense, index) => (
                      <th key={expense.date} className="text-center min-w-[80px]">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">#{index + 1}</span>
                          <div className="flex items-center gap-1">
                            <span>{expense.date}</span>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                onClick={() => handleEditClick(index, 'bazar', undefined, expense.bazarAmount || 0)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="bg-highlight/50 min-w-[80px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Member rows with meal counts */}
                  {members.map((member) => {
                    const memberTotal = expenses.reduce((sum, exp) => sum + (exp.meals[member] || 0), 0);
                    return (
                      <tr key={member}>
                        <td className="sticky left-0 bg-card z-10 font-medium border-r">{member}</td>
                        {expenses.map((expense, index) => (
                          <td key={expense.date} className="text-center">
                            {isAdmin ? (
                              editingCell?.dateIndex === index && editingCell?.type === 'meal' && editingCell?.member === member ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-12 h-7 text-center mx-auto text-sm"
                                    autoFocus
                                    onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-success hover:text-success hover:bg-success/10"
                                    onClick={handleSave}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleCancel}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => updateMeal(index, member, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span 
                                    className="w-6 text-center font-medium cursor-pointer hover:bg-muted/50 rounded px-1 flex items-center justify-center gap-1"
                                    onClick={() => handleEditClick(index, 'meal', member, expense.meals[member] || 0)}
                                  >
                                    {expense.meals[member] || 0}
                                    <Edit2 className="h-3 w-3 text-muted-foreground opacity-50" />
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-success hover:text-success hover:bg-success/10"
                                    onClick={() => updateMeal(index, member, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )
                            ) : (
                              <span>{expense.meals[member] || 0}</span>
                            )}
                          </td>
                        ))}
                        <td className="bg-highlight/30 font-semibold text-center">{memberTotal}</td>
                      </tr>
                    );
                  })}
                  
                  {/* Summary rows */}
                  <tr className="bg-muted/30 border-t-2">
                    <td className="sticky left-0 bg-muted/30 z-10 font-semibold border-r">Total Meals</td>
                    {expenses.map((expense) => (
                      <td key={expense.date} className="text-center font-semibold">
                        {expense.totalMeals || 0}
                      </td>
                    ))}
                    <td className="bg-highlight font-bold text-center">
                      {expenses.reduce((sum, exp) => sum + exp.totalMeals, 0)}
                    </td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="sticky left-0 bg-muted/20 z-10 font-semibold border-r">Bazar Amount</td>
                    {expenses.map((expense, index) => (
                      <td key={expense.date} className="text-center">
                        {isAdmin ? (
                          editingCell?.dateIndex === index && editingCell?.type === 'bazar' ? (
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-20 h-7 text-center mx-auto text-sm"
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-success hover:text-success hover:bg-success/10"
                                onClick={handleSave}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={handleCancel}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span 
                              className="cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                              onClick={() => handleEditClick(index, 'bazar', undefined, expense.bazarAmount || 0)}
                            >
                              {expense.bazarAmount ? `৳${expense.bazarAmount}` : '-'}
                            </span>
                          )
                        ) : (
                          <span>{expense.bazarAmount ? `৳${expense.bazarAmount}` : '-'}</span>
                        )}
                      </td>
                    ))}
                    <td className="bg-highlight/50 font-bold text-center">
                      ৳{expenses.reduce((sum, exp) => sum + exp.bazarAmount, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </PageContainer>
  );
}
