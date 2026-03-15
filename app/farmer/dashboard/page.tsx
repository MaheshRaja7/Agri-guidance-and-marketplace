"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Package,
    Plus,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Header from "@/components/Header";

interface Stats {
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    revenue: number;
}

interface Order {
    _id: string;
    customerId: { name: string; email: string };
    totalAmount: number;
    orderStatus: string;
    paymentStatus?: string;
    paymentMethod?: string;
    orderItems: Array<{ productName: string; quantity: number; price: number }>;
    orderDate: string;
    createdAt: string;
}


export default function FarmerDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [analyticsMode, setAnalyticsMode] = useState<'7days' | 'daily' | 'monthly' | 'yearly'>('7days');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

    const formattedTotalProducts = stats?.totalProducts?.toLocaleString() ?? "0";
    const formattedTotalOrders = stats?.totalOrders?.toLocaleString() ?? "0";
    const formattedRevenue = stats?.revenue != null ? stats.revenue.toLocaleString() : "0";

    const salesData = useMemo(() => {
        const totals: Record<string, number> = {};

        if (analyticsMode === 'daily') {
            const selected = selectedDate;
            recentOrders.forEach((order) => {
                const dateValue = order.orderDate ? new Date(order.orderDate) : null;
                const date = dateValue && !isNaN(dateValue.getTime())
                    ? dateValue.toISOString().split('T')[0]
                    : null;
                if (date !== selected) return;

                const orderTotal = (order.orderItems ?? []).reduce(
                    (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
                    0
                );
                totals[selected] = (totals[selected] || 0) + orderTotal;
            });

            return [{ date: selected, sales: totals[selected] || 0 }];
        }

        if (analyticsMode === 'monthly') {
            const [year, month] = selectedMonth.split('-');
            recentOrders.forEach((order) => {
                const dateValue = order.orderDate ? new Date(order.orderDate) : null;
                if (!dateValue || isNaN(dateValue.getTime())) return;
                const orderYear = dateValue.getFullYear().toString();
                const orderMonth = String(dateValue.getMonth() + 1).padStart(2, '0');
                if (`${orderYear}-${orderMonth}` !== `${year}-${month}`) return;

                const date = dateValue.toISOString().split('T')[0];
                const orderTotal = (order.orderItems ?? []).reduce(
                    (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
                    0
                );
                totals[date] = (totals[date] || 0) + orderTotal;
            });

            return Object.entries(totals)
                .map(([date, sales]) => ({ date, sales }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }

        if (analyticsMode === 'yearly') {
            const year = selectedYear;
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            recentOrders.forEach((order) => {
                const dateValue = order.orderDate ? new Date(order.orderDate) : null;
                if (!dateValue || isNaN(dateValue.getTime())) return;
                const orderYear = dateValue.getFullYear().toString();
                if (orderYear !== year) return;

                const monthIndex = dateValue.getMonth();
                const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
                const orderTotal = (order.orderItems ?? []).reduce(
                    (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
                    0
                );
                totals[monthKey] = (totals[monthKey] || 0) + orderTotal;
            });

            return Object.entries(totals)
                .map(([monthKey, sales]) => {
                    const [, month] = monthKey.split('-');
                    const monthIndex = Number(month) - 1;
                    return { date: monthNames[monthIndex] ?? monthKey, sales };
                })
                .sort((a, b) => {
                    const aIndex = new Date(`${year}-${a.date}-01`).getMonth();
                    const bIndex = new Date(`${year}-${b.date}-01`).getMonth();
                    return aIndex - bIndex;
                });
        }

        // Default: last 7 days
        recentOrders.forEach((order) => {
            const dateValue = order.orderDate ? new Date(order.orderDate) : null;
            const date = dateValue && !isNaN(dateValue.getTime())
                ? dateValue.toISOString().split("T")[0]
                : "Unknown";
            const orderTotal = (order.orderItems ?? []).reduce(
                (sum, item) => sum + (Number(item.price) * Number(item.quantity)),
                0
            );
            totals[date] = (totals[date] || 0) + orderTotal;
        });

        return Object.entries(totals)
            .map(([date, sales]) => ({ date, sales }))
            .sort((a, b) => {
                const aTime = new Date(a.date).getTime();
                const bTime = new Date(b.date).getTime();
                if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
                return aTime - bTime;
            })
            .slice(-7);
    }, [recentOrders, analyticsMode, selectedDate, selectedMonth, selectedYear]);

    // Function to fetch data
    const fetchData = async () => {
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
            // Fetch Stats
            const statsRes = await fetch("/api/farmer/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats({
                    totalProducts: Number(statsData.totalProducts) || 0,
                    totalOrders: Number(statsData.totalOrders) || 0,
                    pendingOrders: Number(statsData.pendingOrders) || 0,
                    completedOrders: Number(statsData.completedOrders) || 0,
                    revenue: Number(statsData.revenue) || 0,
                });
            } else if (statsRes.status === 401 || statsRes.status === 403) {
                router.push("/login");
                return;
            }

            // Fetch Recent Orders
            const ordersRes = await fetch("/api/farmer/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (ordersRes.ok) {
                const orders = await ordersRes.json();
                if (Array.isArray(orders)) {
                    setRecentOrders(orders);
                } else {
                    console.warn("Expected orders array, got:", orders);
                    setRecentOrders([]);
                }
            } else if (ordersRes.status === 401 || ordersRes.status === 403) {
                router.push("/login");
                return;
            }


        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("/api/farmer/orders", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, status: newStatus })
            });

            if (res.ok) {
                // Refresh data
                fetchData();
                alert(`Order marked as ${newStatus}`);
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            console.error("Update failed", e);
        }
    };

    const updatePaymentStatus = async (orderId: string, newStatus: string) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("/api/farmer/orders", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ orderId, paymentStatus: newStatus })
            });

            if (res.ok) {
                fetchData();
                alert(`Payment status updated to ${newStatus}`);
            } else {
                alert("Failed to update payment status");
            }
        } catch (e) {
            console.error("Update failed", e);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div>
            <Header />
            <div className="container mx-auto p-6 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Farmer Dashboard</h1>
                    <Button onClick={() => router.push("/farmer/add-product")}>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products Sold</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formattedTotalOrders}</div>
                            <p className="text-xs text-muted-foreground">Products sold to customers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <span className="text-green-600 font-bold">₹</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{formattedRevenue}</div>
                            <p className="text-xs text-muted-foreground">From completed orders</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                            <span className="text-green-600 font-bold">₹</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{formattedRevenue}</div>
                            <p className="text-xs text-muted-foreground">Profit after costs (estimated)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formattedTotalProducts}</div>
                            <Button variant="link" className="px-0 h-auto text-xs" onClick={() => {
                                router.push("/marketplace");
                            }}>
                                View in Marketplace
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sales Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Analytics (Last 7 days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium">View:</label>
                                <Select value={analyticsMode} onValueChange={(value) => setAnalyticsMode(value as any)}>
                                    <SelectTrigger className="h-8 w-40">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7days">Last 7 days</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {analyticsMode === 'daily' && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Date:</label>
                                    <input
                                        type="date"
                                        className="rounded-md border p-2 text-sm"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>
                            )}

                            {analyticsMode === 'monthly' && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Month:</label>
                                    <input
                                        type="month"
                                        className="rounded-md border p-2 text-sm"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                    />
                                </div>
                            )}

                            {analyticsMode === 'yearly' && (
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium">Year:</label>
                                    <input
                                        type="number"
                                        className="w-24 rounded-md border p-2 text-sm"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        min="2000"
                                        max="2099"
                                    />
                                </div>
                            )}
                        </div>

                        {salesData.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">No sales data to display yet.</div>
                        ) : (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis tickFormatter={(v) => `₹${v}`} />
                                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                        <Bar dataKey="sales" fill="#22c55e" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Agri Guidance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Agri Guidance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-lg border border-muted/30 p-4">
                                <h3 className="text-sm font-semibold">Soil Health</h3>
                                <p className="text-xs text-muted-foreground">
                                    Test soil pH regularly and apply organic compost to keep nutrients balanced.
                                </p>
                            </div>
                            <div className="rounded-lg border border-muted/30 p-4">
                                <h3 className="text-sm font-semibold">Water Management</h3>
                                <p className="text-xs text-muted-foreground">
                                    Use drip irrigation and schedule watering for early morning to reduce evaporation.
                                </p>
                            </div>
                            <div className="rounded-lg border border-muted/30 p-4">
                                <h3 className="text-sm font-semibold">Pest Control</h3>
                                <p className="text-xs text-muted-foreground">
                                    Monitor for pests daily and use integrated pest management (IPM) techniques.
                                </p>
                            </div>
                            <div className="rounded-lg border border-muted/30 p-4">
                                <h3 className="text-sm font-semibold">Market Tips</h3>
                                <p className="text-xs text-muted-foreground">
                                    Keep an eye on demand trends and adjust your crop selections accordingly.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Customer Payment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">No orders yet.</div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Customer Name</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product Purchased</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quantity</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Payment Amount</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Payment Method</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Payment Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order Status</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Order Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {recentOrders.flatMap((order) =>
                                            (order.orderItems ?? []).map((item: any, idx: number) => (
                                                <tr key={`${order._id}-${idx}`} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle font-medium">{order.customerId?.name || "Unknown"}</td>
                                                    <td className="p-4 align-middle">{item.productId?.name || "Unknown"}</td>
                                                    <td className="p-4 align-middle">{item.quantity}</td>
                                                    <td className="p-4 align-middle">₹{item.price * item.quantity}</td>
                                                    <td className="p-4 align-middle">{order.paymentMethod}</td>
                                                    <td className="p-4 align-middle">
                                                        <Select
                                                            value={order.paymentStatus || 'pending'}
                                                            onValueChange={(value) => updatePaymentStatus(order._id, value)}
                                                            className="w-40"
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue placeholder={order.paymentStatus || 'pending'} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="paid">Paid</SelectItem>
                                                                <SelectItem value="refunded">Refunded</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Select
                                                            value={order.orderStatus}
                                                            onValueChange={(value) => updateOrderStatus(order._id, value)}
                                                            className="w-40"
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue placeholder={order.orderStatus || "pending"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="shipped">Shipped</SelectItem>
                                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-4 align-middle">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Past Products Sold */}
                <Card>
                    <CardHeader>
                        <CardTitle>Past Products Sold</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">No products sold yet.</div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product Name</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Quantity Sold</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Price</th>
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Profit Earned</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {recentOrders.flatMap((order) =>
                                            (order.orderItems ?? []).map((item: any) => (
                                                <tr key={`${order._id}-${item.productId?._id ?? "unknown"}`} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle font-medium">{item.productId.name}</td>
                                                    <td className="p-4 align-middle">{item.quantity}</td>
                                                    <td className="p-4 align-middle">₹{item.price}</td>
                                                    <td className="p-4 align-middle">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</td>
                                                    <td className="p-4 align-middle text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
