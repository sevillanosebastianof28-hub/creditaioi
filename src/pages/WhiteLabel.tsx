import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BrandingSettings } from '@/components/settings/BrandingSettings';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const WhiteLabel = () => {
  const { role } = useAuth();
  
  // Only agency owners can access white label settings
  if (role !== 'agency_owner') {
    return <Navigate to="/index" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <BrandingSettings />
      </div>
    </DashboardLayout>
  );
};

export default WhiteLabel;
