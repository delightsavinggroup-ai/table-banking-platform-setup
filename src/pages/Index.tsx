
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, DollarSign, TrendingUp, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Delight Savings Group</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">Active Group</Badge>
              <Link to="/dashboard">
                <Button>Access Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Table Banking Made Simple
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your savings group with ease. Track contributions, schedule meetings, 
            and grow your community wealth together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/members">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Members
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need for Table Banking
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools necessary to run a successful savings group
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Member Management</CardTitle>
                <CardDescription>
                  Track member details, registration fees, and participation status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• Registration fee: KES 250</div>
                  <div>• Member profiles & contact info</div>
                  <div>• Attendance tracking</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Contribution Tracking</CardTitle>
                <CardDescription>
                  Monitor monthly contributions and maintain accurate records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• Minimum: KES 250/month</div>
                  <div>• Payment history</div>
                  <div>• Automated reminders</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Meeting Scheduler</CardTitle>
                <CardDescription>
                  Organize monthly meetings and track attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• Monthly meeting schedule</div>
                  <div>• Agenda management</div>
                  <div>• Meeting minutes</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Loan Management</CardTitle>
                <CardDescription>
                  Handle loan applications, approvals, and repayments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• Loan application process</div>
                  <div>• Interest calculations</div>
                  <div>• Repayment tracking</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive financial statements and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• Monthly statements</div>
                  <div>• Contribution summaries</div>
                  <div>• Growth analytics</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Stay informed with instant notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• Payment notifications</div>
                  <div>• Meeting reminders</div>
                  <div>• Group announcements</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">25+</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">KES 125K</div>
              <div className="text-muted-foreground">Total Contributions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">12</div>
              <div className="text-muted-foreground">Meetings Held</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">Payment Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription>
                Join Delight Savings Group and start building your financial future today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold">Membership Fee</div>
                  <div className="text-2xl font-bold text-primary">KES 250</div>
                  <div className="text-muted-foreground">One-time registration</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold">Monthly Contribution</div>
                  <div className="text-2xl font-bold text-primary">KES 250+</div>
                  <div className="text-muted-foreground">Minimum amount</div>
                </div>
              </div>
              <Link to="/dashboard">
                <Button size="lg" className="w-full">
                  Access Your Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Delight Savings Group. Building financial futures together.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;