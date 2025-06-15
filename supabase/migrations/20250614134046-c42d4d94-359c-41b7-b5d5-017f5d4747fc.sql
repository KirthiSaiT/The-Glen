
-- First create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view and update their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Create listings table for hosts to manage properties
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  price_per_night DECIMAL(10,2) NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 1,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  amenities TEXT[],
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listings
CREATE POLICY "Anyone can view active listings" ON public.listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Hosts can manage their own listings" ON public.listings
  FOR ALL USING (auth.uid() = host_id);

-- RLS Policies for bookings
CREATE POLICY "Guests can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = guest_id);

CREATE POLICY "Hosts can view bookings for their listings" ON public.bookings
  FOR SELECT USING (auth.uid() IN (SELECT host_id FROM public.listings WHERE id = listing_id));

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = guest_id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, is_host)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name',
    COALESCE((new.raw_user_meta_data ->> 'is_host')::boolean, false)
  );
  RETURN new;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
