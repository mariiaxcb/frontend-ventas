export type EstadoProducto = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export interface Categoria {
  id: string;
  nombre: string;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  imagen?: string;
  categoria?: string; // O Categoria si tu backend retorna el objeto completo
  estado: EstadoProducto;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductoInput {
  nombre: string;
  precio: number;
  stock: number;
  descripcion?: string;
  imagen?: string;
  categoria: string;
  estado?: EstadoProducto;
}