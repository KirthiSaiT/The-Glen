import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

const Stays = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            From cozy apartments to luxury villas, discover unique places to stay around the world.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="p-2 shadow-lg">
              <form className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Where do you want to stay?"
                    className="pl-10 border-none focus:ring-0"
                  />
                </div>
                <Button className="w-full md:w-auto px-8">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by property type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Houses", count: "1,234", image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994" },
              { title: "Apartments", count: "2,345", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" },
              { title: "Villas", count: "567", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811" },
              { title: "Beach Houses", count: "789", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750" },
            ].map((category, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-1">{category.title}</h3>
                  <p className="text-gray-600">{category.count} properties</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Luxury Villa with Ocean View",
                location: "Bali, Indonesia",
                price: "$450",
                rating: "4.9",
                image: "https://images.unsplash.com/photo-1613977257363-707ba9348227"
              },
              {
                title: "Modern Downtown Apartment",
                location: "New York, USA",
                price: "$200",
                rating: "4.8",
                image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
              },
              {
                title: "Mountain View Cabin",
                location: "Swiss Alps",
                price: "$350",
                rating: "4.9",
                image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233"
              }
            ].map((property, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{property.title}</h3>
                    <span className="text-sm font-medium text-primary">★ {property.rating}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{property.location}</p>
                  <p className="text-lg font-semibold text-primary">${property.price} / night</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stays; 