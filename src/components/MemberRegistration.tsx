import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface MemberRegistrationProps {
  onSuccess?: () => void;
}

const MemberRegistration = ({ onSuccess }: MemberRegistrationProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    id_number: "",
    phone_number: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.id_number.trim()) {
      toast.error("ID number is required");
      return false;
    }
    if (!formData.phone_number.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (formData.phone_number.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Format phone number
      let phoneNumber = formData.phone_number.replace(/\s+/g, '');
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '+254' + phoneNumber.substring(1);
      } else if (!phoneNumber.startsWith('+254')) {
        phoneNumber = '+254' + phoneNumber;
      }

      const { data, error } = await supabase
        .from('members')
        .insert([
          {
            full_name: formData.full_name.trim(),
            id_number: formData.id_number.trim(),
            phone_number: phoneNumber,
            email: formData.email.trim() || null,
            membership_fee_paid: false,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          if (error.message.includes('phone_number')) {
            toast.error("Phone number already registered");
          } else if (error.message.includes('id_number')) {
            toast.error("ID number already registered");
          } else {
            toast.error("Member already exists");
          }
        } else {
          toast.error("Registration failed: " + error.message);
        }
        return;
      }

      setSuccess(true);
      toast.success("Member registered successfully!");
      
      // Reset form
      setFormData({
        full_name: "",
        id_number: "",
        phone_number: "",
        email: ""
      });

      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Registration error:', error);
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
            <h3 className="text-lg font-semibold mb-2">Registration Successful!</h3>
            <p className="text-muted-foreground mb-4">
              The new member has been added to Delight Savings Group.
            </p>
            <Button onClick={() => setSuccess(false)}>
              Register Another Member
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
          <UserPlus className="w-5 h-5 mr-2" />
          Member Registration
        </CardTitle>
        <CardDescription>
          Register a new member to Delight Savings Group. Membership fee: KES 250
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_number">ID Number *</Label>
            <Input
              id="id_number"
              name="id_number"
              value={formData.id_number}
              onChange={handleInputChange}
              placeholder="Enter ID number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number *</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              placeholder="0712345678 or +254712345678"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
          </div>

          <Alert>
            <AlertDescription>
              <strong>Registration Requirements:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Membership fee: KES 250 (to be paid separately)</li>
                <li>• Minimum monthly contribution: KES 250</li>
                <li>• Phone number will be used for account access</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Register Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberRegistration;