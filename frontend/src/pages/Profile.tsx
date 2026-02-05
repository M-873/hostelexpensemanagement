import { useState } from 'react';
import { User, Shield, Mail, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
    const { user, updateProfile, isAdmin } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [isLoading, setIsLoading] = useState(false);

    if (!user) return null;

    const handleUpdateName = async () => {
        if (!newName.trim() || newName === user.name) {
            setIsEditing(false);
            return;
        }

        setIsLoading(true);
        try {
            const success = await updateProfile(newName);
            if (success) {
                toast({
                    title: "Success",
                    description: "Profile updated successfully!",
                });
                setIsEditing(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PageContainer title="My Profile">
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                <User className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-muted-foreground border">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">User Role</Label>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted text-muted-foreground border">
                                    <Shield className="h-4 w-4" />
                                    <span className="capitalize">{user.role}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <Input
                                            id="name"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="flex-1"
                                        />
                                        <Button
                                            size="icon"
                                            onClick={handleUpdateName}
                                            disabled={isLoading}
                                        >
                                            <Save className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-2 rounded-md border bg-card">
                                        <span>{user.name}</span>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-2">Account Statistics</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-4 rounded-xl bg-primary/5 border">
                                    <p className="text-2xl font-bold text-primary">{user.role === 'admin' ? 'Admin' : 'Member'}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Status</p>
                                </div>
                                <div className="p-4 rounded-xl bg-primary/5 border">
                                    <p className="text-xl font-bold text-primary truncate">
                                        {user.hostelId ? 'Active' : 'No Hostel'}
                                    </p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Hostel Link</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isAdmin && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-yellow-800">Admin Privileges</h4>
                                <p className="text-xs text-yellow-700 mt-1">
                                    As an administrator, you can manage hostel details, approve members, and oversee all financial transactions.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
