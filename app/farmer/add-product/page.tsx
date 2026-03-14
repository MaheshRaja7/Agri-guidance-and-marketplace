"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: "", // We will store base64 or URL
    unit: "kg",
  });

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

  // Handle image upload (convert to Base64 for simplicity in this demo)
  // Ideally, upload to Cloudinary or AWS S3
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

      const res = await fetch("/api/farmer/products", {
        method: "POST",
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
        alert("Product added successfully!");
        router.push("/farmer/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" placeholder="e.g. Organic Tomatoes" required onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={handleCategoryChange} required>
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
                  <Select onValueChange={handleUnitChange} defaultValue="kg">
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
                  <Input id="price" name="price" type="number" min="0" step="0.01" placeholder="0.00" required onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" name="stock" type="number" min="0" placeholder="0" required onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Describe your product..." required onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <Input id="image" type="file" accept="image/*" required onChange={handleImageChange} />
                {formData.image && (
                  <img src={formData.image} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-md border" />
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Product...</> : "Add Product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
