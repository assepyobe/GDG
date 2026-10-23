import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { RunItem, RunComment, TerrainType, Attendee } from '../types.ts';

const RUNS_COLLECTION = 'runs';

export const getStarterRuns = (): RunItem[] => {
  const today = new Date();
  const formatDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const storedRSVPs: Record<string, string[]> = JSON.parse(
    localStorage.getItem('stride_starter_rsvps') || '{}'
  );
  const storedAttendees: Record<string, Attendee[]> = JSON.parse(
    localStorage.getItem('stride_starter_attendees') || '{}'
  );

  const baseRuns: Omit<RunItem, 'rsvpUserIds' | 'rsvpCount' | 'attendees'>[] = [
    {
      id: 'starter-1',
      title: 'Sunrise Riverfront Shakeout',
      description:
        'Wake up with a breezy morning aerobic run along the river pathway. All paces welcome! We loop under the south bridge and finish at the bakery for filter coffee.',
      date: formatDate(1),
      time: '06:45',
      meetLocation: 'East Pier Boardwalk Entrance',
      address: '100 Harbor Way, Waterfront Plaza',
      distanceKm: 7.5,
      paceGroup: '5:30 - 6:15 min/km (Conversational)',
      paceCategory: 'steady',
      terrain: 'road',
      elevationGainM: 35,
      maxRunners: 30,
      organizerId: 'host_maya',
      organizerName: 'Maya Thorne (Coach)',
      organizerPhoto:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      postRunSocial: 'Fresh sourdough croissants & espresso at River Cafe 🥐☕',
      routeHighlights: [
        'Waterfront boardwalk',
        'Bridge sunrise viewpoint',
        'Flat paved path',
        'Water fountain at 4km',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'starter-2',
      title: 'Wednesday Night City Lights 10K',
      description:
        'A classic evening city loop passing historic architecture and neon-lit boulevards. Great mid-week mileage booster with steady pacing groups.',
      date: formatDate(3),
      time: '18:30',
      meetLocation: 'Civic Center Monument Steps',
      address: '450 Grand Avenue, Downtown',
      distanceKm: 10.2,
      paceGroup: '5:00 - 5:20 min/km (Tempo Pace)',
      paceCategory: 'tempo',
      terrain: 'road',
      elevationGainM: 80,
      maxRunners: 40,
      organizerId: 'host_marcus',
      organizerName: 'Marcus Vance',
      organizerPhoto:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      postRunSocial: 'Post-run electrolytes and craft taco bar at El Sol 🌮',
      routeHighlights: ['Downtown neon loop', 'City Park perimeter', 'Bag drop at running store'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'starter-3',
      title: 'Saturday Pine Ridge Trail Excursion',
      description:
        'Escape the asphalt! Soft forest single-track, rolling switchbacks, and pine scent. Trail shoes or grippy road shoes recommended. We will pause at the lookout summit.',
      date: formatDate(5),
      time: '08:00',
      meetLocation: 'Pine Ridge Nature Reserve Trailhead',
      address: 'Trailhead Parking Lot B, Ridge Road',
      distanceKm: 14.0,
      paceGroup: '6:15 - 6:45 min/km (Trail Pace)',
      paceCategory: 'chill',
      terrain: 'trail',
      elevationGainM: 260,
      maxRunners: 25,
      organizerId: 'host_chloe',
      organizerName: 'Chloe Bennett',
      organizerPhoto:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      postRunSocial: 'Tailgate fruit smoothies, protein bars, and cider 🍎🥤',
      routeHighlights: [
        'Forest singletrack',
        'Summit valley view',
        '300m elevation climb',
        'Shaded canopy',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'starter-4',
      title: 'Sunday Marathon Long Run & Gel Test',
      description:
        'Building that marathon and half endurance engine. Structured water stops every 5km. Practice your race nutrition and pacing strategy with pacers for 4:45, 5:15, and 5:45 min/km.',
      date: formatDate(6),
      time: '07:15',
      meetLocation: 'Track Club Clubhouse',
      address: '12 Athletic Way, Sports District',
      distanceKm: 21.1,
      paceGroup: 'Split pacing groups (4:45 to 6:00 min/km)',
      paceCategory: 'steady',
      terrain: 'road',
      elevationGainM: 110,
      maxRunners: 50,
      organizerId: 'host_derek',
      organizerName: 'Coach Derek Hill',
      organizerPhoto:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      postRunSocial: 'Full recovery brunch at Stride House Cafe 🥞☕🍳',
      routeHighlights: [
        'Full 21.1K loop',
        'Water & Maurten gel stations at 7k and 14k',
        'Pace leaders for 3 waves',
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultStarterAttendees: Attendee[][] = [
    [
      { uid: 'host_maya', name: 'Maya Thorne', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_1', name: 'Leo Vance', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_2', name: 'Clara Santos', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_3', name: 'Sam Miller', photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_4', name: 'Elena Rostova', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_5', name: 'Kai Tanaka', photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
    ],
    [
      { uid: 'host_marcus', name: 'Marcus Vance', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_6', name: 'Zoe Kravitz', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_7', name: 'Ben Walker', photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_8', name: 'Priya Sharma', photoURL: 'https://images.unsplash.com/photo-1534751516642-a171edd25218?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_9', name: 'Dan Kelly', photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
    ],
    [
      { uid: 'host_chloe', name: 'Chloe Bennett', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_10', name: 'Leo Vance', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_11', name: 'Maya Thorne', photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_12', name: 'Alex Rivera', photoURL: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
    ],
    [
      { uid: 'host_derek', name: 'Derek Hill', photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_13', name: 'Sam Miller', photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_14', name: 'Clara Santos', photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_15', name: 'Marcus Vance', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_16', name: 'Tina Chen', photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_17', name: 'Jordan Ross', photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
      { uid: 'runner_18', name: 'Hannah Cole', photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
    ],
  ];

  return baseRuns.map((r, idx) => {
    const defaultAttendees = defaultStarterAttendees[idx] || [
      { uid: r.organizerId, name: r.organizerName, photoURL: r.organizerPhoto || '' },
    ];
    const defaultRsvps = defaultAttendees.map((a) => a.uid);

    const userRsvps = storedRSVPs[r.id] || defaultRsvps;
    const attendeesList = storedAttendees[r.id] || defaultAttendees;

    return {
      ...r,
      rsvpUserIds: userRsvps,
      rsvpCount: userRsvps.length,
      attendees: attendeesList,
    };
  });
};

export function subscribeToRuns(
  onUpdate: (runs: RunItem[]) => void,
  onError?: (error: Error) => void
) {
  const runsRef = collection(db, RUNS_COLLECTION);
  return onSnapshot(
    runsRef,
    (snapshot) => {
      const dbRuns: RunItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbRuns.push({
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '',
          meetLocation: data.meetLocation || '',
          address: data.address || '',
          distanceKm: Number(data.distanceKm) || 0,
          paceGroup: data.paceGroup || '5:30 min/km',
          paceCategory: data.paceCategory || 'steady',
          terrain: (data.terrain as TerrainType) || 'road',
          elevationGainM: Number(data.elevationGainM) || 0,
          maxRunners: data.maxRunners ? Number(data.maxRunners) : undefined,
          organizerId: data.organizerId || '',
          organizerName: data.organizerName || 'Club Member',
          organizerPhoto: data.organizerPhoto || '',
          postRunSocial: data.postRunSocial || '',
          routeHighlights: Array.isArray(data.routeHighlights) ? data.routeHighlights : [],
          rsvpCount: Number(data.rsvpCount) || 0,
          rsvpUserIds: Array.isArray(data.rsvpUserIds) ? data.rsvpUserIds : [],
          attendees: Array.isArray(data.attendees) ? data.attendees : [],
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      // If database has runs, show database runs. If empty, provide starter club runs
      const finalRuns = dbRuns.length > 0 ? dbRuns : getStarterRuns();

      finalRuns.sort((a, b) => {
        const dtA = `${a.date}T${a.time}`;
        const dtB = `${b.date}T${b.time}`;
        return dtA.localeCompare(dtB);
      });

      onUpdate(finalRuns);
    },
    (error) => {
      console.error('Error fetching runs:', error);
      if (onError) onError(error);
      onUpdate(getStarterRuns());
    }
  );
}

export async function createRun(
  run: Omit<RunItem, 'id' | 'createdAt' | 'rsvpCount' | 'rsvpUserIds' | 'attendees'>
): Promise<string> {
  const path = RUNS_COLLECTION;
  try {
    const docData = {
      title: run.title.trim(),
      description: run.description.trim(),
      date: run.date,
      time: run.time,
      meetLocation: run.meetLocation.trim(),
      address: run.address ? run.address.trim() : run.meetLocation.trim(),
      distanceKm: Number(run.distanceKm),
      paceGroup: run.paceGroup,
      paceCategory: run.paceCategory || 'steady',
      terrain: run.terrain || 'road',
      elevationGainM: Number(run.elevationGainM) || 0,
      maxRunners: run.maxRunners ? Number(run.maxRunners) : 50,
      organizerId: run.organizerId,
      organizerName: run.organizerName,
      organizerPhoto: run.organizerPhoto || '',
      postRunSocial: run.postRunSocial ? run.postRunSocial.trim() : '',
      routeHighlights: run.routeHighlights || [],
      rsvpCount: 1, // Organizer automatically RSVPs
      rsvpUserIds: [run.organizerId],
      attendees: [
        {
          uid: run.organizerId,
          name: run.organizerName,
          photoURL: run.organizerPhoto || '',
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, path), docData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleRunRSVP(
  run: RunItem,
  userId: string,
  userName?: string,
  userPhoto?: string
): Promise<boolean> {
  const isJoined = run.rsvpUserIds.includes(userId);
  const updatedUserIds = isJoined
    ? run.rsvpUserIds.filter((id) => id !== userId)
    : [...run.rsvpUserIds, userId];

  const currentAttendees = Array.isArray(run.attendees) ? [...run.attendees] : [];
  const updatedAttendees: Attendee[] = isJoined
    ? currentAttendees.filter((a) => a.uid !== userId)
    : [
        ...currentAttendees.filter((a) => a.uid !== userId),
        {
          uid: userId,
          name: userName || 'Club Runner',
          photoURL: userPhoto || '',
          joinedAt: new Date().toISOString(),
        },
      ];

  const updatedCount = updatedUserIds.length;

  // If this is a starter demo run, manage RSVP locally
  if (run.id.startsWith('starter-')) {
    const storedRSVPs = JSON.parse(localStorage.getItem('stride_starter_rsvps') || '{}');
    storedRSVPs[run.id] = updatedUserIds;
    localStorage.setItem('stride_starter_rsvps', JSON.stringify(storedRSVPs));

    const storedAttendees = JSON.parse(localStorage.getItem('stride_starter_attendees') || '{}');
    storedAttendees[run.id] = updatedAttendees;
    localStorage.setItem('stride_starter_attendees', JSON.stringify(storedAttendees));
    return !isJoined;
  }

  const runRef = doc(db, RUNS_COLLECTION, run.id);
  try {
    await updateDoc(runRef, {
      rsvpUserIds: updatedUserIds,
      rsvpCount: updatedCount,
      attendees: updatedAttendees,
    });
    return !isJoined;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${RUNS_COLLECTION}/${run.id}`);
  }
}

export async function deleteRun(runId: string): Promise<void> {
  if (runId.startsWith('starter-')) {
    return;
  }
  const path = `${RUNS_COLLECTION}/${runId}`;
  try {
    await deleteDoc(doc(db, RUNS_COLLECTION, runId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToComments(
  runId: string,
  onUpdate: (comments: RunComment[]) => void,
  onError?: (error: Error) => void
) {
  if (runId.startsWith('starter-')) {
    const starterCommentsKey = `stride_comments_${runId}`;
    const stored: RunComment[] = JSON.parse(localStorage.getItem(starterCommentsKey) || '[]');
    if (stored.length === 0) {
      const defaults: RunComment[] = [
        {
          id: 'c1',
          runId,
          userId: 'coach_maya',
          userName: 'Maya Thorne',
          userPhoto:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          text: 'Looking forward to seeing everyone! We will have water cups ready at the turnaround point.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      onUpdate(defaults);
    } else {
      onUpdate(stored);
    }
    return () => {};
  }

  const commentsRef = collection(db, RUNS_COLLECTION, runId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: RunComment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        comments.push({
          id: docSnap.id,
          runId,
          userId: data.userId,
          userName: data.userName,
          userPhoto: data.userPhoto,
          text: data.text,
          createdAt: data.createdAt,
        });
      });
      onUpdate(comments);
    },
    (error) => {
      console.error('Comments subscription error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${RUNS_COLLECTION}/${runId}/comments`);
    }
  );
}

export async function addComment(
  runId: string,
  comment: { userId: string; userName: string; userPhoto?: string; text: string }
): Promise<string> {
  if (runId.startsWith('starter-')) {
    const starterCommentsKey = `stride_comments_${runId}`;
    const stored: RunComment[] = JSON.parse(localStorage.getItem(starterCommentsKey) || '[]');
    const newComment: RunComment = {
      id: `sc_${Date.now()}`,
      runId,
      userId: comment.userId,
      userName: comment.userName,
      userPhoto: comment.userPhoto || '',
      text: comment.text.trim(),
      createdAt: new Date().toISOString(),
    };
    stored.push(newComment);
    localStorage.setItem(starterCommentsKey, JSON.stringify(stored));
    return newComment.id;
  }

  const path = `${RUNS_COLLECTION}/${runId}/comments`;
  try {
    const docRef = await addDoc(collection(db, path), {
      runId,
      userId: comment.userId,
      userName: comment.userName,
      userPhoto: comment.userPhoto || '',
      text: comment.text.trim(),
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
