
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Listing {
  id: string;
  title: string;
  city: string;
  state: string;
  price_per_night: number;
  images: string[];
}

interface MapViewProps {
  listings: Listing[];
  onListingSelect?: (listing: Listing) => void;
  className?: string;
}

export const MapView = ({ listings, onListingSelect, className }: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    // Check if token is already available in localStorage
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
      setShowTokenInput(false);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-98, 39], // Center of US
        zoom: 4,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers for listings
      listings.forEach((listing) => {
        // For demo purposes, generate random coordinates around major US cities
        const coordinates = generateCoordinates(listing.city, listing.state);
        
        const marker = new mapboxgl.Marker({
          color: '#3B82F6',
        })
          .setLngLat(coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${listing.title}</h3>
                <p class="text-sm text-gray-600">${listing.city}, ${listing.state}</p>
                <p class="font-medium">$${listing.price_per_night}/night</p>
                <button onclick="window.parent.postMessage({type: 'selectListing', id: '${listing.id}'}, '*')" 
                        class="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                  View Details
                </button>
              </div>
            `)
          )
          .addTo(map.current);
      });

      // Listen for listing selection messages
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'selectListing' && onListingSelect) {
          const listing = listings.find(l => l.id === event.data.id);
          if (listing) {
            onListingSelect(listing);
          }
        }
      };
      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, listings, onListingSelect]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
    }
  };

  // Generate mock coordinates for cities
  const generateCoordinates = (city: string, state: string): [number, number] => {
    const cityCoords: { [key: string]: [number, number] } = {
      'new york': [-73.935242, 40.730610],
      'los angeles': [-118.243685, 34.052234],
      'chicago': [-87.623177, 41.881832],
      'miami': [-80.191790, 25.761680],
      'san francisco': [-122.431297, 37.773972],
      'seattle': [-122.335167, 47.608013],
      'austin': [-97.733330, 30.266667],
      'denver': [-104.990251, 39.739236],
    };

    const cityKey = city.toLowerCase();
    const baseCoords = cityCoords[cityKey] || [-98, 39];
    
    // Add some random offset for variety
    return [
      baseCoords[0] + (Math.random() - 0.5) * 0.1,
      baseCoords[1] + (Math.random() - 0.5) * 0.1
    ];
  };

  if (showTokenInput) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Map Integration</h3>
          <p className="text-sm text-gray-600">
            To display the map, please enter your Mapbox public token. 
            Get yours at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a>
          </p>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter Mapbox public token"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button onClick={handleTokenSubmit}>Set Token</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} />
    </div>
  );
};
