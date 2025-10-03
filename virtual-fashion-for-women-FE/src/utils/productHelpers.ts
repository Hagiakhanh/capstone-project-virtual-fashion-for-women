// src/utils/productHelpers.ts

import { CreateProductFormData } from "@/models/RequestCreateProduct";

/**
 * Convert form data to FormData object for API submission
 */
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

    // Product colors and variants
    formData.productColor.forEach((color, colorIndex) => {
        if (color.colorId !== undefined) {
            formDataToSend.append(
            `ProductColor[${colorIndex}].ColorId`,
            color.colorId.toString()
            );
        }
        if (color.colorName !== undefined) {
            formDataToSend.append(
            `ProductColor[${colorIndex}].ColorName`,
            color.colorName
            );
        }
        if (color.colorPrefix !== undefined) {
            formDataToSend.append(
            `ProductColor[${colorIndex}].ColorPrefix`,
            color.colorPrefix
            );
        }
        if (color.hexCode !== undefined) {
            formDataToSend.append(
            `ProductColor[${colorIndex}].HexCode`,
            color.hexCode
            );
        }
        if (color.lensId !== undefined) {
            formDataToSend.append(
            `ProductColor[${colorIndex}].LensId`,
            color.lensId
            );
        }

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
            if (variant.sizeId !== undefined) {
                formDataToSend.append(
                    `ProductColor[${colorIndex}].Variants[${variantIndex}].SizeId`,
                    variant.sizeId.toString()
                );
            }
            if (variant.sizeCode !== undefined) {
                formDataToSend.append(
                    `ProductColor[${colorIndex}].Variants[${variantIndex}].SizeCode`,
                    variant.sizeCode
                );
            }

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
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.productName.trim()) {
        errors.push("Tên sản phẩm không được để trống");
    }

    if (!formData.description.trim()) {
        errors.push("Mô tả không được để trống");
    }

    if (formData.price <= 0) {
        errors.push("Giá sản phẩm phải lớn hơn 0");
    }

    if (!formData.mainImageUrl) {
        errors.push("Vui lòng chọn ảnh chính cho sản phẩm");
    }

    if (formData.productColor.length === 0) {
        errors.push("Sản phẩm phải có ít nhất một màu");
    }

    formData.productColor.forEach((color, index) => {
    // Nếu colorId = 0 (thêm mới màu) thì bắt buộc nhập thông tin
        if (color.colorId === 0 || color.colorId === undefined) {
            if (!color.colorName || !color.colorName.trim()) {
            errors.push(`Màu ${index + 1}: Tên màu không được để trống`);
            }
            if (!color.colorPrefix || !color.colorPrefix.trim()) {
            errors.push(`Màu ${index + 1}: Mã màu không được để trống`);
            }
            if (!color.hexCode || !color.hexCode.trim()) {
            errors.push(`Màu ${index + 1}: Hex code không được để trống`);
            }
        }

        if (!color.noBgImgUrl) {
            errors.push(`Màu ${index + 1}: Vui lòng chọn ảnh không nền`);
        }

        if (!color.variants || color.variants.length === 0) {
            errors.push(`Màu ${index + 1}: Phải có ít nhất một biến thể (size)`);
        }

        color.variants.forEach((variant, vIndex) => {
            if ((variant.sizeId === 0 || variant.sizeId === undefined) &&
                (!variant.sizeCode || !variant.sizeCode.trim())) {
            errors.push(
                `Màu ${index + 1}, Size ${vIndex + 1}: Mã size không được để trống`
            );
            }

            if (!variant.variantName || !variant.variantName.trim()) {
            errors.push(
                `Màu ${index + 1}, Size ${vIndex + 1}: Tên biến thể không được để trống`
            );
            }

            if (variant.quantity === undefined || variant.quantity < 0) {
            errors.push(
                `Màu ${index + 1}, Size ${vIndex + 1}: Số lượng không được âm`
            );
            }

            if (!variant.imageUrl) {
            errors.push(
                `Màu ${index + 1}, Size ${vIndex + 1}: Vui lòng chọn ảnh cho biến thể`
            );
            }
        });
    });

    return {
        isValid: errors.length === 0,
        errors,
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
    };
}