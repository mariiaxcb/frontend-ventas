export interface FilteredComment {
  user: string;
  nickname: string;
  profilePic: string;
  comment: string;
  date: string;
  fecha?: string;
  uniqueId?: string;
  profilePictureUrl?: string;
  usuario?: string;
  comentario?: string;
}

export interface Category {
  id: number;
  name: string;
  status: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  price: string | number;
  stock: number;
  description: string;
  status: string;
  imageUrl: string;
  categoryId: number;
  category: Category;
}

export interface ActiveStream {
  id: number;
  title: string;
  tiktokUsername: string;
  startDate: string;
  endDate: string | null;
  status: string;
  adminId: number;
  _count?: {
    orders: number;
  };
  products?: Product[];
}