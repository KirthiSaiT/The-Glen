import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

const Experiences = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Local Experiences
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with local hosts and create unforgettable memories.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="p-2 shadow-lg">
              <form className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Where do you want to go?"
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

      {/* Featured Experiences */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured experiences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Traditional Cooking Class",
                location: "Bali, Indonesia",
                price: "$45",
                rating: "4.9",
                reviews: 128,
                image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
              },
              {
                title: "Mountain Hiking Adventure",
                location: "Swiss Alps",
                price: "$75",
                rating: "4.8",
                reviews: 95,
                image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1"
              },
              {
                title: "City Art Tour",
                location: "Paris, France",
                price: "$35",
                rating: "4.7",
                reviews: 156,
                image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
              }
            ].map((experience, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={experience.image}
                    alt={experience.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{experience.title}</h3>
                    <span className="text-sm font-medium text-primary">★ {experience.rating}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{experience.location}</p>
                  <p className="text-lg font-semibold text-primary mb-2">${experience.price} per person</p>
                  <p className="text-sm text-gray-500">{experience.reviews} reviews</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What our guests say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                location: "New York",
                rating: 5,
                review: "The cooking class in Bali was absolutely amazing! Our host was incredibly knowledgeable and made us feel like family. The food was delicious and we learned so much about local ingredients and techniques.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
              },
              {
                name: "Michael Chen",
                location: "San Francisco",
                rating: 5,
                review: "The mountain hiking adventure in the Swiss Alps was breathtaking. Our guide was professional and ensured our safety while making the experience unforgettable. The views were spectacular!",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
              },
              {
                name: "Emma Wilson",
                location: "London",
                rating: 4,
                review: "The art tour in Paris was enlightening. We discovered hidden gems and learned fascinating stories about the city's art scene. The small group size made it very personal and engaging.",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
              }
            ].map((review, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{review.name}</h3>
                    <p className="text-sm text-gray-600">{review.location}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">{review.review}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Experiences; 