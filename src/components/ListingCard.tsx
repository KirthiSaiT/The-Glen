
import { Heart, MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ListingCardProps {
  listing: {
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
  };
}

export const ListingCard = ({ listing }: ListingCardProps) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/listing/${listing.id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  // Fallback image if none provided
  const imageUrl = listing.images?.[0] || 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop';

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleLikeClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${
              liked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">4.8</span>
            <span className="text-sm text-gray-500">(24)</span>
          </div>
          <span className="text-sm text-gray-500">{listing.property_type}</span>
        </div>
        
        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {listing.title}
        </h4>
        
        <p className="text-sm text-gray-600 mb-2 flex items-center">
          <MapPin className="h-3 w-3 mr-1" />
          {listing.city}, {listing.state}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Hosted by {listing.profiles?.first_name || 'Host'}
          </span>
          <div className="text-right">
            <span className="font-semibold text-gray-900">
              ${listing.price_per_night}
            </span>
            <span className="text-sm text-gray-500"> / night</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
