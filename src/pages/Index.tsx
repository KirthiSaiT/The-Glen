import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useListings } from "@/hooks/useListings";
import { ListingCard } from "@/components/ListingCard";
import { SearchFilters } from "@/components/SearchFilters";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    guests: 1,
    priceRange: [0, 1000] as [number, number],
  });
  const [isSearching, setIsSearching] = useState(false);
  
  const { user, signOut } = useAuth();
  const { listings, loading, error } = useListings();
  const navigate = useNavigate();

  // Optimized filtering with useMemo for better performance
  const filteredListings = useMemo(() => {
    console.log('Filtering listings with query:', searchQuery, 'and filters:', filters);
    
    return listings.filter(listing => {
      // Combined search across multiple fields
      const searchTerms = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchTerms || 
        listing.title.toLowerCase().includes(searchTerms) ||
        listing.city.toLowerCase().includes(searchTerms) ||
        listing.state.toLowerCase().includes(searchTerms) ||
        listing.property_type.toLowerCase().includes(searchTerms);

      // Location filter from advanced search
      const locationTerms = filters.location.toLowerCase().trim();
      const matchesLocation = !locationTerms ||
        listing.city.toLowerCase().includes(locationTerms) ||
        listing.state.toLowerCase().includes(locationTerms) ||
        listing.title.toLowerCase().includes(locationTerms);

      // Price filter with better range handling
      const matchesPrice = listing.price_per_night >= filters.priceRange[0] && 
        listing.price_per_night <= filters.priceRange[1];

      const finalMatch = matchesSearch && matchesLocation && matchesPrice;
      
      if (searchTerms || locationTerms) {
        console.log(`Listing "${listing.title}": search=${matchesSearch}, location=${matchesLocation}, price=${matchesPrice}, final=${finalMatch}`);
      }

      return finalMatch;
    });
  }, [listings, searchQuery, filters]);

  // Simulate search loading for better UX
  useEffect(() => {
    if (searchQuery || filters.location) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
    setIsSearching(false);
  }, [searchQuery, filters.location]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    console.log('Filters updated in Index:', newFilters);
    setFilters(newFilters);
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Quick search submitted:', searchQuery);
  };

  const clearAllSearch = () => {
    console.log('Clearing all search criteria');
    setSearchQuery("");
    setFilters({
      location: "",
      checkIn: undefined,
      checkOut: undefined,
      guests: 1,
      priceRange: [0, 1000],
    });
  };

  const hasActiveSearch = searchQuery || filters.location || filters.checkIn || filters.checkOut || 
    filters.guests > 1 || filters.priceRange[0] > 0 || filters.priceRange[1] < 1000;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">The Glen</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/stays" className="text-sm font-medium hover:text-primary transition-colors">
                Stays
              </a>
              <a href="/experiences" className="text-sm font-medium hover:text-primary transition-colors">
                Experiences
              </a>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/host")}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Become a Host
                </Button>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/host")}
                    className="flex items-center space-x-2"
                  >
                    <Home className="h-4 w-4" />
                    <span>Host</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                    Sign in
                  </Button>
                  <Button size="sm" onClick={() => navigate("/auth")}>
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find your perfect stay
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover amazing places to stay around the world. From cozy apartments to luxury villas.
          </p>
          
          {/* Quick Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="p-2 shadow-lg">
              <form onSubmit={handleQuickSearch} className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Where are you going?"
                    value={searchQuery}
                    onChange={(e) => {
                      console.log('Quick search changed:', e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    className="pl-10 border-none focus:ring-0 transition-all duration-200"
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto px-8 transition-all duration-200 hover:scale-105">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </Card>
          </div>

          {/* Advanced Search Filters */}
          <SearchFilters 
            onFiltersChange={handleFiltersChange}
            className="max-w-6xl mx-auto"
          />
        </div>
      </section>

      {/* Property Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h3 className="text-2xl font-semibold">
                {hasActiveSearch ? 
                  `Search results ${isSearching ? '...' : `(${filteredListings.length})`}` : 
                  "Popular destinations"
                }
              </h3>
              {isSearching && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {hasActiveSearch && (
                <Button 
                  variant="outline" 
                  onClick={clearAllSearch}
                  className="transition-all duration-200 hover:bg-primary hover:text-white"
                >
                  Clear Search
                </Button>
              )}
              <Button variant="outline">View all</Button>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try again</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
          
          {!loading && !error && filteredListings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No listings found</h3>
              <p className="text-gray-600 mb-6">
                {hasActiveSearch ? 
                  "Try adjusting your search criteria or browse all available listings." : 
                  "No listings are currently available."
                }
              </p>
              {hasActiveSearch && (
                <Button 
                  onClick={clearAllSearch}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Clear search and browse all
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-semibold mb-4">About</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">How The Glen works</a></li>
                <li><a href="#" className="hover:text-gray-900">Newsroom</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Community</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Diversity & Belonging</a></li>
                <li><a href="#" className="hover:text-gray-900">Accessibility</a></li>
                <li><a href="#" className="hover:text-gray-900">Partners</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Host</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Host your home</a></li>
                <li><a href="#" className="hover:text-gray-900">Host resources</a></li>
                <li><a href="#" className="hover:text-gray-900">Community forum</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Safety information</a></li>
                <li><a href="#" className="hover:text-gray-900">Cancellation options</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-600">© 2024 The Glen. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
