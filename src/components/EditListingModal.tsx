
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Listing {
  id: string;
  title: string;
  description: string;
  property_type: string;
  city: string;
  state: string;
  address: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onSuccess: () => void;
}

export const EditListingModal = ({ isOpen, onClose, listing, onSuccess }: EditListingModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "",
    city: "",
    state: "",
    address: "",
    price_per_night: "",
    max_guests: "",
    bedrooms: "",
    bathrooms: "",
    amenities: "",
    images: ""
  });

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        property_type: listing.property_type || "",
        city: listing.city || "",
        state: listing.state || "",
        address: listing.address || "",
        price_per_night: listing.price_per_night?.toString() || "",
        max_guests: listing.max_guests?.toString() || "",
        bedrooms: listing.bedrooms?.toString() || "",
        bathrooms: listing.bathrooms?.toString() || "",
        amenities: listing.amenities?.join(", ") || "",
        images: listing.images?.join(", ") || ""
      });
    }
  }, [listing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const amenitiesArray = formData.amenities
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const imagesArray = formData.images
        .split(",")
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const { error } = await (supabase as any)
        .from('listings')
        .update({
          title: formData.title,
          description: formData.description,
          property_type: formData.property_type,
          city: formData.city,
          state: formData.state,
          address: formData.address,
          price_per_night: parseFloat(formData.price_per_night),
          max_guests: parseInt(formData.max_guests),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          amenities: amenitiesArray,
          images: imagesArray,
          updated_at: new Date().toISOString()
        })
        .eq('id', listing.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing updated successfully!",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: "Error",
        description: "Could not update listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="property_type">Property Type *</Label>
              <Select value={formData.property_type} onValueChange={(value) => setFormData({ ...formData, property_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Condo">Condo</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Cabin">Cabin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="price_per_night">Price per night *</Label>
              <Input
                id="price_per_night"
                type="number"
                step="0.01"
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="max_guests">Max Guests *</Label>
              <Input
                id="max_guests"
                type="number"
                min="1"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                min="1"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                min="1"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="amenities">Amenities (comma separated)</Label>
            <Input
              id="amenities"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              placeholder="WiFi, Kitchen, Pool, etc."
            />
          </div>

          <div>
            <Label htmlFor="images">Image URLs (comma separated)</Label>
            <Textarea
              id="images"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
