// src/models/ProductDTO.ts hoặc src/types/product.ts

export interface ProductVariantRequest {
  sizeId?: number;
  sizeCode?: string;
  variantName: string;
  quantity: number;
  imageUrl: File | null;
  productWeight: number;
  productLength: number;
  productWidth: number;
  productHeight: number;
}

export interface ProductColorRequest {
  colorId?: number;
  colorName?: string;
  colorPrefix?: string;
  hexCode?: string;
  noBgImgUrl: File | null;
  lensId?: string;
  productVariantImages: File[];
  variants: ProductVariantRequest[];
}

export interface CreateProductFormData {
  productName: string;
  description: string;
  price: number;
  mainImageUrl: File | null;
  categoryId: number;
  productColor: ProductColorRequest[];
}

export interface ApiResponse<T> {
  message: string;
  statusCode: number;
  data?: T;
}

export interface Product {
  productId: string;
  productName: string;
  productSlug: string;
  description: string;
  mainImageUrl: string;
  price: number;
  categoryId: number;
  createdAt: string;
}