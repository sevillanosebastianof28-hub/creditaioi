import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BrandingSettings } from '@/components/settings/BrandingSettings';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  CreditCard,
  Mail,
  Smartphone,
  Key,
  Globe,
  Palette,
} from 'lucide-react';

const Settings = () => {
  const { role, user, profile } = useAuth();
  const isAgencyOwner = role === 'agency_owner';

  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [bureauResponses, setBureauResponses] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phone || '');
    }
    if (isAgencyOwner && profile?.agency_id) {
      supabase
        .from('agencies')
        .select('name')
        .eq('id', profile.agency_id)
        .single()
        .then(({ data }) => {
          if (data) setCompanyName(data.name);
        });
    }
  }, [profile, user, isAgencyOwner]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      if (isAgencyOwner && profile?.agency_id && companyName) {
        const { error: agencyError } = await supabase
          .from('agencies')
          .update({ name: companyName })
          .eq('id', profile.agency_id);
        if (agencyError) throw agencyError;
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSavingSecurity(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      // Save notification preferences to brand_settings if agency owner
      if (isAgencyOwner && profile?.agency_id) {
        const { error } = await supabase
          .from('brand_settings')
          .update({
            notification_settings: {
              email_notifications: emailNotifications,
              sms_notifications: smsNotifications,
              dispute_updates: bureauResponses,
              billing_reminders: paymentAlerts,
              score_change_alerts: true,
              marketing_emails: false,
            }
          })
          .eq('agency_id', profile.agency_id);
        
        if (error) throw error;
      }
      toast.success('Notification preferences saved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setIsSavingNotifications(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and application preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary flex-wrap">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            {isAgencyOwner && (
              <TabsTrigger value="branding">White Label</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                {isAgencyOwner && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input 
                        id="company" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </>
                )}
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about client activity
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Get text alerts for urgent updates
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={smsNotifications} 
                      onCheckedChange={setSmsNotifications} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Bureau Responses</p>
                        <p className="text-sm text-muted-foreground">
                          Notify when bureaus respond to disputes
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={bureauResponses} 
                      onCheckedChange={setBureauResponses} 
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Payment Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Notify about payments and billing
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={paymentAlerts} 
                      onCheckedChange={setPaymentAlerts} 
                    />
                  </div>
                </div>
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={handleSaveNotifications}
                  disabled={isSavingNotifications}
                >
                  {isSavingNotifications && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 8 chars)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <Switch disabled />
                </div>
                <p className="text-xs text-muted-foreground">Two-factor authentication coming soon.</p>
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={handleUpdatePassword}
                  disabled={isSavingSecurity || !newPassword}
                >
                  {isSavingSecurity && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Integrations
                </CardTitle>
                <CardDescription>
                  Connect third-party services and APIs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'SmartCredit API', status: 'connected', description: 'Credit report import' },
                  { name: 'IdentityIQ', status: 'disconnected', description: 'Score monitoring' },
                  { name: 'Stripe', status: 'disconnected', description: 'Payment processing' },
                  { name: 'Twilio', status: 'disconnected', description: 'SMS notifications' },
                  { name: 'SendGrid', status: 'disconnected', description: 'Email delivery' },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <Button
                      variant={integration.status === 'connected' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toast.info(`${integration.name} integration setup coming soon`)}
                    >
                      {integration.status === 'connected' ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle dark mode for the interface
                    </p>
                  </div>
                  <Switch 
                    onCheckedChange={(checked) => {
                      document.documentElement.classList.toggle('dark', checked);
                      toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled');
                    }}
                    defaultChecked={document.documentElement.classList.contains('dark')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for more content
                    </p>
                  </div>
                  <Switch 
                    onCheckedChange={(checked) => {
                      toast.info(checked ? 'Compact mode enabled' : 'Normal mode restored');
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isAgencyOwner && (
            <TabsContent value="branding">
              <BrandingSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;