import { MenuCategory, Product } from '../types';

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'burgers', title: 'Burgers' },
  { id: 'combos', title: 'Combos' },
  { id: 'bebidas', title: 'Bebidas' },
  { id: 'sobremesas', title: 'Sobremesas' },
];

export const MENU_ITEMS: Product[] = [
  // Burgers
  {
    id: 'b1',
    categoryId: 'burgers',
    name: 'Smash Clássico',
    description: 'Blend 150g, queijo americano, picles, mostarda e ketchup artesanal',
    price: 19.90,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800&h=600',
    options: [
      {
        id: 'retirar',
        title: 'Ingredientes para retirar',
        type: 'checkbox',
        required: false,
        choices: [
          { id: 's-cebola', label: 'Sem cebola' },
          { id: 's-tomate', label: 'Sem tomate' },
          { id: 's-picles', label: 'Sem picles' }
        ]
      },
      {
        id: 'adicionais',
        title: 'Turbine seu burger',
        type: 'checkbox',
        required: false,
        choices: [
          { id: 'bacon', label: 'Bacon', price: 4.00 },
          { id: 'ovo', label: 'Ovo', price: 3.00 },
          { id: 'queijo', label: 'Queijo extra', price: 3.00 }
        ]
      }
    ]
  },
  {
    id: 'b2',
    categoryId: 'burgers',
    name: 'Nevaska Signature',
    description: 'Blend 180g duplo, cheddar derretido, bacon crispy, cebola caramelizada, molho trufado',
    price: 29.90,
    imageUrl: 'https://images.unsplash.com/photo-1594212202875-86ac12cf7579?auto=format&fit=crop&q=80&w=800&h=600',
    options: [
      {
        id: 'retirar',
        title: 'Ingredientes para retirar',
        type: 'checkbox',
        required: false,
        choices: [
          { id: 's-cebola', label: 'Sem cebola' },
          { id: 's-bacon', label: 'Sem bacon' }
        ]
      }
    ]
  },
  {
    id: 'b3',
    categoryId: 'burgers',
    name: 'Frango Crocante',
    description: 'Filé de frango empanado, alface, tomate, maionese de ervas',
    price: 22.90,
    imageUrl: 'https://images.unsplash.com/photo-1615719413546-198b25453f85?auto=format&fit=crop&q=80&w=800&h=600',
    options: [
      {
        id: 'retirar',
        title: 'Ingredientes para retirar',
        type: 'checkbox',
        required: false,
        choices: [
          { id: 's-tomate', label: 'Sem tomate' },
          { id: 's-alface', label: 'Sem alface' }
        ]
      }
    ]
  },
  {
    id: 'b4',
    categoryId: 'burgers',
    name: 'Veggie Smash',
    description: 'Blend de grão-de-bico, queijo vegano, tomate seco, rúcula',
    price: 24.90,
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800&h=600',
    options: []
  },
  
  // Combos
  {
    id: 'c1',
    categoryId: 'combos',
    name: 'Combo Clássico',
    description: 'Smash Clássico + Fritas P + Refri Lata',
    price: 31.90,
    imageUrl: 'https://images.unsplash.com/photo-1555507034-75db280267eb?auto=format&fit=crop&q=80&w=800&h=600',
    options: [
      {
        id: 'tamanho-fritas',
        title: 'Tamanho da porção',
        type: 'radio',
        required: true,
        choices: [
          { id: 'p', label: 'Fritas P' },
          { id: 'm', label: 'Fritas M', price: 4.00 },
          { id: 'g', label: 'Fritas G', price: 8.00 }
        ]
      },
      {
        id: 'bebida',
        title: 'Sua bebida',
        type: 'radio',
        required: true,
        choices: [
          { id: 'coca', label: 'Coca-Cola' },
          { id: 'guarana', label: 'Guaraná' },
          { id: 'agua', label: 'Água' }
        ]
      }
    ]
  },
  {
    id: 'c2',
    categoryId: 'combos',
    name: 'Combo Signature',
    description: 'Nevaska Signature + Fritas M + Refri Lata',
    price: 42.90,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-811cce3b9d62?auto=format&fit=crop&q=80&w=800&h=600',
    options: [
      {
        id: 'bebida',
        title: 'Sua bebida',
        type: 'radio',
        required: true,
        choices: [
          { id: 'coca', label: 'Coca-Cola' },
          { id: 'guarana', label: 'Guaraná' },
          { id: 'agua', label: 'Água' }
        ]
      }
    ]
  },
  {
    id: 'c3',
    categoryId: 'combos',
    name: 'Combo Família',
    description: '2 Burgers à escolha + 2 Fritas M + 2 Refris',
    price: 79.90,
    imageUrl: 'https://images.unsplash.com/photo-1594992523292-1da1c0627572?auto=format&fit=crop&q=80&w=800&h=600',
    options: [
      {
        id: 'burger1',
        title: 'Escolha o Burger 1',
        type: 'radio',
        required: true,
        choices: [
          { id: 'smash', label: 'Smash Clássico' },
          { id: 'frango', label: 'Frango Crocante' },
          { id: 'veggie', label: 'Veggie Smash' }
        ]
      },
      {
        id: 'burger2',
        title: 'Escolha o Burger 2',
        type: 'radio',
        required: true,
        choices: [
          { id: 'smash', label: 'Smash Clássico' },
          { id: 'frango', label: 'Frango Crocante' },
          { id: 'veggie', label: 'Veggie Smash' }
        ]
      }
    ]
  },

  // Bebidas
  {
    id: 'd1',
    categoryId: 'bebidas',
    name: 'Coca-Cola Lata',
    description: '350ml',
    price: 7.00,
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800&h=600',
    options: []
  },
  {
    id: 'd2',
    categoryId: 'bebidas',
    name: 'Água sem gás',
    description: '500ml',
    price: 4.00,
    imageUrl: 'https://images.unsplash.com/photo-1559839914-11aeba01844b?auto=format&fit=crop&q=80&w=800&h=600',
    options: []
  },
  {
    id: 'd3',
    categoryId: 'bebidas',
    name: 'Suco de Laranja Natural',
    description: '400ml',
    price: 9.00,
    imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800&h=600',
    options: []
  },
  {
    id: 'd4',
    categoryId: 'bebidas',
    name: 'Milkshake Baunilha',
    description: '500ml com chantilly',
    price: 16.00,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800&h=600',
    options: []
  },
  {
    id: 'd5',
    categoryId: 'bebidas',
    name: 'Milkshake Chocolate',
    description: '500ml com chantilly e calda de chocolate',
    price: 16.00,
    imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=800&h=600',
    options: []
  },

  // Sobremesas
  {
    id: 's1',
    categoryId: 'sobremesas',
    name: 'Brownie com Sorvete',
    description: 'Brownie de chocolate recheado quente com bola de sorvete de creme',
    price: 14.90,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800&h=600',
    options: []
  },
  {
    id: 's2',
    categoryId: 'sobremesas',
    name: 'Churros com Doce de Leite',
    description: 'Porção com 4 unidades de mini churros e potinho de doce de leite',
    price: 11.90,
    imageUrl: 'https://images.unsplash.com/photo-1624371414361-e670eadad88a?auto=format&fit=crop&q=80&w=800&h=600',
    options: []
  }
];
