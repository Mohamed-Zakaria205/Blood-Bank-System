import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
  allowedRole: string;
}

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-muted/40" dir="rtl">
    <div className="text-center p-8 bg-card rounded-2xl shadow-sm border border-border max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
          />
        </svg>
      </div>
      <h2 className="text-foreground mb-2" style={{ fontSize: '20px', fontWeight: 700 }}>
        غير مصرح بالدخول
      </h2>
      <p className="text-muted-foreground" style={{ fontSize: '14px' }}>
        ليس لديك صلاحية للوصول إلى هذه الصفحة
      </p>
    </div>
  </div>
);

export default function RoleGuard({ allowedRole }: RoleGuardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  if (!user) return null;
  if (user.role !== allowedRole) return <UnauthorizedPage />;
  return <Outlet />;
}
