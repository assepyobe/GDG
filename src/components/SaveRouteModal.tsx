import React, { useState } from 'react';
import { X, MapPin, Mountain, Plus, Check, AlertCircle, Bookmark, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { createRoute } from '../services/routesService.ts';
import { RouteDifficulty, TerrainType } from '../types.ts';

interface SaveRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteSaved: (routeId: string) => void;
}

export const SaveRouteModal: React.FC<SaveRouteModalProps> = ({
  isOpen,
  onClose,
  onRouteSaved,
}) => {
  const { user, userProfile, signInWithGoogle } = useAuth();

  const [title, setTitle] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | string>(8.0);
  const [difficulty, setDifficulty] = useState<RouteDifficulty>('moderate');
  const [startLocation, setStartLocation] = useState('');
  const [address, setAddress] = useState('');
  const [terrain, setTerrain] = useState<TerrainType>('road');
  const [elevationGainM, setElevationGainM] = useState<number | string>(45);
  const [description, setDescription] = useState('');
  const [landmarkInput, setLandmarkInput] = useState('');
  const [landmarks, setLandmarks] = useState<string[]>([
    'Start at main plaza',
    'Water fountain at halfway',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const addLandmark = () => {
    if (landmarkInput.trim() && landmarks.length < 6) {
      setLandmarks([...landmarks, landmarkInput.trim()]);
      setLandmarkInput('');
    }
  };

  const removeLandmark = (idx: number) => {
    setLandmarks(landmarks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      await signInWithGoogle();
      return;
    }

    if (!title.trim() || title.length < 3) {
      setErrorMsg('Please enter a route title (at least 3 characters).');
      return;
    }

    if (!startLocation.trim()) {
      setErrorMsg('Please specify the starting location / landmark.');
      return;
    }

    const dist = Number(distanceKm);
    if (isNaN(dist) || dist <= 0 || dist > 200) {
      setErrorMsg('Distance must be a valid number of km.');
      return;
    }

    setIsSubmitting(true);
    try {
      const routeId = await createRoute({
        title: title.trim(),
        distanceKm: dist,
        difficulty,
        startLocation: startLocation.trim(),
        address: address.trim() || startLocation.trim(),
        terrain,
        elevationGainM: Number(elevationGainM) || 0,
        description: description.trim(),
        landmarks,
        creatorId: user.uid,
        creatorName: userProfile?.displayName || user.displayName || 'Club Runner',
      });

      onRouteSaved(routeId);
      onClose();
    } catch (err) {
      console.error('Failed to save route:', err);
      setErrorMsg('Could not save route. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const milesDisplay = ((Number(distanceKm) || 0) * 0.621371).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-white">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Save Route to Library</h2>
              <p className="text-xs text-teal-100">Add a favorite club route for members to explore &amp; run</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Route Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Waterfront Marina to Lighthouse Loop"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Distance and Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Distance ({milesDisplay} mi) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="160"
                  required
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  km
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Difficulty Level *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as RouteDifficulty)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 capitalize"
              >
                <option value="easy">Easy (Flat &amp; Gentle)</option>
                <option value="moderate">Moderate (Rolling hills / 10k)</option>
                <option value="challenging">Challenging (Climbs / High distance)</option>
                <option value="elite">Elite (Half / Full Marathon distance)</option>
              </select>
            </div>
          </div>

          {/* Start Location & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                Start Location / Landmark *
              </label>
              <input
                type="text"
                required
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="e.g. North Harbor Boardwalk Gate"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
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
                placeholder="e.g. 100 Marina Boulevard"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Terrain & Elevation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Terrain Surface
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['road', 'trail', 'track', 'mixed'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTerrain(t)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      terrain === t
                        ? 'bg-teal-500 text-slate-950 border-teal-400 font-extrabold'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-sky-400" />
                Elevation Gain (meters)
              </label>
              <input
                type="number"
                min="0"
                value={elevationGainM}
                onChange={(e) => setElevationGainM(e.target.value)}
                placeholder="30"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Key Landmarks / Highlights */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Waypoints &amp; Key Landmarks
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={landmarkInput}
                onChange={(e) => setLandmarkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLandmark();
                  }
                }}
                placeholder="e.g. Scenic lookout at 3k, Bridge climb, Restrooms"
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <button
                type="button"
                onClick={addLandmark}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {landmarks.map((lm, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5"
                >
                  <span>{lm}</span>
                  <button
                    type="button"
                    onClick={() => removeLandmark(idx)}
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
              Route Description &amp; Tips
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe surface conditions, scenery, best time of day..."
              className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 shadow-lg shadow-teal-500/20 disabled:opacity-50 transition-all font-black"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Saving Route...' : 'Save Route to Library'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
