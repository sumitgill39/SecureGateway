import { useState } from 'react';
import { Save, Shield, Bell, Server, Database, Key, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '60',
    passwordComplexity: 'high',
    twoFactorAuth: false,
    loginNotifications: true,
    maxFailedAttempts: '3',
    accountLockoutDuration: '30',
  });

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    logRetention: '90',
    auditLevel: 'detailed',
    backupFrequency: 'daily',
    maintenanceMode: false,
    apiRateLimit: '1000',
    maxConcurrentSessions: '50',
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    slackIntegration: false,
    teamsIntegration: false,
    webhookUrl: '',
    criticalAlerts: true,
    accessRequestAlerts: true,
    sessionAlerts: false,
  });

  // Integration Settings State
  const [integrationSettings, setIntegrationSettings] = useState({
    ldapEnabled: false,
    ldapServer: '',
    ldapPort: '389',
    ldapBaseDn: '',
    samlEnabled: false,
    samlEntityId: '',
    oktaIntegration: false,
    oktaOrgUrl: '',
  });

  const handleSaveSettings = async (category: string) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Settings saved',
      description: `${category} settings have been updated successfully.`,
    });
    
    setIsSaving(false);
  };

  const isAdmin = user?.role === 'Admin';

  if (!isAdmin && user?.role !== 'TPO') {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Access denied. Settings are only available to Administrators and TPOs.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Server className="w-4 h-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordComplexity">Password Complexity</Label>
                  <Select
                    value={securitySettings.passwordComplexity}
                    onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, passwordComplexity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFailedAttempts">Max Failed Login Attempts</Label>
                  <Input
                    id="maxFailedAttempts"
                    value={securitySettings.maxFailedAttempts}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxFailedAttempts: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    value={securitySettings.accountLockoutDuration}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, accountLockoutDuration: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-gray-500">Send email notifications for new logins</p>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('Security')} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Security Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logRetention">Log Retention (days)</Label>
                  <Input
                    id="logRetention"
                    value={systemSettings.logRetention}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, logRetention: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auditLevel">Audit Log Level</Label>
                  <Select
                    value={systemSettings.auditLevel}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, auditLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="verbose">Verbose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                  <Input
                    id="apiRateLimit"
                    value={systemSettings.apiRateLimit}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, apiRateLimit: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
                  <Input
                    id="maxSessions"
                    value={systemSettings.maxConcurrentSessions}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maxConcurrentSessions: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Select
                    value={systemSettings.backupFrequency}
                    onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Temporarily disable user access</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('System')} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save System Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Slack Integration</Label>
                    <p className="text-sm text-gray-500">Send notifications to Slack channels</p>
                  </div>
                  <Switch
                    checked={notificationSettings.slackIntegration}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, slackIntegration: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Microsoft Teams Integration</Label>
                    <p className="text-sm text-gray-500">Send notifications to Teams channels</p>
                  </div>
                  <Switch
                    checked={notificationSettings.teamsIntegration}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, teamsIntegration: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://hooks.slack.com/services/..."
                    value={notificationSettings.webhookUrl}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Alert Types</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Critical Security Alerts</Label>
                    <p className="text-sm text-gray-500">Failed login attempts, suspicious activities</p>
                  </div>
                  <Switch
                    checked={notificationSettings.criticalAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, criticalAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Access Request Alerts</Label>
                    <p className="text-sm text-gray-500">New access requests and approvals</p>
                  </div>
                  <Switch
                    checked={notificationSettings.accessRequestAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, accessRequestAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Alerts</Label>
                    <p className="text-sm text-gray-500">Session start, end, and timeout notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.sessionAlerts}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, sessionAlerts: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('Notification')} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LDAP Integration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">LDAP Authentication</Label>
                    <p className="text-sm text-gray-500">Connect to your organization's LDAP server</p>
                  </div>
                  <Switch
                    checked={integrationSettings.ldapEnabled}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, ldapEnabled: checked }))}
                  />
                </div>
                
                {integrationSettings.ldapEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200">
                    <div className="space-y-2">
                      <Label htmlFor="ldapServer">LDAP Server</Label>
                      <Input
                        id="ldapServer"
                        placeholder="ldap.company.com"
                        value={integrationSettings.ldapServer}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, ldapServer: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ldapPort">Port</Label>
                      <Input
                        id="ldapPort"
                        placeholder="389"
                        value={integrationSettings.ldapPort}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, ldapPort: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ldapBaseDn">Base DN</Label>
                      <Input
                        id="ldapBaseDn"
                        placeholder="ou=users,dc=company,dc=com"
                        value={integrationSettings.ldapBaseDn}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, ldapBaseDn: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* SAML Integration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">SAML SSO</Label>
                    <p className="text-sm text-gray-500">Enable SAML single sign-on</p>
                  </div>
                  <Switch
                    checked={integrationSettings.samlEnabled}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, samlEnabled: checked }))}
                  />
                </div>
                
                {integrationSettings.samlEnabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-green-200">
                    <div className="space-y-2">
                      <Label htmlFor="samlEntityId">Entity ID</Label>
                      <Input
                        id="samlEntityId"
                        placeholder="https://sams.company.com"
                        value={integrationSettings.samlEntityId}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, samlEntityId: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Okta Integration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Okta Integration</Label>
                    <p className="text-sm text-gray-500">Connect with Okta identity provider</p>
                  </div>
                  <Switch
                    checked={integrationSettings.oktaIntegration}
                    onCheckedChange={(checked) => setIntegrationSettings(prev => ({ ...prev, oktaIntegration: checked }))}
                  />
                </div>
                
                {integrationSettings.oktaIntegration && (
                  <div className="space-y-4 pl-6 border-l-2 border-purple-200">
                    <div className="space-y-2">
                      <Label htmlFor="oktaOrgUrl">Okta Organization URL</Label>
                      <Input
                        id="oktaOrgUrl"
                        placeholder="https://company.okta.com"
                        value={integrationSettings.oktaOrgUrl}
                        onChange={(e) => setIntegrationSettings(prev => ({ ...prev, oktaOrgUrl: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSaveSettings('Integration')} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Integration Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
