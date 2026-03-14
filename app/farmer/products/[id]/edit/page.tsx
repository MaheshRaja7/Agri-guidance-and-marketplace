"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: "", // We will store base64 or URL
    unit: "kg",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            name: data.name || "",
            category: data.category || "",
            price: data.price?.toString() || "",
            stock: data.stock?.toString() || "",
            description: data.description || "",
            image: data.image || "",
            unit: data.unit || "kg",
          });
        } else {
          alert("Product not found");
          router.push("/marketplace");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setFetching(false);
      }
    };
    
    if (productId) fetchProduct();
  }, [productId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleUnitChange = (value: string) => {
    setFormData((prev) => ({ ...prev, unit: value }));
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        router.push("/login"); // Redirect to login
        return;
      }

      const res = await fetch(`/api/farmer/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock)
        }),
      });

      if (res.ok) {
        alert("Product updated successfully!");
        router.push("/marketplace");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
     return (
       <div>
         <Header />
         <div className="flex justify-center items-center h-[50vh]">Loading...</div>
       </div>
     );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" value={formData.name} placeholder="e.g. Organic Tomatoes" required onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Grains">Grains</SelectItem>
                      <SelectItem value="Spices">Spices</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={handleUnitChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="g">Gram</SelectItem>
                      <SelectItem value="pc">Piece</SelectItem>
                      <SelectItem value="bunch">Bunch</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (per unit)</Label>
                  <Input id="price" name="price" value={formData.price} type="number" min="0" step="0.01" placeholder="0.00" required onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" name="stock" value={formData.stock} type="number" min="0" placeholder="0" required onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} placeholder="Describe your product..." required onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image (optional update)</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-md border" />
                )}
              </div>

              <div className="flex gap-4">
                 <Button type="button" variant="outline" className="w-1/3" onClick={() => router.push("/marketplace")}>Cancel</Button>
                 <Button type="submit" className="w-2/3" disabled={loading}>
                   {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Product"}
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
