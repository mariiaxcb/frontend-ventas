export interface ProductFormValues {
  code: string;
  name: string;
  price: number | "";
  stock: number | "";
  categoryName: string;
  description: string;
}

export const VALORES_VACIOS: ProductFormValues = {
  code: "",
  name: "",
  price: "",
  stock: "",
  categoryName: "",
  description: "",
};