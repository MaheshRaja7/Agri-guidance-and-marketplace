"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import Header from "@/components/Header";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    shippingAddress: "",
    contactPhone: "",
    paymentMethod: "upi", // Default
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      router.push("/cart");
      return;
    }
    const sum = cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    setTotal(sum);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData({ ...formData, paymentMethod: value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to place an order");
        router.push("/login");
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const orderData = {
        items: cart,
        totalAmount: total,
        shippingAddress: formData.shippingAddress,
        contactPhone: formData.contactPhone,
        paymentMethod: formData.paymentMethod,
      };

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        setSuccess(true);
        localStorage.removeItem("cart"); // Clear cart
        setTimeout(() => {
          router.push("/customer/dashboard"); // Redirect to orders page
        }, 3000);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong");
    } finally {
      if (!success) setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-6">Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6 max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePlaceOrder} className="space-y-6">

              <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-green-700">₹{total}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Input
                  id="shippingAddress"
                  name="shippingAddress"
                  placeholder="Full address (House No, Street, City, Pincode)"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="Mobile number for delivery coordination"
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <RadioGroup defaultValue="upi" onValueChange={handlePaymentMethodChange} className="grid grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                    <Label
                      htmlFor="upi"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-bold">UPI</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="card" id="card" className="peer sr-only" />
                    <Label
                      htmlFor="card"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-bold">Card</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="cod" id="cod" className="peer sr-only" />
                    <Label
                      htmlFor="cod"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-bold">COD</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full size-lg text-lg" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing Payment...</> : `Pay ₹${total}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
