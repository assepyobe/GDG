import React, { useState, useMemo } from 'react';
import { 
  Bookmark, 
  MapPin, 
  Mountain, 
  Search, 
  Plus, 
  ArrowRight, 
  Navigation, 
  ExternalLink,
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { SavedRoute, RouteDifficulty } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { deleteRoute } from '../services/routesService.ts';

interface RouteLibraryViewProps {
  routes: SavedRoute[];
  onSelectRouteToSchedule: (route: SavedRoute) => void;
  onOpenSaveModal: () => void;
}

export const RouteLibraryView: React.FC<RouteLibraryViewProps> = ({
  routes,
  onSelectRouteToSchedule,
  onOpenSaveModal,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | RouteDifficulty>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      if (difficultyFilter !== 'all' && route.difficulty !== difficultyFilter) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = route.title.toLowerCase().includes(q);
        const matchLoc = route.startLocation.toLowerCase().includes(q);
        const matchDesc = route.description?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchLoc && !matchDesc) return false;
      }
      return true;
    });
  }, [routes, difficultyFilter, search]);

  const handleDelete = async (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this route from the library?')) return;
    setDeletingId(routeId);
    try {
      await deleteRoute(routeId);
    } catch (err) {
      console.error('Failed to delete route:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const difficultyBadges = {
    easy: { label: 'Easy', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    moderate: { label: 'Moderate', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    challenging: { label: 'Challenging', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    elite: { label: 'Elite', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Route Library Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/30 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Community Route Catalog</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Curated Running Routes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore member-tested running loops with verified distances, difficulty grades, and start locations. Select any route to schedule an upcoming club run!
            </p>
          </div>

          <button
            onClick={onOpenSaveModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 shadow-lg shadow-teal-500/20 transition-all font-black self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Save a New Route</span>
          </button>
        </div>

        {/* Route Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
            <p className="text-slate-400 font-medium">Saved Routes</p>
            <p className="text-lg font-black text-white mt-0.5">{routes.length} Tracks</p>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
            <p className="text-slate-400 font-medium">Distances Available</p>
            <p className="text-lg font-black text-teal-400 mt-0.5">5k — 21.1k+</p>
          </div>
          <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60 col-span-2 sm:col-span-1">
            <p className="text-slate-400 font-medium">Terrain Types</p>
            <p className="text-lg font-black text-amber-400 mt-0.5">Road, Trail, Track</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search routes by title, starting spot, or terrain..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Difficulty Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            Difficulty:
          </span>
          {(['all', 'easy', 'moderate', 'challenging', 'elite'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                difficultyFilter === d
                  ? 'bg-teal-500 text-slate-950 font-black'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {d === 'all' ? 'All Difficulties' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Routes Grid */}
      {filteredRoutes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">No routes match your search</h3>
          <p className="text-xs text-slate-400">
            Try clearing filters or save your own favorite loop to the club library!
          </p>
          <button
            onClick={onOpenSaveModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 font-black transition-all"
          >
            Save Route
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((route) => {
            const miles = (route.distanceKm * 0.621371).toFixed(1);
            const badge = difficultyBadges[route.difficulty] || difficultyBadges.moderate;
            const isCreator = user && route.creatorId === user.uid;

            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              route.address || route.startLocation
            )}`;

            return (
              <div
                key={route.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-950 text-slate-400 border border-slate-800 capitalize">
                        {route.terrain}
                      </span>
                    </div>

                    {isCreator && (
                      <button
                        onClick={(e) => handleDelete(e, route.id)}
                        disabled={deletingId === route.id}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete Route"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title & Distance */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1">
                      {route.title}
                    </h3>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-black text-teal-400">
                        {route.distanceKm} <span className="text-xs font-bold text-slate-400">km</span>
                      </div>
                      <div className="text-[10px] text-slate-500">({miles} mi)</div>
                    </div>
                  </div>

                  {/* Description */}
                  {route.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3.5 leading-relaxed">
                      {route.description}
                    </p>
                  )}

                  {/* Start Location Card */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span>Start Location</span>
                      </div>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-teal-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Map</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate">{route.startLocation}</p>
                    {route.address && (
                      <p className="text-[11px] text-slate-400 truncate">{route.address}</p>
                    )}
                  </div>

                  {/* Elevation & Landmarks */}
                  <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                    {route.elevationGainM !== undefined && route.elevationGainM > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                        <Mountain className="w-3 h-3 text-sky-400" />
                        +{route.elevationGainM}m elevation
                      </span>
                    )}
                    {route.landmarks &&
                      route.landmarks.slice(0, 2).map((lm, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 truncate max-w-[150px]"
                        >
                          {lm}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Footer action: Schedule run with this route */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-[10px] text-slate-500 truncate">
                    Saved by <span className="font-semibold text-slate-300">{route.creatorName}</span>
                  </div>

                  <button
                    onClick={() => onSelectRouteToSchedule(route)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    title="Schedule a group run using this saved route"
                  >
                    <span>Schedule Run</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
