import { Link } from 'react-router-dom';
import { useAuth } from '../App';

export default function PageHeader({ title, searchPlaceholder = "Search..." }) {
  const { user, loading } = useAuth();

  // Resolve display name: prefer profile name → user_metadata full_name → email prefix
  const displayName =
    user?.profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const initial = (displayName[0] || 'U').toUpperCase();

  // Resolve avatar: prefer profile avatar → user_metadata avatar
  const avatarUrl =
    user?.profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    null;

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-outline-variant shadow-sm">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container-low border border-outline-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 font-body-md text-sm text-on-surface placeholder:text-on-surface-variant/50 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Notification Bell */}
          <button className="relative text-on-surface-variant hover:text-primary transition-colors group" aria-label="Notifications">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full animate-pulse"></span>
          </button>

          {/* Help Icon */}
          <button className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Help">
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-outline-variant"></div>

          {/* Profile Link */}
          <Link
            to="/profile"
            className="hidden md:flex items-center gap-2.5 group px-3 py-1.5 rounded-full hover:bg-surface-container-low transition-all duration-200"
            title={user?.email || ''}
          >
            {loading ? (
              // Skeleton while loading
              <>
                <div className="w-24 h-4 bg-surface-container rounded animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse" />
              </>
            ) : (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-tight max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-on-surface-variant/70 leading-tight max-w-[120px] truncate">
                    {user?.email || ''}
                  </span>
                </div>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/15 group-hover:bg-primary/25 flex items-center justify-center text-primary text-sm font-bold transition-all border border-primary/20">
                    {initial}
                  </div>
                )}
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
