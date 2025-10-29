
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, DollarSign, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Contribution {
  id: string;
  member_id: string;
  amount: number;
  contribution_type: string;
  date: string;
  status: string;
  member?: {
    name: string;
    membership_number: string;
  };
}

interface Member {
  id: string;
  name: string;
  membership_number: string;
}

const Contributions: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    contribution_type: 'monthly',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchContributions();
    fetchMembers();
  }, []);

  const fetchContributions = async () => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          *,
          member:members(name, membership_number)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      toast.error("Failed to fetch contributions");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, membership_number')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('contributions')
        .insert([{
          member_id: formData.member_id,
          amount: parseFloat(formData.amount),
          contribution_type: formData.contribution_type,
          date: formData.date,
          status: 'completed'
        }]);

      if (error) throw error;

      toast.success("Contribution recorded successfully");

      setFormData({
        member_id: '',
        amount: '',
        contribution_type: 'monthly',
        date: new Date().toISOString().split('T')[0]
      });

      fetchContributions();
    } catch (error) {
      console.error('Error recording contribution:', error);
      toast.error("Failed to record contribution");
    }
  };

  const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
  const monthlyContributions = contributions.filter(c => 
    c.contribution_type === 'monthly' && 
    new Date(c.date).getMonth() === new Date().getMonth()
  );
  const monthlyTotal = monthlyContributions.reduce((sum, contrib) => sum + contrib.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading contributions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Contributions</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyContributions.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthlyContributions.length > 0 ? (monthlyTotal / monthlyContributions.length).toFixed(0) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Per contribution</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="record" className="space-y-4">
        <TabsList>
          <TabsTrigger value="record">Record Contribution</TabsTrigger>
          <TabsTrigger value="history">Contribution History</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Record New Contribution</CardTitle>
              <CardDescription>Add a new member contribution to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="member">Member</Label>
                    <Select 
                      value={formData.member_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, member_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.membership_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Contribution Type</Label>
                    <Select 
                      value={formData.contribution_type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, contribution_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly Contribution</SelectItem>
                        <SelectItem value="special">Special Assessment</SelectItem>
                        <SelectItem value="voluntary">Voluntary Contribution</SelectItem>
                        <SelectItem value="penalty">Penalty/Fine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full md:w-auto">
                  Record Contribution
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>View all recorded contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No contributions recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      contributions.map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell>
                            {new Date(contribution.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{contribution.member?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {contribution.member?.membership_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {contribution.contribution_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${contribution.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={contribution.status === 'completed' ? 'default' : 'secondary'}
                            >
                              {contribution.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contributions;