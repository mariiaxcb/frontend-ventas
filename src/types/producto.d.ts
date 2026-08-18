export type EstadoProducto = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Producto {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  categoryName?: string;
  estado?: EstadoProducto;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductoInput {
  name: string;
  price: number;
  stock: number;
  categoryName: string;
  description?: string;
  image?: File | null;
  estado?: EstadoProducto;
}