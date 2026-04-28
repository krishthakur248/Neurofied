import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

export default function Navigation() {
  const location = useLocation();
  const { user } = useAuth();

  const desktopNavItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/test', label: 'Brain Games', icon: 'extension' },
    { path: '/results', label: 'Insights', icon: 'analytics' },
    { path: '/express', label: 'Express', icon: 'auto_awesome' },
    { path: '/predict', label: 'Predict', icon: 'trending_up' },
    { path: '/videos', label: 'Videos', icon: 'play_circle' },
  ];

  const mobileNavItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/express', label: 'Express', icon: 'auto_awesome' },
    { path: '/videos', label: 'Videos', icon: 'play_circle' },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 border-r bg-white border-outline-variant shadow-xl shadow-blue-500/5 p-4 space-y-2 z-50">
        {/* Header */}
        <div className="px-4 py-6 mb-4">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/images/LOGO.jpeg" alt="Neurofied Logo" className="w-10 h-10 object-contain rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-black text-primary font-h2 leading-none">Neurofied.ai</h1>
              <p className="font-body-md text-[13px] text-on-surface-variant mt-1">Clinical Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 space-y-2">
          {desktopNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-body-md text-sm tap-highlight-transparent transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold border-r-4 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="pt-4 pb-2 px-2">
          <Link to="/test" className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary py-3 rounded-lg font-label-md text-label-md transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Assessment</span>
          </Link>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-outline-variant space-y-1">
          <Link to="/profile" className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-body-md text-sm">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Settings</span>
          </Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors font-body-md text-sm">
            <span className="material-symbols-outlined text-[20px]">contact_support</span>
            <span>Support</span>
          </Link>

          {/* Clinician Profile Avatar Mock */}
          {user && (
            <div className="mt-4 flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold text-sm">
                {(user.profile?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-label-md text-on-surface truncate">{user.profile?.name || user.email?.split('@')[0]}</p>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-outline-variant flex items-center justify-around p-2 pb-safe">
        {mobileNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                active 
                  ? 'bg-primary text-white scale-105 shadow-md' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className={`material-symbols-outlined ${active ? 'fill-current' : ''}`}>{item.icon}</span>
              <span className="text-[11px] font-caption font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
