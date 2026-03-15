"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Flame, MapPin, Award, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import { addToCart } from "@/lib/cart";

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

export default function MarketplacePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const districts = Array.from(
    new Set(
      products
        .map(p => p.farmerId?.city || (p as any).location || "")
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");

  const [user, setUser] = useState<any>(null);
  const currentUserId = user?.id || user?._id;
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: "",
    unit: "kg",
  });

  useEffect(() => {
    fetchProducts();
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.userType === "customer") {
        // Customer logic if any
      }
      setUser(parsedUser);
    }
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products"); // Public API
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (categoryFilter !== "All") {
      result = result.filter(p => p.category === categoryFilter);
    }

    if (priceFilter !== "All") {
      result = result.filter(p => {
        if (priceFilter === "Under ₹100") return p.price < 100;
        if (priceFilter === "₹100 - ₹500") return p.price >= 100 && p.price <= 500;
        if (priceFilter === "Above ₹500") return p.price > 500;
        return true;
      });
    }

    if (districtFilter !== "All") {
      result = result.filter(p => {
        const district = p.farmerId?.city || (p as any).location || "";
        return district.toLowerCase() === districtFilter.toLowerCase();
      });
    }

    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, priceFilter, districtFilter, products]);

  const addToCartHandler = (product: Product) => {
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      farmerId: product.farmerId,
    });
    alert(`${product.name} added to cart!`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/farmer/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddProductLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await fetch("/api/farmer/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        }),
      });

      if (res.ok) {
        alert("Product added successfully!");
        setIsAddProductOpen(false);
        setNewProduct({
          name: "",
          category: "",
          price: "",
          stock: "",
          description: "",
          image: "",
          unit: "kg",
        });
        fetchProducts(); // Refresh products
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Something went wrong");
    } finally {
      setAddProductLoading(false);
    }
  };

  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewProductCategoryChange = (value: string) => {
    setNewProduct((prev) => ({ ...prev, category: value }));
  };

  const handleNewProductUnitChange = (value: string) => {
    setNewProduct((prev) => ({ ...prev, unit: value }));
  };

  const handleNewProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-800">AgriShield Marketplace</h1>
            <p className="text-muted-foreground">Buy fresh produce directly from farmers</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.userType === "farmer" ? (
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Product Name</Label>
                        <Input id="new-name" name="name" placeholder="e.g. Organic Tomatoes" required onChange={handleNewProductChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-category">Category</Label>
                        <Select onValueChange={handleNewProductCategoryChange} required>
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
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-price">Price (per unit)</Label>
                        <Input id="new-price" name="price" type="number" min="0" step="0.01" placeholder="0.00" required onChange={handleNewProductChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-stock">Stock Quantity</Label>
                        <Input id="new-stock" name="stock" type="number" min="0" placeholder="0" required onChange={handleNewProductChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-unit">Unit</Label>
                        <Select onValueChange={handleNewProductUnitChange} defaultValue="kg">
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
                    <div className="space-y-2">
                      <Label htmlFor="new-description">Description</Label>
                      <Textarea id="new-description" name="description" placeholder="Describe your product..." required onChange={handleNewProductChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-image">Product Image</Label>
                      <Input id="new-image" type="file" accept="image/*" required onChange={handleNewProductImageChange} />
                      {newProduct.image && (
                        <img src={newProduct.image} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-md border" />
                      )}
                    </div>
                    <div className="flex gap-4">
                      <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={addProductLoading}>
                        {addProductLoading ? "Adding..." : "Add Product"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button onClick={() => router.push("/cart")} className="bg-green-600 hover:bg-green-700">
                <ShoppingCart className="mr-2 h-5 w-5" /> View Cart
              </Button>
            )}
          </div>
        </div>

        {/* Featured Sections */}
        {!loading && products.length > 0 && (
          <div className="mb-10 space-y-8">
            
            {/* Farmer of the Week */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="text-yellow-500" /> Farmer of the Week
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {Array.from(new Map(products.filter(p => p.farmerId).map(p => [p.farmerId._id, p.farmerId])).values())
                  .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
                  .slice(0, 3)
                  .map((farmer: any, idx: number) => (
                    <Card key={`fow-${farmer._id}`} className="min-w-[280px] snap-start hover:shadow-md transition-shadow border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-xl border-2 border-yellow-300 relative">
                          {farmer.name.charAt(0)}
                          {idx === 0 && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 shadow-sm">
                              <Award className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{farmer.name}</h3>
                          <p className="text-sm text-yellow-700 font-medium">Top Seller 🌟</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {farmer.city}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </div>

            {/* Trending Crops */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Flame className="text-orange-500" /> Trending Crops
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {products
                  .filter(p => (p as any).sales !== undefined) 
                  .sort((a, b) => ((b as any).sales || 0) - ((a as any).sales || 0))
                  .slice(0, 4)
                  .map(product => (
                    <Card key={`trending-${product._id}`} className="min-w-[280px] snap-start hover:shadow-md transition-shadow">
                      <div className="h-32 w-full relative overflow-hidden rounded-t-lg">
                        <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          Hot 🔥
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-green-700 font-bold">₹{product.price}/{product.unit}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.farmerId?.name}</p>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </div>

            {/* Nearby Farmers (If customer is logged in) */}
            {user?.userType === "customer" && user?.city && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="text-blue-500" /> Fresh from {user.city}
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                  {products
                    .filter(p => p.farmerId?.city?.toLowerCase() === user.city?.toLowerCase())
                    .slice(0, 4)
                    .map(product => (
                      <Card key={`nearby-${product._id}`} className="min-w-[280px] snap-start hover:shadow-md transition-shadow border-blue-100">
                        <div className="flex items-center gap-3 p-3 border-b border-gray-100">
                           <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                             {product.farmerId?.name?.charAt(0) || "F"}
                           </div>
                           <div>
                             <p className="text-sm font-semibold">{product.farmerId?.name}</p>
                             <p className="text-xs text-muted-foreground flex items-center gap-1">
                               <MapPin className="h-3 w-3" /> {product.farmerId?.city}
                             </p>
                           </div>
                        </div>
                        <CardContent className="p-3 flex gap-3 items-center">
                          <img src={product.image} alt={product.name} className="h-16 w-16 rounded object-cover" />
                          <div>
                            <h3 className="font-medium text-sm">{product.name}</h3>
                            <p className="text-sm text-green-700 font-bold">₹{product.price}/{product.unit}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {products.filter(p => p.farmerId?.city?.toLowerCase() === user.city?.toLowerCase()).length === 0 && (
                      <div className="text-sm text-muted-foreground italic w-full p-4 bg-slate-50 rounded-lg">
                        Currently no products available near your location.
                      </div>
                    )}
                </div>
              </div>
            )}
            
            {/* Farmer of the week can be added similarly by sorting farmers based on sales metrics */}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-4 rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fruits, vegetables..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                <SelectItem value="Vegetables">Vegetables</SelectItem>
                <SelectItem value="Fruits">Fruits</SelectItem>
                <SelectItem value="Grains">Grains</SelectItem>
                <SelectItem value="Spices">Spices</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Districts</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48">
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Prices</SelectItem>
                <SelectItem value="Under ₹100">Under ₹100</SelectItem>
                <SelectItem value="₹100 - ₹500">₹100 - ₹500</SelectItem>
                <SelectItem value="Above ₹500">Above ₹500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-20">Loading fresh produce...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No products found matching your criteria.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product._id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                      Out of Stock
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{product.category}</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">₹{product.price}<span className="text-sm font-normal text-muted-foreground">/{product.unit}</span></div>
                  <p className="text-sm font-medium text-green-600 mt-1">Available: {product.stock} {product.unit}</p>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-[40px]">{product.description || "Fresh from the farm."}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                      Farmer: <span className="text-green-700">{product.farmerId?.name || "Unknown Farmer"}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      📍 {product.farmerId?.city || "Location not provided"}
                      {product.farmerId?.rating !== undefined && product.farmerId?.rating > 0 && (
                        <span className="ml-2 text-yellow-500 flex items-center">
                          ⭐ {product.farmerId.rating.toFixed(1)}
                        </span>
                      )}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-green-700 border-green-600 hover:bg-green-50"
                    onClick={() => router.push(`/marketplace/${product._id}`)}
                  >
                    View Details
                  </Button>
                  {user?.userType === "farmer" ? (
                    currentUserId && product.farmerId?._id && currentUserId.toString() === product.farmerId._id.toString() ? (
                      <div className="flex gap-2 w-full">
                         <Button variant="outline" className="flex-1 text-blue-600 border-blue-600 hover:bg-blue-50" onClick={() => router.push(`/farmer/products/${product._id}/edit`)}>Edit</Button>
                         <Button variant="destructive" className="flex-1" onClick={() => handleDeleteProduct(product._id)}>Delete</Button>
                      </div>
                    ) : (
                      <Button className="w-full" disabled variant="secondary">
                        View Only (Farmer)
                      </Button>
                    )
                  ) : (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={product.stock <= 0}
                      onClick={() => addToCartHandler(product)}
                    >
                      {product.stock > 0 ? "Add to Cart" : "Sold Out"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
