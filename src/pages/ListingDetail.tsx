
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentModal } from "@/components/PaymentModal";
import { ArrowLeft, MapPin, Users, Bed, Bath, Wifi, Car, Waves, Flame, Mountain, Eye, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Listing {
  id: string;
  title: string;
  description: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  host_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const getAmenityIcon = (amenity: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    'WiFi': <Wifi className="h-4 w-4" />,
    'Parking': <Car className="h-4 w-4" />,
    'Beach Access': <Waves className="h-4 w-4" />,
    'Fireplace': <Flame className="h-4 w-4" />,
    'Mountain Views': <Mountain className="h-4 w-4" />,
    'City Views': <Eye className="h-4 w-4" />
  };
  return icons[amenity] || <div className="h-4 w-4 bg-gray-300 rounded" />;
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      console.log('Fetching listing with id:', id);
      
      // First fetch the listing
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (listingError) {
        console.error('Listing fetch error:', listingError);
        throw listingError;
      }
      
      console.log('Fetched listing:', listingData);
      
      // Then fetch the host profile separately
      let hostProfile = null;
      if (listingData.host_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', listingData.host_id)
          .single();
        
        if (!profileError && profileData) {
          hostProfile = profileData;
        }
      }
      
      // Combine the data
      const combinedListing = {
        ...listingData,
        country: 'India', // Default country since it's not in the database
        profiles: hostProfile
      };
      
      console.log('Combined listing with profile:', combinedListing);
      setListing(combinedListing);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: "Error",
        description: "Could not load listing details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !listing) return 0;
    const nights = calculateNights();
    return listing.price_per_night * nights;
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to make a booking",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!checkIn || !checkOut) {
      toast({
        title: "Select dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    // Show payment modal instead of directly creating booking
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setBookingLoading(true);
    try {
      console.log('Creating booking with data:', {
        listing_id: id,
        guest_id: user?.id,
        check_in: format(checkIn!, 'yyyy-MM-dd'),
        check_out: format(checkOut!, 'yyyy-MM-dd'),
        guests: guests,
        total_price: calculateTotalPrice(),
        special_requests: specialRequests || null
      });
      
      const { error } = await supabase
        .from('bookings')
        .insert({
          listing_id: id,
          guest_id: user?.id,
          check_in: format(checkIn!, 'yyyy-MM-dd'),
          check_out: format(checkOut!, 'yyyy-MM-dd'),
          guests: guests,
          total_price: calculateTotalPrice(),
          special_requests: specialRequests || null,
          status: 'confirmed' // Set as confirmed after payment
        });

      if (error) {
        console.error('Booking creation error:', error);
        throw error;
      }

      toast({
        title: "Booking confirmed!",
        description: "Your booking has been confirmed and payment processed successfully",
      });
      
      // Reset form
      setCheckIn(undefined);
      setCheckOut(undefined);
      setGuests(1);
      setSpecialRequests("");
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Could not create booking. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="p-0 h-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to listings
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="aspect-[16/9] rounded-lg overflow-hidden">
              <img
                src={listing.images?.[0] || 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Basic Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{listing.title}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.city}, {listing.state}, {listing.country}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${listing.price_per_night}</div>
                  <div className="text-sm text-gray-600">per night</div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {listing.max_guests} guests
                </div>
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  {listing.bedrooms} bedrooms
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  {listing.bathrooms} bathrooms
                </div>
              </div>
            </div>

            {/* Host Info */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-2">
                Hosted by {listing.profiles?.first_name || 'Host'} {listing.profiles?.last_name || ''}
              </h2>
              <p className="text-gray-600">{listing.property_type}</p>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed">{listing.description || 'No description available.'}</p>
            </div>

            {/* Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {getAmenityIcon(amenity)}
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-xl font-semibold mb-4">
                  ${listing.price_per_night} / night
                </div>

                <div className="space-y-4">
                  {/* Date Pickers */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Check-in</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "MMM dd") : "Select"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Check-out</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "MMM dd") : "Select"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            disabled={(date) => date <= (checkIn || new Date())}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <Label htmlFor="guests">Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={listing.max_guests}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="requests">Special requests (optional)</Label>
                    <Textarea
                      id="requests"
                      placeholder="Any special requests or questions?"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>

                  {/* Total Price */}
                  {checkIn && checkOut && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total ({calculateNights()} nights)</span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleBooking} 
                    className="w-full" 
                    disabled={bookingLoading || !checkIn || !checkOut}
                  >
                    {bookingLoading ? "Processing..." : "Reserve & Pay"}
                  </Button>

                  {!user && (
                    <p className="text-sm text-gray-600 text-center">
                      You need to sign in to make a booking
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {listing && checkIn && checkOut && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={{
            listingTitle: listing.title,
            checkIn: format(checkIn, "MMM dd, yyyy"),
            checkOut: format(checkOut, "MMM dd, yyyy"),
            guests: guests,
            totalPrice: calculateTotalPrice(),
            nights: calculateNights(),
          }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default ListingDetail;
