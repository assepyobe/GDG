import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Mountain, 
  Plus, 
  Sparkles, 
  Coffee, 
  Check, 
  AlertCircle,
  LogIn,
  Bookmark,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { createRun } from '../services/runsService.ts';
import { TerrainType, SavedRoute } from '../types.ts';

interface PostRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCreated: (runId: string) => void;
  routes: SavedRoute[];
  initialRoute?: SavedRoute | null;
}

export const PostRunModal: React.FC<PostRunModalProps> = ({
  isOpen,
  onClose,
  onRunCreated,
  routes = [],
  initialRoute = null,
}) => {
  const { user, userProfile, signInWithGoogle } = useAuth();

  // Tomorrow as default date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('07:30');
  const [meetLocation, setMeetLocation] = useState('');
  const [address, setAddress] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | string>(8.0);
  const [paceGroup, setPaceGroup] = useState('5:30 - 6:00 min/km (Steady)');
  const [paceCategory, setPaceCategory] = useState<'chill' | 'steady' | 'tempo' | 'fast'>('steady');
  const [terrain, setTerrain] = useState<TerrainType>('road');
  const [elevationGainM, setElevationGainM] = useState<number | string>(40);
  const [maxRunners, setMaxRunners] = useState<number | string>(30);
  const [postRunSocial, setPostRunSocial] = useState('Post-run coffee & pastries nearby ☕🥐');
  const [highlightInput, setHighlightInput] = useState('');
  const [highlights, setHighlights] = useState<string[]>([
    'Bag drop available',
    'Water station on route',
    'Beginner friendly',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Apply route helper
  const applyRoute = (route: SavedRoute) => {
    setSelectedRouteId(route.id);
    setTitle(`${route.title} Run`);
    setDistanceKm(route.distanceKm);
    setMeetLocation(route.startLocation);
    setAddress(route.address || route.startLocation);
    setTerrain(route.terrain);
    setElevationGainM(route.elevationGainM || 0);
    setDescription(
      route.description ||
        `Join us for a ${route.distanceKm}km group run on the ${route.title} route! Meeting at ${route.startLocation}.`
    );
    if (route.landmarks && route.landmarks.length > 0) {
      setHighlights(route.landmarks);
    }
    // Match pace to difficulty
    if (route.difficulty === 'easy') {
      setPaceCategory('chill');
      setPaceGroup('6:15+ min/km (Chill & Chat)');
    } else if (route.difficulty === 'challenging' || route.difficulty === 'elite') {
      setPaceCategory('tempo');
      setPaceGroup('4:45 - 5:30 min/km (Tempo)');
    } else {
      setPaceCategory('steady');
      setPaceGroup('5:30 - 6:15 min/km (Steady)');
    }
  };

  // Watch for initialRoute changes when modal opens
  useEffect(() => {
    if (isOpen && initialRoute) {
      applyRoute(initialRoute);
    } else if (isOpen && !initialRoute && !selectedRouteId) {
      // Keep or reset
    }
  }, [isOpen, initialRoute]);

  if (!isOpen) return null;

  // Presets
  const applyPreset = (preset: {
    title: string;
    distance: number;
    pace: string;
    category: 'chill' | 'steady' | 'tempo' | 'fast';
    terrain: TerrainType;
    elevation: number;
    desc: string;
    social: string;
    tags: string[];
  }) => {
    setSelectedRouteId('');
    setTitle(preset.title);
    setDistanceKm(preset.distance);
    setPaceGroup(preset.pace);
    setPaceCategory(preset.category);
    setTerrain(preset.terrain);
    setElevationGainM(preset.elevation);
    setDescription(preset.desc);
    setPostRunSocial(preset.social);
    setHighlights(preset.tags);
  };

  const addHighlight = () => {
    if (highlightInput.trim() && highlights.length < 8) {
      setHighlights([...highlights, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (!title.trim() || title.length < 3) {
      setErrorMsg('Please enter a descriptive run title (at least 3 characters).');
      return;
    }

    if (!meetLocation.trim()) {
      setErrorMsg('Please provide a specific meeting location.');
      return;
    }

    const dist = Number(distanceKm);
    if (isNaN(dist) || dist <= 0 || dist > 200) {
      setErrorMsg('Distance must be a positive number up to 200 km.');
      return;
    }

    setIsSubmitting(true);
    try {
      const runId = await createRun({
        title: title.trim(),
        description: description.trim() || `Join us for a ${dist}km group run! All members welcome.`,
        date,
        time,
        meetLocation: meetLocation.trim(),
        address: address.trim() || meetLocation.trim(),
        distanceKm: dist,
        paceGroup,
        paceCategory,
        terrain,
        elevationGainM: Number(elevationGainM) || 0,
        maxRunners: maxRunners ? Number(maxRunners) : undefined,
        organizerId: user.uid,
        organizerName: userProfile?.displayName || user.displayName || 'Club Host',
        organizerPhoto: userProfile?.photoURL || user.photoURL || '',
        postRunSocial: postRunSocial.trim(),
        routeHighlights: highlights,
      });

      onRunCreated(runId);
      onClose();
    } catch (err) {
      console.error('Failed to create run:', err);
      setErrorMsg('Could not save your run. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const milesDisplay = ((Number(distanceKm) || 0) * 0.621371).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Host an Upcoming Run</h2>
              <p className="text-xs text-orange-100">Schedule a group run or select from the route library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Route Library Selector */}
          {routes.length > 0 && (
            <div className="bg-gradient-to-r from-teal-950/40 via-slate-950 to-slate-950 p-4 rounded-2xl border border-teal-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-teal-400" />
                  <span>Select from Saved Route Library</span>
                </label>
                <span className="text-[11px] text-teal-400/80 font-medium">
                  {routes.length} routes available
                </span>
              </div>

              <div className="relative">
                <select
                  value={selectedRouteId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedRouteId(id);
                    const found = routes.find((r) => r.id === id);
                    if (found) {
                      applyRoute(found);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-teal-500/40 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 appearance-none pr-8 cursor-pointer font-medium"
                >
                  <option value="">-- Choose a Route to Autofill (or custom) --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} — {r.distanceKm}km ({r.difficulty.toUpperCase()} • {r.startLocation})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">
                Selecting a route automatically fills the title, distance, start location, terrain, and waypoints!
              </p>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Or Choose a Fast Workout Preset</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    title: 'Morning Coffee Shakeout',
                    distance: 6.0,
                    pace: '6:00 - 6:30 min/km (Chill)',
                    category: 'chill',
                    terrain: 'road',
                    elevation: 20,
                    desc: 'Easy conversational recovery shakeout followed by bakery coffee. Perfect way to start the morning with friends.',
                    social: 'Artisan drip coffee & cinnamon buns ☕',
                    tags: ['Conversational pace', 'Paved path', 'Beginner friendly'],
                  })
                }
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all text-xs"
              >
                <p className="font-bold text-amber-400">☕ 6k Shakeout</p>
                <p className="text-[11px] text-slate-400">Easy recovery</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    title: 'Midweek Speed Intervals',
                    distance: 8.5,
                    pace: '4:45 - 5:15 min/km (Tempo)',
                    category: 'tempo',
                    terrain: 'track',
                    elevation: 10,
                    desc: 'Warm up 2km, 6x800m track repeats with 90s jog recovery, cool down 1.5km. Push your VO2 max!',
                    social: 'Electrolyte hydration & foam rolling at track ⚡',
                    tags: ['Track repeats', 'Structured workout', 'Paced by coach'],
                  })
                }
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all text-xs"
              >
                <p className="font-bold text-orange-400">⚡ 8.5k Track</p>
                <p className="text-[11px] text-slate-400">Tempo intervals</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    title: 'Saturday Classic 10K Loop',
                    distance: 10.0,
                    pace: '5:15 - 5:45 min/km (Steady)',
                    category: 'steady',
                    terrain: 'road',
                    elevation: 65,
                    desc: 'Scenic 10 kilometer perimeter loop taking in bridges and park vistas. Consistent aerobic rhythm.',
                    social: 'Post-run acai bowls & smoothies 🍓',
                    tags: ['Scenic views', 'Consistent pace', 'Water fountain at 5k'],
                  })
                }
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all text-xs"
              >
                <p className="font-bold text-emerald-400">🏃 10k Classic</p>
                <p className="text-[11px] text-slate-400">Steady weekend run</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  applyPreset({
                    title: 'Sunday Endurance Long Run',
                    distance: 21.1,
                    pace: '5:30 - 6:00 min/km (Steady)',
                    category: 'steady',
                    terrain: 'road',
                    elevation: 120,
                    desc: 'Half marathon distance endurance builder. Pacers on hand for multiple groups. Water drops placed along the way.',
                    social: 'Full recovery brunch & pancakes 🥞🍳',
                    tags: ['Half marathon distance', 'Water stations', 'Multi-pace groups'],
                  })
                }
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all text-xs"
              >
                <p className="font-bold text-sky-400">⛰️ 21.1k Long</p>
                <p className="text-[11px] text-slate-400">Half marathon prep</p>
              </button>
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Run Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Saturday Morning Golden Hour Shakeout"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>

          {/* Date, Time, Distance Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Departure Time *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Distance ({milesDisplay} mi) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="160"
                  required
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  km
                </span>
              </div>
            </div>
          </div>

          {/* Meeting Spot & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                Meeting Spot Landmark *
              </label>
              <input
                type="text"
                required
                value={meetLocation}
                onChange={(e) => setMeetLocation(e.target.value)}
                placeholder="e.g. North Gate Pavilion, Central Park"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Street Address / Navigation
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 500 Central Park West"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Pace Group & Terrain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Pace Group
              </label>
              <select
                value={paceCategory}
                onChange={(e) => {
                  const cat = e.target.value as 'chill' | 'steady' | 'tempo' | 'fast';
                  setPaceCategory(cat);
                  if (cat === 'chill') setPaceGroup('6:15+ min/km (Chill & Chat)');
                  if (cat === 'steady') setPaceGroup('5:30 - 6:15 min/km (Steady)');
                  if (cat === 'tempo') setPaceGroup('4:45 - 5:30 min/km (Tempo)');
                  if (cat === 'fast') setPaceGroup('<4:45 min/km (Fast / Sub-20 5k)');
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="chill">Chill & Chat (6:15+ min/km)</option>
                <option value="steady">Steady Rhythm (5:30 - 6:15 min/km)</option>
                <option value="tempo">Tempo Pace (4:45 - 5:30 min/km)</option>
                <option value="fast">Fast / Speedy (&lt;4:45 min/km)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Terrain Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['road', 'trail', 'track', 'mixed'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTerrain(t)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      terrain === t
                        ? 'bg-orange-500 text-white border-orange-400 font-bold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Elevation & Max Runners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-sky-400" />
                Estimated Elevation Gain (m)
              </label>
              <input
                type="number"
                min="0"
                value={elevationGainM}
                onChange={(e) => setElevationGainM(e.target.value)}
                placeholder="40"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Max Capacity (Runners)
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={maxRunners}
                onChange={(e) => setMaxRunners(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Post Run Social */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              Post-Run Coffee / Social Plan
            </label>
            <input
              type="text"
              value={postRunSocial}
              onChange={(e) => setPostRunSocial(e.target.value)}
              placeholder="e.g. Croissants & espresso at Stride Cafe"
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Route Highlights Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Route Highlights & Perks
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
                placeholder="e.g. Restrooms at 5k, Shaded park trail, Bag drop"
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-colors"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((h, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5"
                >
                  <span>{h}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell runners what to expect: terrain notes, shoe recommendation, where to park..."
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Submit button */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            {user ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isSubmitting ? 'Publishing Run...' : 'Publish Upcoming Run'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google to Post</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
