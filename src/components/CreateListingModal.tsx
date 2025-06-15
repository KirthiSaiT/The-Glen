
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateListingModal = ({ isOpen, onClose, onSuccess }: CreateListingModalProps) => {
  const { user } = useAuth();
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
    max_guests: "1",
    bedrooms: "1",
    bathrooms: "1",
    amenities: "",
    images: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
        .insert({
          host_id: user.id,
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
          images: imagesArray
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing created successfully!",
      });
      
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Could not create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      property_type: "",
      city: "",
      state: "",
      address: "",
      price_per_night: "",
      max_guests: "1",
      bedrooms: "1",
      bathrooms: "1",
      amenities: "",
      images: ""
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Listing</DialogTitle>
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
