
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    listingTitle: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    nights: number;
  };
  onPaymentSuccess: () => void;
}

export const PaymentModal = ({ isOpen, onClose, booking, onPaymentSuccess }: PaymentModalProps) => {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    // Mock payment processing
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      toast({
        title: "Payment Successful!",
        description: `Your booking for ${booking.listingTitle} has been confirmed.`,
      });
      
      onPaymentSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Property:</span>
                <span className="font-medium">{booking.listingTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dates:</span>
                <span>{booking.checkIn} - {booking.checkOut}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Guests:</span>
                <span>{booking.guests}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Nights:</span>
                <span>{booking.nights}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${booking.totalPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={processing}
              className="flex-1"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay ${booking.totalPrice}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
