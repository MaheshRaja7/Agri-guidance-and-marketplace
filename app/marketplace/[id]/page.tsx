"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Edit, Trash, MapPin, Star } from "lucide-react";
import Header from "@/components/Header";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  unit: string;
  farmerId: {
    _id: string;
    name: string;
    city: string;
    rating: number;
  };
  description: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchProduct();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      } else {
        alert("Product not found");
        router.push("/marketplace");
      }
    } catch (error) {
      console.error("Failed to fetch product", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.productId === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        farmerId: product.farmerId
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/farmer/products/${product?._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Product deleted");
        router.push("/marketplace");
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  const isOwner = user?.userType === "farmer" && user?.id === product.farmerId._id;

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-lg text-muted-foreground">{product.category}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-green-600">₹{product.price}</span>
              <span className="text-muted-foreground">per {product.unit}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm">
                <strong>Available Stock:</strong> {product.stock} {product.unit}
              </p>
              <p className="text-sm">
                <strong>Description:</strong> {product.description}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Farmer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Name:</strong> {product.farmerId.name}</p>
                <p><strong>Location:</strong> {product.farmerId.city}</p>
                {product.farmerId.rating && (
                  <p className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <strong>Rating:</strong> {product.farmerId.rating.toFixed(1)}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              {user?.userType === "farmer" ? (
                isOwner ? (
                  <>
                    <Button onClick={() => router.push(`/farmer/products/${product._id}/edit`)} className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Product
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} className="flex-1">
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Product
                    </Button>
                  </>
                ) : (
                  <Button disabled className="w-full">View Only</Button>
                )
              ) : (
                <Button
                  onClick={addToCart}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}