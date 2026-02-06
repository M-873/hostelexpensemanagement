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
import { hostelService } from '@/services/hostelService';
import { toast } from '@/hooks/use-toast';

// Membership requests will be fetched from API later
const mockMembershipRequests: MembershipRequest[] = [];

export default function HostelManagement() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'create' | 'search' | 'requests'>('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hostel[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Form states for creating hostel
  const [hostelName, setHostelName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdHostel, setCreatedHostel] = useState<Hostel | null>(null);

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelName.trim()) return;

    setIsCreating(true);
    try {
      const hostel = await hostelService.createHostel({
        name: hostelName,
        address,
        phone,
        email
      });

      setCreatedHostel(hostel);

      toast({
        title: "Success",
        description: `Hostel "${hostel.name}" created! Registration Number: ${hostel.registrationNumber}`,
      });

      // Update local storage user
      if (user) {
        const updatedUser = { ...user, hostelId: hostel.id, role: 'admin' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Create hostel error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create hostel');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSearchHostels = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await hostelService.searchHostels(searchQuery);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search hostels');
    }
  };

  const handleJoinRequest = async (hostelId: string, hostelName: string) => {
    try {
      await hostelService.joinHostel(hostelId);

      toast({
        title: "Joined Successfully",
        description: `You are now a member of ${hostelName}!`,
      });

      // Update local user session
      if (user) {
        const updatedUser = { ...user, hostelId };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Refresh to update context
      }

      navigate('/home');
    } catch (error) {
      console.error('Join error:', error);
      alert(error instanceof Error ? error.message : 'Failed to join hostel');
    }
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                  }`}
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Create Hostel
              </button>
            )}
            <button
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Find Hostel
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
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
                Set up a new hostel. A unique registration number will be generated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createdHostel ? (
                <div className="space-y-6 text-center py-4">
                  <div className="bg-primary/10 p-6 rounded-2xl border-2 border-primary/20 space-y-4">
                    <Building2 className="h-16 w-16 text-primary mx-auto" />
                    <h2 className="text-2xl font-bold">{createdHostel.name}</h2>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Registration Number</p>
                      <p className="text-4xl font-mono font-bold text-primary tracking-widest">{createdHostel.registrationNumber}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Share this number with your members so they can join!</p>
                  </div>
                  <Button onClick={() => navigate('/home')} className="w-full">Go to Dashboard</Button>
                </div>
              ) : (
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
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Hostel address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Contact number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Hostel email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Hostel'}
                  </Button>
                </form>
              )}
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