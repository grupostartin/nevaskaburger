export interface Choice {
  id: string;
  label: string;
  price?: number;
}

export interface Option {
  id: string;
  title: string;
  type: 'radio' | 'checkbox';
  required: boolean;
  choices: Choice[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  options: Option[];
}

export interface MenuCategory {
  id: string;
  title: string;
}

export interface CartItemOption {
  optionId: string;
  choiceId: string;
  label: string;
  price?: number;
}

export interface CartItem {
  id: string; // Unique ID for the cart item entry
  productId: string;
  name: string;
  basePrice: number;
  quantity: number;
  options: CartItemOption[];
  observation?: string;
  totalPrice: number;
}
