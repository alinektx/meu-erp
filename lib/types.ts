export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  image?: string;
  active: boolean;
  trackInventory: boolean;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
}
