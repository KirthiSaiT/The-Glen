
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Listing {
  id: string;
  title: string;
  city: string;
  state: string;
  price_per_night: number;
  images: string[];
  profiles: {
    first_name: string;
  };
  property_type: string;
}

export const useListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      console.log('Fetching listings...');
      
      // First get the listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .eq('is_active', true);
      
      if (listingsError) {
        console.error('Supabase error fetching listings:', listingsError);
        throw listingsError;
      }
      
      console.log('Fetched listings data:', listingsData);
      
      if (!listingsData || listingsData.length === 0) {
        console.log('No listings found');
        setListings([]);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Get unique host IDs
      const hostIds = [...new Set(listingsData.map(listing => listing.host_id))];
      console.log('Host IDs to fetch:', hostIds);
      
      // Fetch profiles for all hosts
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name')
        .in('id', hostIds);
      
      if (profilesError) {
        console.error('Supabase error fetching profiles:', profilesError);
        // Don't throw error, just continue without profile data
      }
      
      console.log('Fetched profiles data:', profilesData);
      
      // Map listings with profile data
      const listingsWithProfiles = listingsData.map(listing => ({
        id: listing.id,
        title: listing.title,
        city: listing.city,
        state: listing.state,
        price_per_night: listing.price_per_night,
        images: listing.images || [],
        property_type: listing.property_type,
        profiles: {
          first_name: profilesData?.find(profile => profile.id === listing.host_id)?.first_name || 'Host'
        }
      }));
      
      console.log('Final listings with profiles:', listingsWithProfiles);
      setListings(listingsWithProfiles);
      setError(null);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return { listings, loading, error, refetch: fetchListings };
};
