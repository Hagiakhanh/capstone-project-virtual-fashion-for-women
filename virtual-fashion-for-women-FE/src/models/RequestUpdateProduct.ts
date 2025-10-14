export interface Product {
    productId: string;
    productName: string;
    description: string;
    price: number;
    mainImageUrl: string;
    categoryId: number;
    productColors?: ProductColor[];
    tags?: Tag[];
}

export interface Tag {
    tagId: number;
    tagName: string;
}

export interface TagDto {
    tagId?: number;  // Có tagId nghĩa là tag có sẵn
    tagName: string; // Không có tagId nghĩa là tag mới
}

export interface ProductColor {
    productColorId: string;
    productId: string;
    colorId: number;
    color?: Color;
    noBgImgUrl: string;
    lensId?: string;
    productImages: ProductImage[];
    productVariants: ProductVariant[];
}

export interface ProductVariant {
    productVariantId: string;
    productColorId: string;
    sizeId: number;
    size?: Size;
    variantName: string;
    quantity: number;
    imageUrl: string;
    status: string;
    productWeight?: number;
    productLength?: number;
    productWidth?: number;
    productHeight?: number;
    productImagesDto?: ProductImage[];
}

export interface ProductImage {
    productImageId?: number;
    productColorId: string;
    imageUrl: string;
}

export interface Color {
    colorId: number;
    colorName: string;
    colorPrefix: string;
    hexCode: string;
}

export interface Size {
    sizeId: number;
    sizeCode: string;
}

export interface Category {
    categoryId: number;
    categoryName: string;
}

// Form data types
export interface UpdateProductFormData {
    productName?: string;
    description?: string;
    price?: number;
    mainImageUrl?: File;
    categoryId?: number;
    productColor?: UpdateProductColorFormData[];
    tags?: TagDto[];
}

export interface UpdateProductColorFormData {
    productColorId?: string;
    colorId?: number;
    noBgImgUrl?: File;
    noBgImgPreview?: string;
    lensId?: string;
    productVariantImages?: File[];
    productVariantImagePreviews?: string[];
    variants?: UpdateProductVariantFormData[];
    // For creating new color
    colorName?: string;
    colorPrefix?: string;
    hexCode?: string;
}

export interface UpdateProductVariantFormData {
    productVariantId?: string;
    sizeId?: number;
    variantName?: string;
    quantity?: number;
    imageUrl?: File;
    imagePreview?: string;
    status?: string;
    productWeight?: number;
    productLength?: number;
    productWidth?: number;
    productHeight?: number;
    // For creating new size
    sizeCode?: string;
}