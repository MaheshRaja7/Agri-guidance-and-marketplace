export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  farmerId: any;
}

const CART_KEY = "cart";

function isCartArray(value: any): value is CartItem[] {
  return Array.isArray(value);
}

function isCartObject(value: any): value is Record<string, number> {
  return value && typeof value === "object" && !Array.isArray(value);
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);

    // Support old format: object mapping productId to quantity
    if (isCartObject(parsed)) {
      return Object.entries(parsed).map(([productId, quantity]) => ({
        productId,
        name: "", // unknown
        price: 0,
        image: "",
        quantity,
        farmerId: null,
      }));
    }

    if (isCartArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore
  }

  return [];
}

export function setCartItems(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  // Notify listeners in the current tab
  window.dispatchEvent(new Event("cart-changed"));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = getCartItems();
  const existing = items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ ...item, quantity });
  }
  setCartItems(items);
  return items;
}

export function updateCartQuantity(productId: string, quantity: number) {
  const items = getCartItems();
  const updated = items.map((item) =>
    item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
  );
  setCartItems(updated);
  return updated;
}

export function removeFromCart(productId: string) {
  const items = getCartItems();
  const updated = items.filter((item) => item.productId !== productId);
  setCartItems(updated);
  return updated;
}

export function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
