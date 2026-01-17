import { useState } from 'react';
import { Plus, UserPlus, Shield, Eye, Edit2, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockSpaceMembers } from '@/data/mockData';
import { Navigate } from 'react-router-dom';

export default function ControlPanel() {
  const { isAdmin } = useAuth();
  const [members] = useState(mockSpaceMembers);

  // Redirect non-admins
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return (
    <PageContainer title="Control Panel">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="section-header">Space Members</h2>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Members ({members.length}/100)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Access</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.id}>
                      <td className="text-muted-foreground">{index + 1}</td>
                      <td className="font-medium">{member.name}</td>
                      <td>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </td>
                      <td className="text-primary">{member.email}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          {member.role === 'admin' ? (
                            <>
                              <Edit2 className="h-4 w-4 text-primary" />
                              <span className="text-sm">editing</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">viewing</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Roles</h3>
                <p className="text-sm text-muted-foreground">Change member permissions</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <Plus className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Create New Space</h3>
                <p className="text-sm text-muted-foreground">For 100+ members</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
