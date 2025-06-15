
import { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, MapPin, DollarSign, Users, Search } from "lucide-react";
import { format } from "date-fns";

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    location: string;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: number;
    priceRange: [number, number];
  }) => void;
  className?: string;
}

export const SearchFilters = ({ onFiltersChange, className }: SearchFiltersProps) => {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Debounced filter update
  const debouncedFiltersChange = useCallback(
    (filters: any) => {
      const timeoutId = setTimeout(() => {
        console.log('SearchFilters: Debounced filter update', filters);
        onFiltersChange(filters);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    },
    [onFiltersChange]
  );

  // Update filters with debouncing for location
  useEffect(() => {
    const cleanup = debouncedFiltersChange({
      location,
      checkIn,
      checkOut,
      guests,
      priceRange,
    });
    
    return cleanup;
  }, [location, checkIn, checkOut, guests, priceRange, debouncedFiltersChange]);

  const handleLocationChange = (value: string) => {
    console.log('Location changed:', value);
    setLocation(value);
  };

  const handleDateChange = (type: 'checkIn' | 'checkOut', date: Date | undefined) => {
    console.log(`${type} date changed:`, date);
    if (type === 'checkIn') {
      setCheckIn(date);
      // Clear checkout if it's before new check-in
      if (checkOut && date && checkOut <= date) {
        setCheckOut(undefined);
      }
    } else {
      setCheckOut(date);
    }
  };

  const handleGuestsChange = (value: string) => {
    const guestCount = Math.max(1, Math.min(16, parseInt(value) || 1));
    console.log('Guests changed:', guestCount);
    setGuests(guestCount);
  };

  const handlePriceChange = (value: [number, number]) => {
    console.log('Price range changed:', value);
    setPriceRange(value);
  };

  const clearFilters = () => {
    console.log('Clearing all filters');
    setLocation("");
    setCheckIn(undefined);
    setCheckOut(undefined);
    setGuests(1);
    setPriceRange([0, 1000]);
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Advanced Search</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="text-sm"
            >
              Clear All
            </Button>
          </div>

          {/* Main Search Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center text-sm font-medium">
                <MapPin className="h-4 w-4 mr-1" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="City, state, or region"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Check-in */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left transition-all duration-200 hover:border-primary/50"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={(date) => handleDateChange('checkIn', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check-out */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left transition-all duration-200 hover:border-primary/50"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={(date) => handleDateChange('checkOut', date)}
                    disabled={(date) => {
                      const today = new Date();
                      const minDate = checkIn || today;
                      return date <= minDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center text-sm font-medium">
                <Users className="h-4 w-4 mr-1" />
                Guests
              </Label>
              <Input
                id="guests"
                type="number"
                min={1}
                max={16}
                value={guests}
                onChange={(e) => handleGuestsChange(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="flex items-center text-sm font-medium">
                <DollarSign className="h-4 w-4 mr-1" />
                Price Range
              </Label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  max={2000}
                  min={0}
                  step={25}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(location || checkIn || checkOut || guests > 1 || priceRange[0] > 0 || priceRange[1] < 1000) && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {location && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  📍 {location}
                </span>
              )}
              {checkIn && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  📅 From {format(checkIn, "MMM dd")}
                </span>
              )}
              {checkOut && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  📅 To {format(checkOut, "MMM dd")}
                </span>
              )}
              {guests > 1 && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  👥 {guests} guests
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  💰 ${priceRange[0]} - ${priceRange[1]}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
