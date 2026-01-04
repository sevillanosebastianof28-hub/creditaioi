import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, Download, CheckCircle2, Calendar, DollarSign, Clock } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { format } from 'date-fns';

const currentPlan = {
  name: 'Professional Plan',
  price: 99,
  billing: 'monthly',
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
  const { invoices, isLoading } = useInvoices();

  // Get next pending invoice for billing date
  const pendingInvoice = invoices.find(i => i.status === 'pending');
  const nextBillingDate = pendingInvoice?.due_date 
    ? format(new Date(pendingInvoice.due_date), 'MMMM d, yyyy')
    : 'N/A';

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          </div>
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      </RoleBasedLayout>
    );
  }

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
                  Next billing: {nextBillingDate}
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
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No invoices yet</p>
                <p className="text-sm">Your billing history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div>
                      <p className="font-medium">{invoice.description || 'Service Invoice'}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">${Number(invoice.amount).toFixed(2)}</span>
                      <Badge 
                        className={
                          invoice.status === 'paid' 
                            ? 'bg-success/10 text-success border-success/20'
                            : invoice.status === 'pending'
                            ? 'bg-warning/10 text-warning border-warning/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }
                      >
                        {invoice.status === 'paid' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
