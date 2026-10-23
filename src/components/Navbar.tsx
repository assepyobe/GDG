import React from 'react';
import { Flame, Plus, Calculator, User, LogOut, Compass, LogIn, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentTab: 'runs' | 'routes' | 'calculator' | 'profile';
  onSelectTab: (tab: 'runs' | 'routes' | 'calculator' | 'profile') => void;
  onOpenPostModal: () => void;
  runsCount: number;
  routesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPostModal,
  runsCount,
  routesCount = 0,
}) => {
  const { user, userProfile, signInWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('runs')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-5 h-5 text-slate-950 fill-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  STRIDE<span className="text-orange-500">CLUB</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Community
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Run together. Go further.</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('runs')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'runs'
                  ? 'bg-slate-800 text-white shadow-sm shadow-black/20 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Compass className="w-4 h-4 text-orange-400" />
              <span>Runs</span>
              {runsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {runsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('routes')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'routes'
                  ? 'bg-slate-800 text-white shadow-sm shadow-black/20 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Bookmark className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Route Library</span>
              <span className="sm:hidden">Routes</span>
              {routesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {routesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('calculator')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'calculator'
                  ? 'bg-slate-800 text-white shadow-sm shadow-black/20 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Pace Calculator</span>
              <span className="md:hidden">Pace</span>
            </button>

            {user && (
              <button
                onClick={() => onSelectTab('profile')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'profile'
                    ? 'bg-slate-800 text-white shadow-sm shadow-black/20 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <User className="w-4 h-4 text-sky-400" />
                <span className="hidden md:inline">My Profile</span>
                <span className="md:hidden">Me</span>
              </button>
            )}
          </nav>

          {/* Action Button & User Section */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenPostModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Post a Run</span>
              <span className="sm:hidden">Post</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => onSelectTab('profile')}
                  className="flex items-center gap-2 text-left group"
                  title="View Profile"
                >
                  {userProfile?.photoURL || user.photoURL ? (
                    <img
                      src={userProfile?.photoURL || user.photoURL || ''}
                      alt={userProfile?.displayName || user.displayName || 'Runner'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/30 group-hover:ring-orange-500 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-orange-400">
                      {(userProfile?.displayName || user.displayName || 'R')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-xs">
                    <p className="font-semibold text-slate-200 group-hover:text-white truncate max-w-[100px]">
                      {userProfile?.displayName || user.displayName || 'Runner'}
                    </p>
                    <p className="text-[10px] text-slate-400">Member</p>
                  </div>
                </button>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Sign in with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
