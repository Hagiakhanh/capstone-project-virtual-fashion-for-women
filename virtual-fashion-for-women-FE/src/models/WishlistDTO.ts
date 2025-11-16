export interface CreateWishlistDTO {
   productId: string;
}

export interface Product {
  productId: string;
  productName: string;
  description: string;
  productSlug: string;
  price: number;
  mainImageUrl: string;
}

export interface Wishlist {
  wishlistId: number;
  userId: number;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface WishlistApiResponse {
  data: Wishlist[];
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}