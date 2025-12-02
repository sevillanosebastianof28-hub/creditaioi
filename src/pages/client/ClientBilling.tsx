import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, CheckCircle2, Calendar, DollarSign } from 'lucide-react';

const mockInvoices = [
  { id: '1', date: '2024-05-01', amount: 99.00, status: 'paid', description: 'Monthly Credit Repair Service' },
  { id: '2', date: '2024-04-01', amount: 99.00, status: 'paid', description: 'Monthly Credit Repair Service' },
  { id: '3', date: '2024-03-01', amount: 99.00, status: 'paid', description: 'Monthly Credit Repair Service' },
  { id: '4', date: '2024-02-01', amount: 149.00, status: 'paid', description: 'Setup Fee + First Month' },
];

const currentPlan = {
  name: 'Professional Plan',
  price: 99,
  billing: 'monthly',
  nextBilling: '2024-06-01',
  features: [
    '3-Bureau Credit Monitoring',
    'Unlimited Dispute Letters',
    'Dedicated VA Support',
    'AI-Powered Analysis',
    'Score Simulator Access',
    'Priority Processing',
  ],
};

export default function ClientBilling() {
  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and view invoices</p>
        </div>

        {/* Current Plan */}
        <Card className="card-elevated border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Current Plan
              </CardTitle>
              <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
                <p className="text-muted-foreground">
                  <span className="text-3xl font-bold text-foreground">${currentPlan.price}</span>/month
                </p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Next billing: {new Date(currentPlan.nextBilling).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline">Update Payment</Button>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-medium mb-3">Plan Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentPlan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/26</p>
                </div>
              </div>
              <Badge>Default</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-medium">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">${invoice.amount.toFixed(2)}</span>
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Paid
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
