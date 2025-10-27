
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Search, Filter, Phone, Mail, CreditCard, Loader2 } from "lucide-react";
import { supabase, Member } from "@/lib/supabase";
import MemberRegistration from "@/components/MemberRegistration";
import { toast } from "sonner";

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(member =>
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone_number.includes(searchTerm) ||
      member.id_number.includes(searchTerm) ||
      (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMembers(filtered);
  }, [members, searchTerm]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('full_name');

      if (error) {
        toast.error("Failed to load members");
        return;
      }

      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    fetchMembers();
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Members</h1>
            <p className="text-muted-foreground">Manage group membership and registration</p>
          </div>
          <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <MemberRegistration onSuccess={handleRegistrationSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                {members.filter(m => m.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(members.reduce((sum, m) => sum + m.savings_balance, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Across all members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membership Fees</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter(m => m.membership_fee_paid).length}
              </div>
              <p className="text-xs text-muted-foreground">
                of {members.length} paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(members.reduce((sum, m) => sum + m.total_loans, 0))}
              </div>
              <p className="text-xs text-muted-foreground">Total amount</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Member Directory</CardTitle>
                <CardDescription>
                  {members.length} members • Registration fee: KES 250
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No members found" : "No members yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? "Try adjusting your search terms"
                    : "Start by registering your first member"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowRegistration(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Register First Member
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Savings Balance</TableHead>
                      <TableHead>Outstanding Loans</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.full_name}</div>
                            {member.email && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="w-3 h-3 mr-1" />
                                {member.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1" />
                            {member.phone_number}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {member.id_number}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(member.savings_balance)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {member.total_loans > 0 ? (
                            <span className="text-warning">
                              {formatCurrency(member.total_loans)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={member.is_active ? "secondary" : "destructive"}>
                              {member.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant={member.membership_fee_paid ? "secondary" : "outline"}>
                              {member.membership_fee_paid ? "Fee Paid" : "Fee Pending"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(member.registration_date)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Members;