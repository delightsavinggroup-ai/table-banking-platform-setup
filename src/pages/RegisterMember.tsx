
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationResult {
  phoneNumber: string;
  fullName: string;
  tempPassword: string;
  role: string;
}

export default function RegisterMember() {
  const { isChairman } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isChairman) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Only the chairman can register new members.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const generatePassword = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRegistrationResult(null);

    try {
      // Generate temporary password
      const tempPassword = generatePassword();
      const email = `${phoneNumber}@savingsgroup.local`;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          phone_number: phoneNumber,
          full_name: fullName,
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Insert user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          phone_number: phoneNumber,
          full_name: fullName,
          is_active: true,
          password_changed: false,
        });

      if (profileError) throw profileError;

      // Get role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', selectedRole)
        .single();

      if (roleError) throw roleError;

      // Assign role
      const { error: roleAssignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role_id: roleData.id,
          is_active: true,
        });

      if (roleAssignError) throw roleAssignError;

      // Show success with credentials
      setRegistrationResult({
        phoneNumber,
        fullName,
        tempPassword,
        role: selectedRole,
      });

      toast.success('Member registered successfully!');

      // Reset form
      setPhoneNumber('');
      setFullName('');
      setSelectedRole('member');

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register member');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCredentials = () => {
    const credentials = `Phone: ${registrationResult?.phoneNumber}\nPassword: ${registrationResult?.tempPassword}`;
    navigator.clipboard.writeText(credentials);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Register New Member</CardTitle>
              <CardDescription>
                Create a new member account with auto-generated credentials
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {registrationResult && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-green-900">Member registered successfully!</p>
                  <div className="bg-white p-3 rounded border border-green-200 space-y-1">
                    <p className="text-sm"><strong>Name:</strong> {registrationResult.fullName}</p>
                    <p className="text-sm"><strong>Phone:</strong> {registrationResult.phoneNumber}</p>
                    <p className="text-sm"><strong>Temporary Password:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{registrationResult.tempPassword}</code></p>
                    <p className="text-sm"><strong>Role:</strong> {registrationResult.role}</p>
                  </div>
                  <Button
                    onClick={copyCredentials}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Credentials
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Share these credentials with the member. They will be prompted to change their password on first login.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter member's full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                  <SelectItem value="chairman">Chairman</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Assign the appropriate role for this member
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Member
                </>
              )}
            </Button>
          </form>

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Note:</strong> A temporary 6-digit password will be automatically generated.
              The member will be required to change it upon first login.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}