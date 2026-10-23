import React, { useEffect, useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Mountain, 
  Users, 
  Check, 
  Coffee, 
  Trash2, 
  MessageSquare, 
  Send,
  CloudSun,
  Navigation,
  ExternalLink,
  Link2,
  UserCheck
} from 'lucide-react';
import { RunItem, RunComment, Attendee } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { subscribeToComments, addComment, deleteRun } from '../services/runsService.ts';

interface RunDetailModalProps {
  run: RunItem | null;
  onClose: () => void;
  onToggleRSVP: (run: RunItem) => void;
  onRunDeleted?: (runId: string) => void;
  isRSVPing?: boolean;
}

export const RunDetailModal: React.FC<RunDetailModalProps> = ({
  run,
  onClose,
  onToggleRSVP,
  onRunDeleted,
  isRSVPing = false,
}) => {
  const { user, userProfile, signInWithGoogle } = useAuth();
  const [comments, setComments] = useState<RunComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!run) return;
    const unsubscribe = subscribeToComments(run.id, (loadedComments) => {
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, [run?.id]);

  if (!run) return null;

  const isJoined = user ? run.rsvpUserIds.includes(user.uid) : false;
  const isHost = user ? run.organizerId === user.uid : false;
  const miles = (run.distanceKm * 0.621371).toFixed(1);

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/?run=${run.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isPostingComment) return;

    if (!user) {
      await signInWithGoogle();
      return;
    }

    setIsPostingComment(true);
    try {
      await addComment(run.id, {
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || 'Club Runner',
        userPhoto: userProfile?.photoURL || user.photoURL || '',
        text: newCommentText.trim(),
      });
      setNewCommentText('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to cancel and delete this group run?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteRun(run.id);
      if (onRunDeleted) onRunDeleted(run.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete run:', error);
      setIsDeleting(false);
    }
  };

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    run.address || run.meetLocation
  )}`;

  // Attendees list
  const attendees: Attendee[] = run.attendees && run.attendees.length > 0
    ? run.attendees
    : run.rsvpUserIds.map((id, index) => ({
        uid: id,
        name: id === run.organizerId ? `${run.organizerName} (Host)` : `Club Runner #${index + 1}`,
        photoURL: id === run.organizerId ? run.organizerPhoto : '',
      }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header Banner */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 sm:p-8 text-white">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleCopyInvite}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                copiedLink
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-black/30 hover:bg-black/50 text-white'
              }`}
              title="Copy shareable invite link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Invite Link Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Copy Invite Link</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/30 text-amber-200 border border-amber-300/30">
              {run.terrain} run
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/30 text-white border border-white/20">
              {run.paceGroup}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2 pr-12">
            {run.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-orange-100">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{formatDate(run.date)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>{run.time} Departure</span>
            </div>
          </div>
        </div>

        {/* Content scroll area */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Key Metrics Strip with Attendee Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Distance</p>
              <p className="text-xl font-black text-orange-400 mt-0.5">{run.distanceKm} km</p>
              <p className="text-[10px] text-slate-500 font-medium">({miles} miles)</p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Elevation Gain</p>
              <p className="text-xl font-black text-sky-400 mt-0.5">+{run.elevationGainM} m</p>
              <p className="text-[10px] text-slate-500 font-medium">({Math.round(run.elevationGainM * 3.28084)} ft)</p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Attendee Counter</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{run.rsvpCount} Going</p>
              <p className="text-[10px] text-slate-500 font-medium">
                {run.maxRunners ? `${run.maxRunners - run.rsvpCount} spots left` : 'Open capacity'}
              </p>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Forecast</p>
              <div className="flex items-center justify-center gap-1 text-xl font-black text-amber-400 mt-0.5">
                <CloudSun className="w-5 h-5 text-amber-400" />
                <span>61°F</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Crisp &amp; Clear</p>
            </div>
          </div>

          {/* Description & Route Notes */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Run Overview</h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
              {run.description}
            </p>
          </div>

          {/* Location details & Map Link */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 text-orange-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Meeting Point</p>
                <p className="text-base font-bold text-white">{run.meetLocation}</p>
                {run.address && <p className="text-xs text-slate-400 mt-0.5">{run.address}</p>}
              </div>
            </div>

            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-orange-400" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
            </a>
          </div>

          {/* Attending Runners List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span>Attending Runners ({attendees.length})</span>
              </h4>
              <button
                onClick={handleCopyInvite}
                className="text-xs text-orange-400 hover:underline flex items-center gap-1"
              >
                <Link2 className="w-3 h-3" />
                <span>{copiedLink ? 'Copied!' : 'Copy Invite Link'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {attendees.map((att) => (
                <div
                  key={att.uid}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800"
                >
                  {att.photoURL ? (
                    <img
                      src={att.photoURL}
                      alt={att.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-orange-400 ring-1 ring-slate-700 flex-shrink-0">
                      {att.name ? att.name[0].toUpperCase() : 'R'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{att.name}</p>
                    <div className="flex items-center gap-1">
                      {att.uid === run.organizerId ? (
                        <span className="text-[10px] font-semibold text-orange-400">Host</span>
                      ) : user && att.uid === user.uid ? (
                        <span className="text-[10px] font-semibold text-emerald-400">You</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Runner</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Post run social */}
          {run.postRunSocial && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Post-Run Social</p>
                <p className="text-sm text-slate-200 font-medium">{run.postRunSocial}</p>
              </div>
            </div>
          )}

          {/* Route Highlights */}
          {run.routeHighlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Route Highlights &amp; Amenities
              </h4>
              <div className="flex flex-wrap gap-2">
                {run.routeHighlights.map((hl, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    {hl}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Host info and Join Run Button */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {run.organizerPhoto ? (
                <img
                  src={run.organizerPhoto}
                  alt={run.organizerName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/40"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-orange-400">
                  {run.organizerName[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400">Run Leader / Host</p>
                <p className="text-sm font-bold text-white">{run.organizerName}</p>
                <p className="text-[11px] text-orange-400">Verified Club Host</p>
              </div>
            </div>

            {/* RSVP / Join Run Button */}
            <div className="flex items-center gap-2">
              {isHost && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                  title="Cancel & Delete Run"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Cancel Run</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (!user) {
                    signInWithGoogle();
                  } else {
                    onToggleRSVP(run);
                  }
                }}
                disabled={isRSVPing}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isJoined
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20'
                }`}
              >
                {isJoined ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Joined (Click to Leave)</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Join Run (RSVP)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Community Q&A / Run Discussion */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-400" />
                <span>Run Discussion ({comments.length})</span>
              </h4>
              <span className="text-xs text-slate-500">Ask the host about paces, gear, parking</span>
            </div>

            {/* Comment list */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-500">
                  No questions yet. Be the first to say hi to the crew!
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-2 font-semibold text-slate-300">
                        {comment.userPhoto ? (
                          <img
                            src={comment.userPhoto}
                            alt={comment.userName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-orange-400">
                            {comment.userName[0].toUpperCase()}
                          </div>
                        )}
                        <span>{comment.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-200 pl-7">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add comment input */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={user ? "Ask a question or leave a message..." : "Sign in to post a question..."}
                disabled={isPostingComment}
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim() || isPostingComment}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
