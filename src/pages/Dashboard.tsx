import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: string;
  listings: {
    title: string;
    city: string;
    state: string;
    images: string[];
  };
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings for user:', user?.id);
      const { data, error } = await (supabase as any)
        .from('bookings')
        .select(`
          id,
          check_in,
          check_out,
          guests,
          total_price,
          status,
          listings:listing_id (
            title,
            city,
            state,
            images
          )
        `)
        .eq('guest_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Bookings fetch error:', error);
        throw error;
      }
      
      console.log('Fetched bookings:', data);
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Could not load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to StayFinder
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-600">Manage your bookings and account</p>
        </div>

        {/* Bookings Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
          
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-4">
                  Start exploring amazing places to stay
                </p>
                <Button onClick={() => navigate("/")}>
                  Browse Listings
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={booking.listings?.images?.[0] || 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop'}
                      alt={booking.listings?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{booking.listings?.title}</CardTitle>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.listings?.city}, {booking.listings?.state}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span>{new Date(booking.check_in).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span>{new Date(booking.check_out).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Guests:
                        </span>
                        <span>{booking.guests}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total:</span>
                        <span>${booking.total_price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
