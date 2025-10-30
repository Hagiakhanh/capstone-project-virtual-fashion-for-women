export interface ProductVariantRequest {
    sizeId: number;
    sizeCode: string;
    variantName: string;
    quantity: number;
    imageUrl: File | null;
    productWeight: number;
    productLength: number;
    productWidth: number;
    productHeight: number;
}

// Backend entities
export interface Category {
    categoryId: number;
    categoryName: string;
    bodyPart?: string;
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

export interface Tag {
    tagId: number;
    tagName: string;
}

export interface ProductColorRequest {
    colorId: number;
    colorName: string;
    colorPrefix: string;
    hexCode: string;
    noBgImgUrl: File | null;
    lensId: string;
    packageLens: string;
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
    existingTagIds: number[];
    newTags: string[];
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