import { useState } from 'react';
import { Plus, Edit2, Check, X, UserPlus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function Deposit() {
  const { isAdmin } = useAuth();
  const { deposits, updateDeposit, addMember } = useData();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDeposit, setNewMemberDeposit] = useState('');
  
  const totalDeposit = deposits.reduce((sum, d) => sum + d.amount, 0);

  const handleEdit = (memberId: string, currentAmount: number) => {
    setEditingId(memberId);
    setEditValue(currentAmount.toString());
  };

  const handleSave = (memberId: string) => {
    updateDeposit(memberId, parseInt(editValue) || 0);
    setEditingId(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      addMember(newMemberName.trim(), parseInt(newMemberDeposit) || 0);
      setNewMemberName('');
      setNewMemberDeposit('');
      setIsAddDialogOpen(false);
    }
  };

  return (
    <PageContainer title="Deposit">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="section-header">Member Deposits</h2>
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Member Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter member name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Initial Deposit (৳)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newMemberDeposit}
                      onChange={(e) => setNewMemberDeposit(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMember} disabled={!newMemberName.trim()}>
                      Add Member
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Deposit Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Deposit Amount (৳)</th>
                    {isAdmin && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit.memberId}>
                      <td className="font-medium">{deposit.memberName}</td>
                      <td className="font-semibold">
                        {editingId === deposit.memberId ? (
                          <Input
                            type="number"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-28 h-8"
                            autoFocus
                          />
                        ) : (
                          `৳${deposit.amount}`
                        )}
                      </td>
                      {isAdmin && (
                        <td>
                          {editingId === deposit.memberId ? (
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                                onClick={() => handleSave(deposit.memberId)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={handleCancel}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEdit(deposit.memberId, deposit.amount)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-highlight font-bold">
                    <td>Total Deposit</td>
                    <td className="text-success">৳{totalDeposit}</td>
                    {isAdmin && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
