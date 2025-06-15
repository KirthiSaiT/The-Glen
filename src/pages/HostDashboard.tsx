
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Edit, Trash2, Eye, Home } from "lucide-react";
import { CreateListingModal } from "@/components/CreateListingModal";
import { EditListingModal } from "@/components/EditListingModal";

interface Listing {
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
  // These fields are now required for modal and CRUD compatibility
  description: string;
  address: string;
  amenities: string[];
}

const HostDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchListings();
  }, [user, navigate]);

  const fetchListings = async () => {
    try {
      console.log('Fetching host listings for user:', user?.id);
      const { data, error } = await (supabase as any)
        .from('listings')
        .select('*')
        .eq('host_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Listings fetch error:', error);
        throw error;
      }
      
      console.log('Fetched host listings:', data);
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Could not load your listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const { error } = await (supabase as any)
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      });
      
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast({
        title: "Error",
        description: "Could not delete listing",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (listing: Listing) => {
    try {
      const { error } = await (supabase as any)
        .from('listings')
        .update({ is_active: !listing.is_active })
        .eq('id', listing.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Listing ${!listing.is_active ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchListings();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Could not update listing",
        variant: "destructive",
      });
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
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Guest Dashboard
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Home className="h-8 w-8 mr-3" />
                Host Dashboard
              </h1>
              <p className="text-gray-600">Manage your property listings</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Your Listings ({listings.length})</h2>
          
          {listings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-4">
                  Start hosting by creating your first property listing
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={listing.images?.[0] || 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                      listing.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {listing.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{listing.title}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {listing.city}, {listing.state}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>{listing.property_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span>{listing.max_guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bedrooms:</span>
                        <span>{listing.bedrooms}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Price per night:</span>
                        <span>${listing.price_per_night}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(listing)}
                      >
                        {listing.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteListing(listing.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateListingModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchListings();
        }}
      />
      
      {selectedListing && (
        <EditListingModal 
          isOpen={showEditModal} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedListing(null);
            fetchListings();
          }}
        />
      )}
    </div>
  );
};

export default HostDashboard;
