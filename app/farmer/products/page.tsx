"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash } from "lucide-react";
import Header from "@/components/Header";

interface Product {
    _id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    unit: string;
}

export default function FarmerProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const res = await fetch("/api/farmer/products", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div>
            <Header />
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">My Products</h1>
                    <Button onClick={() => router.push("/farmer/add-product")}>
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border rounded-lg bg-slate-50">
                        <p>You haven't added any products yet.</p>
                        <Button variant="link" onClick={() => router.push("/farmer/add-product")}>Add your first product</Button>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <Card key={product._id} className="overflow-hidden">
                                <div className="aspect-square relative">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{product.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{product.category}</p>
                                        </div>
                                        <span className="font-bold text-green-600">₹{product.price}/{product.unit}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm">
                                        Stock: <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                                            {product.stock} {product.unit}
                                        </span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                        <Trash className="h-4 w-4 mr-2" /> Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
