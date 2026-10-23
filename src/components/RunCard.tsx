import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Mountain, 
  Users, 
  Check, 
  Coffee, 
  TrendingUp,
  Link2,
  Copy,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { RunItem } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface RunCardProps {
  run: RunItem;
  onSelect: (run: RunItem) => void;
  onToggleRSVP: (run: RunItem) => void;
  isRSVPing?: boolean;
}

export const RunCard: React.FC<RunCardProps> = ({
  run,
  onSelect,
  onToggleRSVP,
  isRSVPing = false,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAllAttendees, setShowAllAttendees] = useState(false);

  const isJoined = user ? run.rsvpUserIds.includes(user.uid) : false;
  const isHost = user ? run.organizerId === user.uid : false;

  // Format date nicely
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const miles = (run.distanceKm * 0.621371).toFixed(1);

  // Terrain color badge
  const terrainConfig = {
    road: { label: 'Road', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    trail: { label: 'Trail', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    track: { label: 'Track', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    mixed: { label: 'Mixed Terrain', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
  }[run.terrain] || { label: 'Road', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };

  // Handle RSVP
  const handleRSVPClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      signInWithGoogle();
      return;
    }
    onToggleRSVP(run);
  };

  // Copyable Invite Link
  const handleCopyInviteLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const inviteUrl = `${window.location.origin}/?run=${run.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Extract attendee list
  const attendees = run.attendees && run.attendees.length > 0
    ? run.attendees
    : run.rsvpUserIds.map((id, index) => ({
        uid: id,
        name: id === run.organizerId ? `${run.organizerName} (Host)` : `Club Runner #${index + 1}`,
        photoURL: id === run.organizerId ? run.organizerPhoto : '',
      }));

  const visibleAttendees = attendees.slice(0, 5);
  const remainingCount = attendees.length - visibleAttendees.length;

  return (
    <div
      onClick={() => onSelect(run)}
      className="group relative bg-slate-900/95 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Header: Date, Time & Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${terrainConfig.color}`}>
              {terrainConfig.label}
            </span>
            {isHost && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                You're Hosting
              </span>
            )}
            {isJoined && !isHost && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                You're In
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-orange-400" />
            <span>{formatDate(run.date)}</span>
            <span className="text-slate-600">•</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{run.time}</span>
          </div>
        </div>

        {/* Title and Distance */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
            {run.title}
          </h3>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-black tracking-tight text-orange-400">
              {run.distanceKm} <span className="text-xs font-bold text-slate-400">km</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">({miles} mi)</div>
          </div>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-3.5 leading-relaxed">
          {run.description}
        </p>

        {/* Route Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3.5 text-xs">
          {/* Meeting Point */}
          <div className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Meet Up</p>
              <p className="font-semibold text-slate-200 truncate">{run.meetLocation}</p>
            </div>
          </div>

          {/* Pace Group */}
          <div className="flex items-center gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
            <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Pace Group</p>
              <p className="font-semibold text-slate-200 truncate">{run.paceGroup}</p>
            </div>
          </div>
        </div>

        {/* Attending Runners List & Attendee Counter */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 mb-3.5 space-y-2">
          <div className="flex items-center justify-between">
            {/* Attendee Counter */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Users className="w-4 h-4 text-orange-400" />
              <span>{run.rsvpCount} Attending</span>
              {run.maxRunners && (
                <span className="text-[11px] font-normal text-slate-400">
                  / {run.maxRunners} spots
                </span>
              )}
            </div>

            {/* View/toggle names */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAllAttendees(!showAllAttendees);
              }}
              className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              <span>{showAllAttendees ? 'Hide roster' : 'View runners'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAllAttendees ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Attending runners avatar row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
              {visibleAttendees.map((att, idx) => (
                <div
                  key={att.uid || idx}
                  title={att.name}
                  className="relative group/att"
                >
                  {att.photoURL ? (
                    <img
                      src={att.photoURL}
                      alt={att.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-900 shadow"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-orange-400 shadow">
                      {att.name ? att.name[0].toUpperCase() : 'R'}
                    </div>
                  )}
                </div>
              ))}
              {remainingCount > 0 && (
                <div
                  className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-300 shadow"
                  title={`${remainingCount} more runners attending`}
                >
                  +{remainingCount}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 truncate max-w-[170px] text-right font-medium">
              {visibleAttendees.length > 0 ? (
                <span>
                  {visibleAttendees.map((a) => a.name.split(' ')[0]).join(', ')}
                  {remainingCount > 0 ? ` +${remainingCount}` : ''}
                </span>
              ) : (
                <span className="text-slate-500">Be the first to join!</span>
              )}
            </div>
          </div>

          {/* Expanded Attendee List */}
          {showAllAttendees && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="pt-2 border-t border-slate-800/80 space-y-1.5 max-h-36 overflow-y-auto pr-1"
            >
              {attendees.map((att) => (
                <div
                  key={att.uid}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {att.photoURL ? (
                      <img src={att.photoURL} alt={att.name} className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-800 text-[9px] font-bold text-orange-400 flex items-center justify-center">
                        {att.name[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-semibold text-slate-200 truncate">{att.name}</span>
                  </div>
                  {att.uid === run.organizerId && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400">
                      Host
                    </span>
                  )}
                  {user && att.uid === user.uid && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Route tags / elevation */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {run.elevationGainM > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800/70 text-slate-300 border border-slate-700/60">
              <Mountain className="w-3 h-3 text-sky-400" />
              +{run.elevationGainM}m elevation
            </span>
          )}
          {run.routeHighlights.slice(0, 2).map((highlight, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800/70 text-slate-300 border border-slate-700/60 truncate max-w-[130px]"
            >
              {highlight}
            </span>
          ))}
          {run.postRunSocial && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 truncate max-w-[160px]">
              <Coffee className="w-3 h-3 text-amber-400 flex-shrink-0" />
              {run.postRunSocial}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Copy Invite Link & Join Run RSVP action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Copy Invite Link Button */}
        <button
          onClick={handleCopyInviteLink}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            copiedLink
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
          }`}
          title="Copy direct invite link to share with friends"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
              <span className="font-bold">Link Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Copy Invite</span>
            </>
          )}
        </button>

        {/* Join Run / RSVP Button */}
        <button
          onClick={handleRSVPClick}
          disabled={isRSVPing}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isJoined
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20'
          }`}
        >
          {isJoined ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span className="group-hover:hidden">Joined</span>
              <span className="hidden group-hover:inline">Leave Run</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Join Run</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
