export interface Product {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  image_url: string;
  description?: string;
  category?: string;
  stock_quantity: number;
  min_stock: number;
}
