import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, TrendingUp, FileText, MessageSquare, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const mockNotifications = [
  {
    id: '1',
    type: 'score_change',
    title: 'Score Update: +15 Points!',
    message: 'Your Experian score increased from 630 to 645. Great progress!',
    timestamp: '2024-05-20 09:00 AM',
    read: false,
    icon: TrendingUp,
  },
  {
    id: '2',
    type: 'dispute_update',
    title: 'Dispute Response Received',
    message: 'Equifax has responded to your dispute for Collection Agency XYZ. The item has been deleted!',
    timestamp: '2024-05-19 02:30 PM',
    read: false,
    icon: CheckCircle2,
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message from Sarah',
    message: "I've prepared your next round of dispute letters. Please review when you have a moment.",
    timestamp: '2024-05-18 11:00 AM',
    read: true,
    icon: MessageSquare,
  },
  {
    id: '4',
    type: 'document',
    title: 'Document Verified',
    message: 'Your proof of address has been verified successfully.',
    timestamp: '2024-05-17 03:45 PM',
    read: true,
    icon: FileText,
  },
  {
    id: '5',
    type: 'ai_insight',
    title: 'AI Insight Available',
    message: 'Our AI has identified a new optimization opportunity for your credit profile.',
    timestamp: '2024-05-16 10:00 AM',
    read: true,
    icon: Sparkles,
  },
];

const notificationSettings = [
  { id: 'score_changes', label: 'Score Changes', description: 'Get notified when your credit score changes', enabled: true },
  { id: 'dispute_updates', label: 'Dispute Updates', description: 'Updates on your dispute status and responses', enabled: true },
  { id: 'messages', label: 'New Messages', description: 'When your VA sends you a message', enabled: true },
  { id: 'documents', label: 'Document Status', description: 'Document verification and upload reminders', enabled: true },
  { id: 'ai_insights', label: 'AI Insights', description: 'AI-generated recommendations and insights', enabled: false },
  { id: 'billing', label: 'Billing Reminders', description: 'Payment reminders and invoice notifications', enabled: true },
];

export default function ClientNotifications() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated on your credit repair journey</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline">Mark All as Read</Button>
          )}
        </div>

        {/* Unread Count */}
        {unreadCount > 0 && (
          <Card className="card-elevated border-primary/30 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">You have {unreadCount} unread notifications</p>
                  <p className="text-sm text-muted-foreground">Click on a notification to mark it as read</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      notification.read
                        ? 'border-border hover:border-primary/30'
                        : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'score_change' ? 'bg-success/10' :
                        notification.type === 'dispute_update' ? 'bg-primary/10' :
                        notification.type === 'ai_insight' ? 'bg-gradient-primary' :
                        'bg-muted'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          notification.type === 'score_change' ? 'text-success' :
                          notification.type === 'dispute_update' ? 'text-primary' :
                          notification.type === 'ai_insight' ? 'text-primary-foreground' :
                          'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <Label htmlFor={setting.id} className="font-medium">{setting.label}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch id={setting.id} defaultChecked={setting.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
