"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

interface Order {
    _id: string;
    orderItems: { 
        productId: { name: string; image: string }; 
        quantity: number; 
        price: number;
        farmerId: { name: string; city: string };
    }[];
    totalAmount: number;
    orderStatus: string;
    orderDate: string;
}

export default function CustomerDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
const getCookieValue = (name: string) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? decodeURIComponent(match[2]) : null;
        };

        let token = localStorage.getItem("token");
        if (!token) {
            const cookieToken = getCookieValue("token");
            if (cookieToken) {
                token = cookieToken;
                localStorage.setItem("token", cookieToken);
            }
        }

            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const res = await fetch("/api/customer/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div>
            <Header />
            <div className="container mx-auto p-6 space-y-8 min-h-screen">
                <h1 className="text-3xl font-bold">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-lg">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No orders yet</h3>
                        <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                        <Button onClick={() => router.push("/marketplace")}>Start Shopping</Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order._id}>
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Order ID: {order._id}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(order.orderDate || order._id).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">₹{order.totalAmount}</p>
                                            <Badge variant={
                                                order.orderStatus === 'delivered' ? 'default' :
                                                    order.orderStatus === 'shipped' ? 'secondary' : 'outline'
                                            }>
                                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {order.orderItems?.map((item, idx) => (
                                            <div key={idx} className="flex items-center space-x-4">
                                                <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                                    {item.productId?.image && <img src={item.productId.image} alt={item.productId.name} className="h-full w-full object-cover" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.productId?.name || "Product Removed"}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} • Seller: {item.farmerId?.name} ({item.farmerId?.city})</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">₹{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
