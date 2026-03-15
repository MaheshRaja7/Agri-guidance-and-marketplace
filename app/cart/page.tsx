"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Minus, Plus, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import { getCartItems, updateCartQuantity, removeFromCart } from "@/lib/cart";

interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    farmerId: string;
}

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const storedUserJson = typeof window !== "undefined" ? localStorage.getItem("user") : null;

        if (!storedUserJson) {
            // Redirect users who are not logged in
            router.push("/login");
            return;
        }

        let parsedUser: { userType?: string } | null = null;
        try {
            parsedUser = JSON.parse(storedUserJson);
        } catch (error) {
            console.error("Failed to parse stored user", error);
        }

        if (!parsedUser || parsedUser.userType !== "customer") {
            // Redirect farmers (or malformed users) away from the customer cart page
            router.push(parsedUser?.userType === "farmer" ? "/farmer/dashboard" : "/login");
            return;
        }

        const storedCart = getCartItems();
        setCart(storedCart);
        calculateTotal(storedCart);
    }, [router]);

    const calculateTotal = (items: CartItem[]) => {
        const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotal(sum);
    };

    const updateQuantity = (productId: string, change: number) => {
const currentQty = cart.find((item) => item.productId === productId)?.quantity ?? 1;
    const updatedCart = updateCartQuantity(productId, currentQty + change);
    setCart(updatedCart);
        calculateTotal(updatedCart);
    };

    const removeItem = (productId: string) => {
    const updatedCart = removeFromCart(productId);
    setCart(updatedCart);
    };

    return (
        <div>
            <Header />
            <div className="container mx-auto p-6 max-w-4xl min-h-screen">
                <h1 className="text-3xl font-bold mb-8 flex items-center">
                    <ShoppingCart className="mr-3 h-8 w-8" /> Your Cart
                </h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-lg">
                        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                        <Button onClick={() => router.push("/marketplace")}>Start Shopping</Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="md:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <Card key={item.productId} className="flex flex-row overflow-hidden">
                                    <div className="w-32 h-32 relative flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                                    </div>
                                    <CardContent className="flex-1 p-4 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-lg">{item.name}</h3>
                                            <p className="font-bold">₹{item.price * item.quantity}</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex items-center space-x-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, -1)}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.productId, 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(item.productId)}>
                                                <Trash className="h-4 w-4 mr-1" /> Remove
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Summary */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₹{total}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <span className="text-green-600">Free</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>₹{total}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full size-lg text-lg" onClick={() => router.push("/checkout")}>
                                        Proceed to Checkout
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
