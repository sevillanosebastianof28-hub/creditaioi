import { useState } from 'react';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Camera, Save, Building2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VASettings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Martinez',
    email: 'sarah@agency.com',
    phone: '(555) 987-6543',
  });

  const [notifications, setNotifications] = useState({
    newTasks: true,
    clientMessages: true,
    documentUploads: true,
    disputeResponses: true,
    dailySummary: false,
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your VA account settings</p>
        </div>

        {/* Profile Section */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h3>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-warning/10 text-warning border-warning/20">VA Staff</Badge>
                  <Badge variant="outline">
                    <Building2 className="w-3 h-3 mr-1" />
                    CreditFix Agency
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Choose what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="newTasks" className="font-medium">New Tasks</Label>
                  <p className="text-sm text-muted-foreground">Get notified when AI assigns new tasks</p>
                </div>
                <Switch
                  id="newTasks"
                  checked={notifications.newTasks}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, newTasks: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="clientMessages" className="font-medium">Client Messages</Label>
                  <p className="text-sm text-muted-foreground">Notifications for new client messages</p>
                </div>
                <Switch
                  id="clientMessages"
                  checked={notifications.clientMessages}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, clientMessages: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="documentUploads" className="font-medium">Document Uploads</Label>
                  <p className="text-sm text-muted-foreground">When clients upload new documents</p>
                </div>
                <Switch
                  id="documentUploads"
                  checked={notifications.documentUploads}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, documentUploads: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="disputeResponses" className="font-medium">Dispute Responses</Label>
                  <p className="text-sm text-muted-foreground">When bureaus respond to disputes</p>
                </div>
                <Switch
                  id="disputeResponses"
                  checked={notifications.disputeResponses}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, disputeResponses: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <Label htmlFor="dailySummary" className="font-medium">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily email summary</p>
                </div>
                <Switch
                  id="dailySummary"
                  checked={notifications.dailySummary}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, dailySummary: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Schedule */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Work Schedule
            </CardTitle>
            <CardDescription>Your assigned working hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <p className="font-medium">Working Hours</p>
                <p className="text-muted-foreground">9:00 AM - 5:00 PM EST</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <p className="font-medium">Work Days</p>
                <p className="text-muted-foreground">Monday - Friday</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Contact your agency administrator to update your work schedule.
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 45 days ago</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-gradient-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </RoleBasedLayout>
  );
}
