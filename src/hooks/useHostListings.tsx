
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface HostListing {
  id: string;
  title: string;
  city: string;
  state: string;
  price_per_night: number;
  property_type: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  description: string;
  address: string;
  amenities: string[];
}

export const useHostListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<HostListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHostListings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching host listings for user:', user.id);
      
      const { data, error } = await (supabase as any)
        .from('listings')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Host listings error:', error);
        throw error;
      }
      
      console.log('Fetched host listings:', data);
      setListings(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching host listings:', err);
      setError('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHostListings();
    }
  }, [user]);

  return { listings, loading, error, refetch: fetchHostListings };
};
