import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Award, 
  Calendar, 
  Clock, 
  Flame, 
  Edit3, 
  Check, 
  ChevronRight,
  TrendingUp,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { RunItem } from '../types.ts';

interface ProfileViewProps {
  allRuns: RunItem[];
  onSelectRun: (run: RunItem) => void;
  onOpenPostModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  allRuns,
  onSelectRun,
  onOpenPostModal,
}) => {
  const { user, userProfile, updateUserProfile, signInWithGoogle } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [preferredPace, setPreferredPace] = useState(userProfile?.preferredPace || '5:30 min/km');
  const [favoriteDistance, setFavoriteDistance] = useState(userProfile?.favoriteDistance || '10K');
  const [shoes, setShoes] = useState(userProfile?.shoes || 'Daily Trainers');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Join the Running Club</h2>
        <p className="text-xs text-slate-400">
          Sign in to manage your upcoming runs, track RSVPs, post community runs, and customize your runner profile.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In with Google</span>
        </button>
      </div>
    );
  }

  const myRsvpdRuns = allRuns.filter((r) => r.rsvpUserIds.includes(user.uid));
  const myHostedRuns = allRuns.filter((r) => r.organizerId === user.uid);
  const totalUpcomingKm = myRsvpdRuns.reduce((acc, r) => acc + r.distanceKm, 0);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        preferredPace,
        favoriteDistance,
        shoes: shoes.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            {userProfile?.photoURL || user.photoURL ? (
              <img
                src={userProfile?.photoURL || user.photoURL || ''}
                alt={userProfile?.displayName || user.displayName || 'Runner'}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-orange-500/50 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-2xl font-black text-slate-950 shadow-lg">
                {(userProfile?.displayName || user.displayName || 'R')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  {userProfile?.displayName || user.displayName || 'Club Runner'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Active Member
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              <p className="text-xs text-slate-300 mt-2 max-w-lg leading-relaxed">
                {userProfile?.bio || 'Passionate runner enjoying the club community and weekend miles.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setDisplayName(userProfile?.displayName || user.displayName || '');
              setBio(userProfile?.bio || '');
              setPreferredPace(userProfile?.preferredPace || '5:30 min/km');
              setFavoriteDistance(userProfile?.favoriteDistance || '10K');
              setShoes(userProfile?.shoes || 'Daily Trainers');
              setIsEditing(!isEditing);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5 text-orange-400" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-2 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Update Runner Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Preferred Pace Target</label>
                <input
                  type="text"
                  value={preferredPace}
                  onChange={(e) => setPreferredPace(e.target.value)}
                  placeholder="e.g. 5:15 min/km"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Favorite Race Distance</label>
                <select
                  value={favoriteDistance}
                  onChange={(e) => setFavoriteDistance(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="5K">5K</option>
                  <option value="10K">10K</option>
                  <option value="Half Marathon">Half Marathon (21.1K)</option>
                  <option value="Marathon">Marathon (42.2K)</option>
                  <option value="Trail / Ultra">Trail / Ultra</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Current Shoe Rotation</label>
                <input
                  type="text"
                  value={shoes}
                  onChange={(e) => setShoes(e.target.value)}
                  placeholder="e.g. Saucony Endorphin Speed 4, Nike Pegasus"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1">Bio / Goals</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell club members about your goals, favorite routes..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Runs Attending</p>
            <p className="text-2xl font-black text-orange-400 mt-1">{myRsvpdRuns.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Runs Hosted</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{myHostedRuns.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Scheduled KM</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{totalUpcomingKm.toFixed(1)} km</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 uppercase font-semibold">Preferred Pace</p>
            <p className="text-base font-bold text-sky-400 mt-1.5 truncate">
              {userProfile?.preferredPace || '5:30 min/km'}
            </p>
          </div>
        </div>
      </div>

      {/* Runs I am hosting */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">Runs You're Hosting ({myHostedRuns.length})</h2>
          </div>
          <button
            onClick={onOpenPostModal}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
          >
            + Host Another Run
          </button>
        </div>

        {myHostedRuns.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">You haven't hosted any upcoming runs yet.</p>
            <button
              onClick={onOpenPostModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all"
            >
              Post a Community Run
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myHostedRuns.map((run) => (
              <div
                key={run.id}
                onClick={() => onSelectRun(run)}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between gap-3 group transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                    {run.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{run.date}</span>
                    <span>•</span>
                    <span>{run.distanceKm} km</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{run.rsvpCount} Going</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Runs I am attending */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Your Upcoming RSVP Schedule ({myRsvpdRuns.length})</h2>
        </div>

        {myRsvpdRuns.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">You haven't RSVP'd to any upcoming runs yet.</p>
            <p className="text-xs text-slate-500">Explore the runs feed and join your first group run!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myRsvpdRuns.map((run) => (
              <div
                key={run.id}
                onClick={() => onSelectRun(run)}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between gap-3 group transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                    {run.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{run.date} at {run.time}</span>
                    <span>•</span>
                    <span>{run.distanceKm} km</span>
                    <span>•</span>
                    <span className="text-slate-400">Meet: {run.meetLocation}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
