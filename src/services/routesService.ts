import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { SavedRoute, TerrainType, RouteDifficulty } from '../types.ts';

const ROUTES_COLLECTION = 'routes';

export const STARTER_ROUTES: SavedRoute[] = [
  {
    id: 'starter-route-1',
    title: 'Riverfront Boardwalk Loop',
    distanceKm: 7.5,
    difficulty: 'easy',
    startLocation: 'East Pier Boardwalk Entrance',
    address: '100 Harbor Way, Waterfront Plaza',
    elevationGainM: 35,
    terrain: 'road',
    description: 'Flat, breezy scenic asphalt and timber pathway alongside the river. Great for morning shakeouts and conversational miles.',
    landmarks: ['South Bridge Overpass', 'Lighthouse Turnaround', 'Marina Cafe'],
    creatorId: 'coach_maya',
    creatorName: 'Maya Thorne (Coach)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-route-2',
    title: 'Downtown Neon & Parks 10K',
    distanceKm: 10.2,
    difficulty: 'moderate',
    startLocation: 'Civic Center Monument Steps',
    address: '450 Grand Avenue, Downtown',
    elevationGainM: 80,
    terrain: 'road',
    description: 'Classic city loop hitting wide paved boulevards, public monuments, and the shaded perimeter of City Park.',
    landmarks: ['Civic Center', 'Old Town Hall', 'Park Rose Garden', 'Grand Plaza'],
    creatorId: 'marcus_vance',
    creatorName: 'Marcus Vance',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-route-3',
    title: 'Pine Ridge Switchback Trail',
    distanceKm: 14.0,
    difficulty: 'challenging',
    startLocation: 'Pine Ridge Nature Reserve Trailhead',
    address: 'Trailhead Parking Lot B, Ridge Road',
    elevationGainM: 260,
    terrain: 'trail',
    description: 'Single-track pine forest loop with rolling climbs and panoramic lookout bluff. Requires trail shoes or high-traction road shoes.',
    landmarks: ['Eagle Point Lookout', 'Pine Needle Valley', 'Creek Crossing Footbridge'],
    creatorId: 'chloe_b',
    creatorName: 'Chloe Bennett',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-route-4',
    title: 'Twin Bridges Half Marathon Route',
    distanceKm: 21.1,
    difficulty: 'elite',
    startLocation: 'Track Club Clubhouse',
    address: '12 Athletic Way, Sports District',
    elevationGainM: 110,
    terrain: 'road',
    description: 'High-mileage training circuit crossing both historic suspension bridges with unobstructed skyline views. Great for weekend long runs.',
    landmarks: ['West Bridge Ramp', 'Waterfront Esplanade', 'East Bridge Span', 'Sports Complex Finish'],
    creatorId: 'derek_hill',
    creatorName: 'Coach Derek Hill',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-route-5',
    title: 'Sunset Track Speed Oval & Warmup',
    distanceKm: 5.0,
    difficulty: 'easy',
    startLocation: 'Community Athletic Stadium Track',
    address: '88 Sports Parkway, Gate 2',
    elevationGainM: 5,
    terrain: 'track',
    description: 'Synthetic rubber 400m track with marked lanes. Ideal for speedwork, interval repeats, or calibrated 5K time trials.',
    landmarks: ['Track Gate 2', 'Grandstand 100m Line', 'Fieldhouse Restrooms'],
    creatorId: 'marcus_vance',
    creatorName: 'Marcus Vance',
    createdAt: new Date().toISOString(),
  },
];

export function subscribeToRoutes(
  onUpdate: (routes: SavedRoute[]) => void,
  onError?: (error: Error) => void
) {
  const routesRef = collection(db, ROUTES_COLLECTION);
  return onSnapshot(
    routesRef,
    (snapshot) => {
      const dbRoutes: SavedRoute[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbRoutes.push({
          id: docSnap.id,
          title: data.title || '',
          distanceKm: Number(data.distanceKm) || 0,
          difficulty: (data.difficulty as RouteDifficulty) || 'moderate',
          startLocation: data.startLocation || '',
          address: data.address || '',
          elevationGainM: Number(data.elevationGainM) || 0,
          terrain: (data.terrain as TerrainType) || 'road',
          description: data.description || '',
          landmarks: Array.isArray(data.landmarks) ? data.landmarks : [],
          creatorId: data.creatorId || '',
          creatorName: data.creatorName || 'Club Member',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      // Get local custom routes if any
      const localCustomRoutes: SavedRoute[] = JSON.parse(
        localStorage.getItem('stride_custom_routes') || '[]'
      );

      // Combine Firestore + local custom + starter routes
      const combined = [...dbRoutes, ...localCustomRoutes];
      const result = combined.length > 0 ? combined : STARTER_ROUTES;

      onUpdate(result);
    },
    (error) => {
      console.error('Error listening to routes:', error);
      if (onError) onError(error);
      const localCustomRoutes: SavedRoute[] = JSON.parse(
        localStorage.getItem('stride_custom_routes') || '[]'
      );
      onUpdate([...localCustomRoutes, ...STARTER_ROUTES]);
    }
  );
}

export async function createRoute(
  route: Omit<SavedRoute, 'id' | 'createdAt'>
): Promise<string> {
  const path = ROUTES_COLLECTION;
  try {
    const docData = {
      title: route.title.trim(),
      distanceKm: Number(route.distanceKm),
      difficulty: route.difficulty,
      startLocation: route.startLocation.trim(),
      address: route.address ? route.address.trim() : route.startLocation.trim(),
      elevationGainM: Number(route.elevationGainM) || 0,
      terrain: route.terrain || 'road',
      description: route.description ? route.description.trim() : '',
      landmarks: route.landmarks || [],
      creatorId: route.creatorId,
      creatorName: route.creatorName,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, path), docData);
    return docRef.id;
  } catch (error) {
    // If permission or network issue, fallback to local storage
    console.warn('Saving route to local fallback storage due to:', error);
    const localCustomRoutes: SavedRoute[] = JSON.parse(
      localStorage.getItem('stride_custom_routes') || '[]'
    );
    const newId = `local_route_${Date.now()}`;
    const newRoute: SavedRoute = {
      id: newId,
      title: route.title.trim(),
      distanceKm: Number(route.distanceKm),
      difficulty: route.difficulty,
      startLocation: route.startLocation.trim(),
      address: route.address ? route.address.trim() : route.startLocation.trim(),
      elevationGainM: Number(route.elevationGainM) || 0,
      terrain: route.terrain || 'road',
      description: route.description ? route.description.trim() : '',
      landmarks: route.landmarks || [],
      creatorId: route.creatorId,
      creatorName: route.creatorName,
      createdAt: new Date().toISOString(),
    };
    localCustomRoutes.unshift(newRoute);
    localStorage.setItem('stride_custom_routes', JSON.stringify(localCustomRoutes));
    return newId;
  }
}

export async function deleteRoute(routeId: string): Promise<void> {
  if (routeId.startsWith('starter-')) {
    return;
  }
  if (routeId.startsWith('local_route_')) {
    const localCustomRoutes: SavedRoute[] = JSON.parse(
      localStorage.getItem('stride_custom_routes') || '[]'
    );
    const updated = localCustomRoutes.filter((r) => r.id !== routeId);
    localStorage.setItem('stride_custom_routes', JSON.stringify(updated));
    return;
  }
  const path = `${ROUTES_COLLECTION}/${routeId}`;
  try {
    await deleteDoc(doc(db, ROUTES_COLLECTION, routeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
