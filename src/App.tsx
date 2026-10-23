import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, 
  Flame, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { FiltersBar } from './components/FiltersBar.tsx';
import { RunCard } from './components/RunCard.tsx';
import { RunDetailModal } from './components/RunDetailModal.tsx';
import { PostRunModal } from './components/PostRunModal.tsx';
import { SaveRouteModal } from './components/SaveRouteModal.tsx';
import { RouteLibraryView } from './components/RouteLibraryView.tsx';
import { PaceCalculator } from './components/PaceCalculator.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { RunItem, RunFilters, SavedRoute } from './types.ts';
import { subscribeToRuns, toggleRunRSVP } from './services/runsService.ts';
import { subscribeToRoutes } from './services/routesService.ts';

function MainContent() {
  const { user, userProfile } = useAuth();

  const [runs, setRuns] = useState<RunItem[]>([]);
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [selectedRun, setSelectedRun] = useState<RunItem | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSaveRouteModalOpen, setIsSaveRouteModalOpen] = useState(false);
  const [routeToSchedule, setRouteToSchedule] = useState<SavedRoute | null>(null);
  const [currentTab, setCurrentTab] = useState<'runs' | 'routes' | 'calculator' | 'profile'>('runs');
  const [rsvpPendingId, setRsvpPendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<RunFilters>({
    search: '',
    distanceCategory: 'all',
    paceCategory: 'all',
    terrain: 'all',
    timeframe: 'all',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Realtime subscription to runs
  useEffect(() => {
    const unsubscribe = subscribeToRuns(
      (loadedRuns) => {
        setRuns(loadedRuns);
        setLoadingRuns(false);

        // Keep selectedRun in sync if currently viewed
        if (selectedRun) {
          const updated = loadedRuns.find((r) => r.id === selectedRun.id);
          if (updated) setSelectedRun(updated);
        } else {
          // Check for invite link parameter in URL: ?run=<id>
          const urlParams = new URLSearchParams(window.location.search);
          const inviteRunId = urlParams.get('run');
          if (inviteRunId) {
            const foundRun = loadedRuns.find((r) => r.id === inviteRunId);
            if (foundRun) {
              setSelectedRun(foundRun);
              showToast(`Opened invite for ${foundRun.title}! 🏃`);
            }
          }
        }
      },
      (error) => {
        console.error('Subscription error:', error);
        setLoadingRuns(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Realtime subscription to routes
  useEffect(() => {
    const unsubscribe = subscribeToRoutes(
      (loadedRoutes) => {
        setRoutes(loadedRoutes);
      },
      (error) => {
        console.error('Routes subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle RSVP Toggle
  const handleToggleRSVP = async (run: RunItem) => {
    if (!user) return;
    setRsvpPendingId(run.id);
    try {
      const nowJoined = await toggleRunRSVP(
        run,
        user.uid,
        userProfile?.displayName || user.displayName || 'Club Runner',
        userProfile?.photoURL || user.photoURL || ''
      );
      showToast(
        nowJoined
          ? `Joined! You're attending ${run.title}! 🏃`
          : `Withdrawn from ${run.title}`
      );
    } catch (err) {
      console.error('RSVP toggle error:', err);
      showToast('Could not update RSVP. Please try again.');
    } finally {
      setRsvpPendingId(null);
    }
  };

  // Filter runs
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchTitle = run.title.toLowerCase().includes(query);
        const matchLocation = run.meetLocation.toLowerCase().includes(query);
        const matchAddress = run.address.toLowerCase().includes(query);
        const matchHighlights = run.routeHighlights.some((h) => h.toLowerCase().includes(query));
        if (!matchTitle && !matchLocation && !matchAddress && !matchHighlights) {
          return false;
        }
      }

      // Distance
      if (filters.distanceCategory === 'short' && run.distanceKm >= 6) return false;
      if (filters.distanceCategory === 'medium' && (run.distanceKm < 6 || run.distanceKm > 12)) return false;
      if (filters.distanceCategory === 'long' && (run.distanceKm <= 12 || run.distanceKm > 25)) return false;
      if (filters.distanceCategory === 'ultra' && run.distanceKm <= 25) return false;

      // Pace Category
      if (filters.paceCategory !== 'all') {
        if (run.paceCategory && run.paceCategory !== filters.paceCategory) return false;
      }

      // Terrain
      if (filters.terrain !== 'all' && run.terrain !== filters.terrain) {
        return false;
      }

      // Timeframe
      if (filters.timeframe !== 'all') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (filters.timeframe === 'today' && run.date !== todayStr) return false;
      }

      return true;
    });
  }, [runs, filters]);

  // Club summary metrics
  const totalUpcomingKm = useMemo(() => {
    return runs.reduce((acc, r) => acc + r.distanceKm, 0);
  }, [runs]);

  const totalGoing = useMemo(() => {
    return runs.reduce((acc, r) => acc + r.rsvpCount, 0);
  }, [runs]);

  // Handle scheduling from Route Library
  const handleScheduleFromRoute = (route: SavedRoute) => {
    setRouteToSchedule(route);
    setIsPostModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-orange-500/40 text-white shadow-2xl shadow-black/80 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-orange-400 stroke-[2.5]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenPostModal={() => {
          setRouteToSchedule(null);
          setIsPostModalOpen(true);
        }}
        runsCount={runs.length}
        routesCount={routes.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {currentTab === 'runs' && (
          <>
            {/* Club Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-orange-950/40 border border-slate-800 p-6 sm:p-10 shadow-2xl">
              {/* Background energetic glow */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                    <span>Every Pace Has A Place</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                    Upcoming Group Runs &amp; <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                      Weekend Miles
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Explore member-hosted routes, check paces, RSVP with fellow runners, and join our post-run social coffee.
                  </p>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                  <button
                    onClick={() => {
                      setRouteToSchedule(null);
                      setIsPostModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    <span>Post an Upcoming Run</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('routes')}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/30 transition-all"
                  >
                    <Bookmark className="w-4 h-4 text-teal-400" />
                    <span>Browse Route Library ({routes.length})</span>
                  </button>
                </div>
              </div>

              {/* Club Metrics Pill Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Scheduled Runs</p>
                    <p className="text-base font-extrabold text-white">{runs.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Total Distance</p>
                    <p className="text-base font-extrabold text-white">{totalUpcomingKm.toFixed(1)} km</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Total RSVPs</p>
                    <p className="text-base font-extrabold text-white">{totalGoing} Runners</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Saved Routes</p>
                    <p className="text-base font-extrabold text-white">{routes.length} Tracks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <FiltersBar
              filters={filters}
              onChange={setFilters}
              totalRuns={runs.length}
              filteredCount={filteredRuns.length}
            />

            {/* Runs Grid or Empty State */}
            {loadingRuns ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse p-6 space-y-4"
                  >
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                    <div className="h-6 bg-slate-800 rounded w-3/4" />
                    <div className="h-16 bg-slate-800/60 rounded" />
                    <div className="h-10 bg-slate-800 rounded mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredRuns.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">No matching runs found</h3>
                <p className="text-xs text-slate-400">
                  Try adjusting your distance, pace, or terrain filters, or be the one to schedule the next run!
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() =>
                      setFilters({
                        search: '',
                        distanceCategory: 'all',
                        paceCategory: 'all',
                        terrain: 'all',
                        timeframe: 'all',
                      })
                    }
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>

                  <button
                    onClick={() => {
                      setRouteToSchedule(null);
                      setIsPostModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Host a Run</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRuns.map((run) => (
                  <RunCard
                    key={run.id}
                    run={run}
                    onSelect={(r) => setSelectedRun(r)}
                    onToggleRSVP={(r) => handleToggleRSVP(r)}
                    isRSVPing={rsvpPendingId === run.id}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentTab === 'routes' && (
          <RouteLibraryView
            routes={routes}
            onSelectRouteToSchedule={handleScheduleFromRoute}
            onOpenSaveModal={() => setIsSaveRouteModalOpen(true)}
          />
        )}

        {currentTab === 'calculator' && (
          <PaceCalculator
            onFindRunsWithPace={(cat) => {
              setFilters((prev) => ({ ...prev, paceCategory: cat }));
              setCurrentTab('runs');
            }}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            allRuns={runs}
            onSelectRun={(r) => setSelectedRun(r)}
            onOpenPostModal={() => {
              setRouteToSchedule(null);
              setIsPostModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">
            STRIDECLUB — Community Running Club
          </p>
          <p>
            Connected to real-time database. All members are welcome to propose routes, save favorite loops, and join group runs.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <RunDetailModal
        run={selectedRun}
        onClose={() => setSelectedRun(null)}
        onToggleRSVP={(r) => handleToggleRSVP(r)}
        onRunDeleted={(deletedId) => {
          setRuns((prev) => prev.filter((r) => r.id !== deletedId));
          setSelectedRun(null);
          showToast('Run was canceled and removed.');
        }}
        isRSVPing={selectedRun ? rsvpPendingId === selectedRun.id : false}
      />

      <PostRunModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setRouteToSchedule(null);
        }}
        routes={routes}
        initialRoute={routeToSchedule}
        onRunCreated={(newRunId) => {
          showToast('Your group run was published successfully! 🚀');
        }}
      />

      <SaveRouteModal
        isOpen={isSaveRouteModalOpen}
        onClose={() => setIsSaveRouteModalOpen(false)}
        onRouteSaved={(newRouteId) => {
          showToast('Route saved to library! 🗺️');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
