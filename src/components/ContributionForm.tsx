import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, DollarSign, CheckCircle, Mail } from "lucide-react";
import { supabase, Member } from "@/lib/supabase";
import { toast } from "sonner";

interface ContributionFormProps {
  onSuccess?: () => void;
}

const ContributionForm = ({ onSuccess }: ContributionFormProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    member_id: "",
    amount: "",
    contribution_month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    payment_method: "M-Pesa",
    notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [success, setSuccess] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_active', true)
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
      setLoadingMembers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberSelect = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setSelectedMember(member || null);
    setFormData(prev => ({
      ...prev,
      member_id: memberId
    }));
  };

  const validateForm = () => {
    if (!formData.member_id) {
      toast.error("Please select a member");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) < 250) {
      toast.error("Minimum contribution is KES 250");
      return false;
    }
    if (!formData.contribution_month) {
      toast.error("Please select contribution month");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('contributions')
        .insert([
          {
            member_id: formData.member_id,
            amount: parseFloat(formData.amount),
            contribution_month: formData.contribution_month,
            payment_method: formData.payment_method,
            notes: formData.notes.trim() || null
          }
        ])
        .select(`
          *,
          member:members(*)
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error("Contribution already recorded for this member and month");
        } else {
          toast.error("Failed to record contribution: " + error.message);
        }
        return;
      }

      setSuccess(true);
      toast.success(`Contribution recorded! ${selectedMember?.email ? 'Email notification sent.' : ''}`);
      
      // Reset form
      setFormData({
        member_id: "",
        amount: "",
        contribution_month: new Date().toISOString().slice(0, 7),
        payment_method: "M-Pesa",
        notes: ""
      });
      setSelectedMember(null);

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Contribution error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contribution Recorded!</h3>
            <p className="text-muted-foreground mb-2">
              The contribution has been successfully recorded.
            </p>
            {selectedMember?.email && (
              <div className="flex items-center justify-center text-sm text-muted-foreground mb-4">
                <Mail className="w-4 h-4 mr-1" />
                Email notification sent to member
              </div>
            )}
            <Button onClick={() => setSuccess(false)}>
              Record Another Contribution
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Record Contribution
        </CardTitle>
        <CardDescription>
          Record a member's monthly contribution to the savings group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member_id">Select Member *</Label>
            {loadingMembers ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading members...</span>
              </div>
            ) : (
              <Select value={formData.member_id} onValueChange={handleMemberSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} - {member.phone_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedMember && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <div><strong>Current Balance:</strong> KES {selectedMember.savings_balance.toLocaleString()}</div>
                  <div><strong>Phone:</strong> {selectedMember.phone_number}</div>
                  {selectedMember.email && <div><strong>Email:</strong> {selectedMember.email}</div>}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="250"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="250.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contribution_month">Contribution Month *</Label>
              <Input
                id="contribution_month"
                name="contribution_month"
                type="month"
                value={formData.contribution_month}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select value={formData.payment_method} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, payment_method: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes about this contribution"
              rows={3}
            />
          </div>

          <Alert>
            <AlertDescription>
              <strong>Reminder:</strong> Minimum monthly contribution is KES 250. 
              {selectedMember?.email && " An email notification will be sent to the member."}
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Record Contribution
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContributionForm;