import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MENUS = {
  supplier: [
    ['/dashboard/supplier', 'Overview', true],
    ['/dashboard/supplier/profile', 'Company profile'],
    ['/dashboard/supplier/products', 'Products'],
    ['/dashboard/supplier/rfqs', 'Inquiries (RFQs)'],
    ['/dashboard/supplier/messages', 'Messages'],
    ['/dashboard/supplier/analytics', 'Analytics'],
  ],
  buyer: [
    ['/dashboard/buyer', 'Overview', true],
    ['/dashboard/buyer/search', 'Find suppliers'],
    ['/dashboard/buyer/rfqs/new', 'Create RFQ'],
    ['/dashboard/buyer/rfqs', 'My RFQs', true],
    ['/dashboard/buyer/messages', 'Messages'],
  ],
  admin: [
    ['/admin', 'Overview', true],
    ['/admin/accounts', 'Account verification'],
    ['/admin/users', 'Users'],
    ['/admin/settings', 'Settings'],
  ],
};

export default function DashboardLayout({ role }) {
  const { user } = useAuth();
  const menu = MENUS[role] || [];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
      <aside className="lg:w-60 lg:shrink-0">
        <div className="card p-4">
          <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {user?.fullName}
          </p>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {menu.map(([to, label, end]) => (
              <NavLink
                key={to}
                to={to}
                end={!!end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive ? 'bg-white/10 text-brand-300 shadow-sm' : 'text-gray-200 hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
