import { CreateProductFormData } from "@/models/RequestCreateProduct";
import { Product, UpdateProductColorFormData, TagDto } from '@/models/RequestUpdateProduct';
/**
 * Convert form data to FormData object for API submission
 */
export interface ValidationErrors {
    productName?: string;
    description?: string;
    price?: string;
    mainImageUrl?: string;
    categoryId?: string;
    tags?: string; // Lỗi chung cho cả mục Tag
    productColorGeneral?: string; // Lỗi chung (ví dụ: 'phải có ít nhất 1 màu')
    productColor?: (ProductColorError | null)[];
}

export interface ProductColorError {
    colorId?: string;       // Lỗi cho dropdown (nếu chọn "Tạo mới" mà không nhập)
    colorName?: string;     // Lỗi cho modal tạo màu mới
    colorPrefix?: string;
    hexCode?: string;
    packageLens?: string;
    // noBgImgUrl?: string; // Tùy chọn, nếu bạn muốn bắt buộc
    productVariantImages?: string; // Lỗi cho upload nhiều ảnh
    variantsError?: string; // Lỗi chung (ví dụ: 'phải có ít nhất 1 size')
    variants?: (VariantError | null)[];
}

export interface VariantError {
    variantName?: string;
    sizeId?: string;
    quantity?: string;
    imageUrl?: string;
    clothesLength?: string;
}

export function convertToFormData(formData: CreateProductFormData): FormData {
    const formDataToSend = new FormData();

    // Basic fields
    formDataToSend.append("ProductName", formData.productName);
    formDataToSend.append("Description", formData.description);
    formDataToSend.append("Price", formData.price.toString());
    formDataToSend.append("CategoryId", formData.categoryId.toString());

    if (formData.mainImageUrl) {
        formDataToSend.append("MainImageUrl", formData.mainImageUrl);
    }

    // Tags - Existing tags
    if (formData.existingTagIds && formData.existingTagIds.length > 0) {
        formData.existingTagIds.forEach((tagId, index) => {
            formDataToSend.append(`ExistingTagIds[${index}]`, tagId.toString());
        });
    }

    // Tags - New tags
    if (formData.newTags && formData.newTags.length > 0) {
        formData.newTags.forEach((tagName, index) => {
            formDataToSend.append(`NewTags[${index}]`, tagName.trim());
        });
    }

    // Product colors and variants
    formData.productColor.forEach((color, colorIndex) => {
        formDataToSend.append(
            `ProductColor[${colorIndex}].ColorId`,
            color.colorId.toString()
        );
        formDataToSend.append(
            `ProductColor[${colorIndex}].ColorName`,
            color.colorName
        );
        formDataToSend.append(
            `ProductColor[${colorIndex}].ColorPrefix`,
            color.colorPrefix
        );
        formDataToSend.append(
            `ProductColor[${colorIndex}].HexCode`,
            color.hexCode
        );
        formDataToSend.append(
            `ProductColor[${colorIndex}].LensId`,
            color.lensId || ""
        );
        formDataToSend.append(
            `ProductColor[${colorIndex}].PackageLens`,
            color.packageLens || ""
        );

        if (color.noBgImgUrl) {
        formDataToSend.append(
            `ProductColor[${colorIndex}].NoBgImgUrl`,
            color.noBgImgUrl
        );
        }

        // Multiple images
        color.productVariantImages.forEach((img) => {
        formDataToSend.append(
            `ProductColor[${colorIndex}].ProductVariantImages`,
            img
        );
        });

        // Variants
        color.variants.forEach((variant, variantIndex) => {
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].SizeId`,
                variant.sizeId.toString()
            );
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].SizeCode`,
                variant.sizeCode
            );
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].VariantName`,
                variant.variantName
            );
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].Quantity`,
                variant.quantity.toString()
            );
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].ProductWeight`,
                variant.productWeight.toString()
            );
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].ProductLength`,
                variant.productLength.toString()
            );
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].ProductWidth`,
                variant.productWidth.toString()
            );
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].ProductHeight`,
                variant.productHeight.toString()
            );
            formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].ClothesLength`,
                variant.clothesLength.toString()
            );

            if (variant.imageUrl) {
                formDataToSend.append(
                `ProductColor[${colorIndex}].Variants[${variantIndex}].ImageUrl`,
                variant.imageUrl
                );
            }
        });
    });

    return formDataToSend;
}

/**
 * Validate product form data
 */
export function validateProductForm(
    formData: CreateProductFormData
): { isValid: boolean; errors: ValidationErrors } { // <-- Trả về object lỗi

    const errors: ValidationErrors = {}; // <-- Khởi tạo object lỗi
    let isValid = true;

    if (!formData.productName.trim()) {
        errors.productName = "Tên sản phẩm không được để trống";
        isValid = false;
    }

    if (!formData.description.trim()) {
        errors.description = "Mô tả không được để trống";
        isValid = false;
    }

    if (formData.price <= 0) {
        errors.price = "Giá sản phẩm phải lớn hơn 0";
        isValid = false;
    }

    if (!formData.mainImageUrl) {
        errors.mainImageUrl = "Vui lòng chọn ảnh chính cho sản phẩm";
        isValid = false;
    }

    if (formData.categoryId === 0) {
        errors.categoryId = "Vui lòng chọn danh mục";
        isValid = false;
    }

    // Thêm validation cho tags (bạn chưa có)
    if (formData.existingTagIds.length === 0 && formData.newTags.length === 0) {
        errors.tags = "Vui lòng chọn hoặc thêm ít nhất một tag";
        isValid = false;
    }

    // Validate new tags (nếu bạn vẫn muốn giữ)
    if (formData.newTags && formData.newTags.length > 0) {
        formData.newTags.forEach((tag, index) => {
            if (!tag.trim()) {
                // Lỗi này khó hiển thị inline, có thể gộp chung vào errors.tags
                errors.tags = (errors.tags || "") + ` Tag mới '${tag}' không hợp lệ.`;
                isValid = false;
            }
        });
    }

    // === Validate Product Colors ===
    if (formData.productColor.length === 0) {
        errors.productColorGeneral = "Sản phẩm phải có ít nhất một màu";
        isValid = false;
    } else {
        errors.productColor = formData.productColor.map((color, index) => {
            const colorError: ProductColorError = {};
            let hasColorError = false;

            // Nếu tạo màu mới (colorId = 0) thì phải nhập đủ thông tin
            if (color.colorId === 0) {
                if (!color.colorName.trim()) {
                    colorError.colorName = "Tên màu không được để trống";
                    hasColorError = true;
                }
                if (!color.colorPrefix.trim()) {
                    colorError.colorPrefix = "Mã màu không được để trống";
                    hasColorError = true;
                }
                if (!color.hexCode.trim() || color.hexCode.length !== 7) {
                    colorError.hexCode = "Mã Hex code không hợp lệ";
                    hasColorError = true;
                }
            }

            if (color.lensId && !color.packageLens) {
                colorError.packageLens = "Phải nhập PackageLens khi đã có LensID.";
                hasColorError = true;
            }

            // Thêm validation cho "nhiều ảnh" (bạn chưa có)
            if (!color.productVariantImages || color.productVariantImages.length === 0) {
                colorError.productVariantImages = "Vui lòng tải lên ít nhất 1 ảnh biến thể";
                hasColorError = true;
            }
            
            // === Validate Variants ===
            if (color.variants.length === 0) {
                colorError.variantsError = "Phải có ít nhất một biến thể (size)";
                hasColorError = true;
            } else {
                colorError.variants = color.variants.map((variant, vIndex) => {
                    const variantError: VariantError = {};
                    let hasVariantError = false;

                    // Yêu cầu chọn 1 size
                    if (variant.sizeId === 0) {
                        variantError.sizeId = "Vui lòng chọn size";
                        hasVariantError = true;
                    }

                    if (!variant.variantName.trim()) {
                        variantError.variantName = "Tên biến thể không được để trống";
                        hasVariantError = true;
                    }

                    // Số lượng nên > 0
                    if (variant.quantity <= 0) { 
                        variantError.quantity = "Số lượng phải lớn hơn 0";
                        hasVariantError = true;
                    }

                    if (variant.clothesLength <= 0) { 
                        variantError.clothesLength = "Dài áo/quần phải lớn hơn 0";
                        hasVariantError = true;
                    }

                    if (!variant.imageUrl) {
                        variantError.imageUrl = "Vui lòng chọn ảnh cho biến thể";
                        hasVariantError = true;
                    }

                    if (hasVariantError) isValid = false;
                    return hasVariantError ? variantError : null;
                });
            }

            if (hasColorError) isValid = false;
            return hasColorError ? colorError : null;
        });
    }

    return {
        isValid,
        errors, // Trả về object lỗi
    };
}

/**
 * Create initial empty product color
 */
export function createEmptyProductColor() {
    return {
        colorId: 0,
        colorName: "",
        colorPrefix: "",
        hexCode: "#ffffff",
        noBgImgUrl: null,
        lensId: "",
        packageLens: "",
        productVariantImages: [],
        variants: [],
    };
}

/**
 * Create initial empty variant
 */
export function createEmptyVariant() {
    return {
        sizeId: 0,
        sizeCode: "",
        variantName: "",
        quantity: 0,
        imageUrl: null,
        productWeight: 0.1,
        productLength: 15,
        productWidth: 10,
        productHeight: 0.2,
        clothesLength: 50,
    };
}

/**
 * Helper function to append array items to FormData with proper indexing
 */
export const appendArrayToFormData = (
    formData: FormData,
    arrayName: string,
    items: any[],
    fieldMapping?: Record<string, string>
) => {
    items.forEach((item, index) => {
        Object.entries(item).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                const fieldName = fieldMapping?.[key] || key;
                const formKey = `${arrayName}[${index}].${fieldName}`;
                
                if (value instanceof File) {
                    formData.append(formKey, value);
                } else if (Array.isArray(value)) {
                    value.forEach((v) => {
                        if (v instanceof File) {
                            formData.append(formKey, v);
                        } else {
                            formData.append(formKey, v.toString());
                        }
                    });
                } else {
                    formData.append(formKey, value.toString());
                }
            }
        });
    });
};

/**
 * Helper to create FormData from an object, handling nested structures
 */
export const objectToFormData = (
    obj: Record<string, any>,
    formData = new FormData(),
    parentKey = ''
): FormData => {
    Object.entries(obj).forEach(([key, value]) => {
        const formKey = parentKey ? `${parentKey}.${key}` : key;
        
        if (value === undefined || value === null) {
            return;
        }
        
        if (value instanceof File) {
            formData.append(formKey, value);
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (item instanceof File) {
                    formData.append(`${formKey}[${index}]`, item);
                } else if (typeof item === 'object' && item !== null) {
                    objectToFormData(item, formData, `${formKey}[${index}]`);
                } else if (item !== undefined && item !== null) {
                    formData.append(`${formKey}[${index}]`, item.toString());
                }
            });
        } else if (typeof value === 'object' && !(value instanceof Blob)) {
            objectToFormData(value, formData, formKey);
        } else {
            formData.append(formKey, value.toString());
        }
    });
  
    return formData;
};

/**
 * Validate file size and type
 */
export const validateFile = (
    file: File,
    maxSizeMB = 5,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
): { valid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
          valid: false,
          error: `File size exceeds ${maxSizeMB}MB`,
        };
    }
    
    return { valid: true };
};

/**
 * Preview image file
 */
export const getImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function convertUpdateToFormData(
    product: Product | null,
    productName: string,
    description: string,
    price: number | '',
    categoryId: number | '',
    mainImageFile: File | null,
    productColors: UpdateProductColorFormData[],
    tags: TagDto[]
): FormData {
    const formData = new FormData();

    // Add basic fields only if they changed
    if (productName !== product?.productName) {
        formData.append('ProductName', productName);
    }
    if (description !== product?.description) {
        formData.append('Description', description);
    }
    if (price !== '' && price !== product?.price) {
        formData.append('Price', price.toString());
    }
    if (categoryId !== '' && categoryId !== product?.categoryId) {
        formData.append('CategoryId', categoryId.toString());
    }
    if (mainImageFile) {
        formData.append('MainImageUrl', mainImageFile);
    }

    // Add tags
    if (tags && tags.length > 0) {
        tags.forEach((tag, index) => {
            if (tag.tagId !== undefined && tag.tagId !== null) {
                // Tag có sẵn
                formData.append(`Tags[${index}].TagId`, tag.tagId.toString());
            }
            // Luôn append TagName (cho cả tag có sẵn và tag mới)
            formData.append(`Tags[${index}].TagName`, tag.tagName);
        });
    }

    // Add product colors
    productColors.forEach((pc, i) => {
        if (pc.productColorId) {
            formData.append(`ProductColor[${i}].ProductColorId`, pc.productColorId);
        }

        // Use existing color or create new one
        if (pc.colorId && pc.colorId > 0) {
            formData.append(`ProductColor[${i}].ColorId`, pc.colorId.toString());
        } else if (pc.colorPrefix) {
            formData.append(`ProductColor[${i}].ColorPrefix`, pc.colorPrefix);
        if (pc.colorName) formData.append(`ProductColor[${i}].ColorName`, pc.colorName);
        if (pc.hexCode) formData.append(`ProductColor[${i}].HexCode`, pc.hexCode);
        }

        if (pc.noBgImgUrl) {
            formData.append(`ProductColor[${i}].NoBgImgUrl`, pc.noBgImgUrl);
        }
        if (pc.lensId) {
            formData.append(`ProductColor[${i}].LensId`, pc.lensId);
        }
        if (pc.packageLens) {
            formData.append(`ProductColor[${i}].PackageLens`, pc.packageLens);
        }

        // Add variant images
        pc.productVariantImages?.forEach((img) => {
            formData.append(`ProductColor[${i}].ProductVariantImages`, img);
        });

        // Add variants
        pc.variants?.forEach((v, j) => {
            if (v.productVariantId) {
                formData.append(`ProductColor[${i}].Variants[${j}].ProductVariantId`, v.productVariantId);
            }

            // Use existing size or create new one
            if (v.sizeId && v.sizeId > 0) {
                formData.append(`ProductColor[${i}].Variants[${j}].SizeId`, v.sizeId.toString());
            } else if (v.sizeCode) {
                formData.append(`ProductColor[${i}].Variants[${j}].SizeCode`, v.sizeCode);
            }

            if (v.variantName) {
                formData.append(`ProductColor[${i}].Variants[${j}].VariantName`, v.variantName);
            }
            if (v.quantity !== undefined) {
                formData.append(`ProductColor[${i}].Variants[${j}].Quantity`, v.quantity.toString());
            }
            if (v.imageUrl) {
                formData.append(`ProductColor[${i}].Variants[${j}].ImageUrl`, v.imageUrl);
            }
            if (v.status) {
                formData.append(`ProductColor[${i}].Variants[${j}].Status`, v.status);
            }
            if (v.productWeight !== undefined) {
                formData.append(`ProductColor[${i}].Variants[${j}].ProductWeight`, v.productWeight.toString());
            }
            if (v.productLength !== undefined) {
                formData.append(`ProductColor[${i}].Variants[${j}].ProductLength`, v.productLength.toString());
            }
            if (v.productWidth !== undefined) {
                formData.append(`ProductColor[${i}].Variants[${j}].ProductWidth`, v.productWidth.toString());
            }
            if (v.productHeight !== undefined) {
                formData.append(`ProductColor[${i}].Variants[${j}].ProductHeight`, v.productHeight.toString());
            }
            if (v.clothesLength !== undefined) {
                formData.append(`ProductColor[${i}].Variants[${j}].ClothesLength`, v.clothesLength.toString());
            }
        });
    });

    return formData;
}