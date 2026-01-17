import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Users, Hash, Calendar, Search, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';
import { Hostel, MembershipRequest } from '@/types';

// Mock hostel data - in real app this would come from API
const mockHostels: Hostel[] = [
  {
    id: 'hostel-1',
    name: 'Green Valley Hostel',
    registrationNumber: 'GVH2024001',
    adminId: '1',
    adminName: 'Admin User',
    createdAt: '2024-01-01',
    memberCount: 4,
    maxMembers: 10,
    description: 'A peaceful hostel near the university'
  },
  {
    id: 'hostel-2',
    name: 'City Center Hostel',
    registrationNumber: 'CCH2024002',
    adminId: '2',
    adminName: 'Another Admin',
    createdAt: '2024-01-15',
    memberCount: 6,
    maxMembers: 8,
    description: 'Modern hostel in the heart of the city'
  }
];

// Mock membership requests
const mockMembershipRequests: MembershipRequest[] = [
  {
    id: 'req-1',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    hostelId: 'hostel-1',
    hostelName: 'Green Valley Hostel',
    status: 'pending',
    requestedAt: '2024-01-20'
  }
];

export default function HostelManagement() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'search' | 'requests'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hostel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Form states for creating hostel
  const [hostelName, setHostelName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [maxMembers, setMaxMembers] = useState('10');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Generate registration number
  const generateRegistrationNumber = () => {
    const prefix = hostelName.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${new Date().getFullYear()}${random}`;
  };

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelName.trim()) return;
    if (!registrationNumber.trim() || !/^\d{6}$/.test(registrationNumber)) {
      alert('Please enter a valid 6-digit registration number');
      return;
    }

    setIsCreating(true);
    
    // Simulate API call
    setTimeout(() => {
      const newHostel: Hostel = {
        id: `hostel-${Date.now()}`,
        name: hostelName,
        registrationNumber: registrationNumber,
        adminId: user?.id || '1',
        adminName: user?.name || 'Admin',
        createdAt: new Date().toISOString().split('T')[0],
        memberCount: 1, // Admin is first member
        maxMembers: parseInt(maxMembers) || 10,
        description: description || undefined
      };
      
      // In real app, this would be an API call
      console.log('Created hostel:', newHostel);
      
      // Reset form
      setHostelName('');
      setRegistrationNumber('');
      setMaxMembers('10');
      setDescription('');
      setIsCreating(false);
      
      // Show success and redirect to dashboard
      alert(`Hostel "${newHostel.name}" created successfully!\nRegistration Number: ${newHostel.registrationNumber}`);
      navigate('/home');
    }, 1500);
  };

  const handleSearchHostels = () => {
    if (!searchQuery.trim()) return;
    
    // Simulate search
    const results = mockHostels.filter(hostel => 
      hostel.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hostel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleJoinRequest = (hostelId: string, hostelName: string) => {
    const newRequest: MembershipRequest = {
      id: `req-${Date.now()}`,
      userId: user?.id || 'user-1',
      userName: user?.name || 'Current User',
      userEmail: user?.email || 'user@example.com',
      hostelId,
      hostelName,
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0]
    };
    
    // In real app, this would be an API call
    console.log('Membership request sent:', newRequest);
    alert(`Membership request sent to ${hostelName}! You will be notified when approved.`);
    navigate('/home');
  };

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    // In real app, this would be an API call
    console.log(`${action} request:`, requestId);
    alert(`Request ${action}d successfully!`);
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Hostel Management</h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? 'Create and manage your hostels' : 'Find and join a hostel'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border p-1 bg-muted">
            {isAdmin && (
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'create' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Create Hostel
              </button>
            )}
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'search' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Find Hostel
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'requests' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Requests
              </button>
            )}
          </div>
        </div>

        {/* Create Hostel Tab */}
        {activeTab === 'create' && isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Hostel</CardTitle>
              <CardDescription>
                Set up a new hostel with a unique registration number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateHostel} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="hostelName">Hostel Name</Label>
                  <Input
                    id="hostelName"
                    placeholder="Enter hostel name"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number (6 digits)</Label>
                  <Input
                    id="registrationNumber"
                    type="text"
                    placeholder="123456"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    pattern="\d{6}"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter exactly 6 digits for registration number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    placeholder="10"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(e.target.value)}
                    min="1"
                    max="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of your hostel"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Hostel'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search Hostel Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find a Hostel</CardTitle>
                <CardDescription>
                  Search for hostels by registration number or name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter registration number or hostel name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchHostels()}
                  />
                  <Button onClick={handleSearchHostels}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {hasSearched && (
              <div className="space-y-4">
                {searchResults.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hostels found matching your search.</p>
                    </CardContent>
                  </Card>
                ) : (
                  searchResults.map((hostel) => (
                    <Card key={hostel.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold">{hostel.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Hash className="h-3 w-3" />
                                {hostel.registrationNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {hostel.memberCount}/{hostel.maxMembers} members
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {hostel.createdAt}
                              </span>
                            </div>
                            {hostel.description && (
                              <p className="text-sm text-muted-foreground mt-2">{hostel.description}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleJoinRequest(hostel.id, hostel.name)}
                            disabled={hostel.memberCount >= hostel.maxMembers}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Request to Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Membership Requests Tab */}
        {activeTab === 'requests' && isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Membership Requests</CardTitle>
              <CardDescription>
                Review and manage membership requests for your hostels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockMembershipRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending membership requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockMembershipRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{request.userName}</p>
                        <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested to join {request.hostelName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestAction(request.id, 'reject')}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'approve')}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}