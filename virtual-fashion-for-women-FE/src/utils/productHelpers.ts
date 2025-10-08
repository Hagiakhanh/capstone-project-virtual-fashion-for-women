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

    if (formData.categoryId === 0) {
        errors.push("Vui lòng chọn danh mục");
    }

    formData.productColor.forEach((color, index) => {
        // Nếu tạo màu mới (colorId = 0) thì phải nhập đủ thông tin
        if (color.colorId === 0) {
        if (!color.colorName.trim()) {
            errors.push(`Màu ${index + 1}: Tên màu không được để trống`);
        }
        if (!color.colorPrefix.trim()) {
            errors.push(`Màu ${index + 1}: Mã màu không được để trống`);
        }
        if (!color.hexCode.trim()) {
            errors.push(`Màu ${index + 1}: Hex code không được để trống`);
        }
        }

        // if (!color.noBgImgUrl) {
        // errors.push(`Màu ${index + 1}: Vui lòng chọn ảnh không nền`);
        // }

        if (color.variants.length === 0) {
        errors.push(`Màu ${index + 1}: Phải có ít nhất một biến thể (size)`);
        }

        color.variants.forEach((variant, vIndex) => {
        // Nếu tạo size mới (sizeId = 0) thì phải nhập sizeCode
        if (variant.sizeId === 0 && !variant.sizeCode.trim()) {
            errors.push(
            `Màu ${index + 1}, Size ${vIndex + 1}: Mã size không được để trống`
            );
        }

        if (!variant.variantName.trim()) {
            errors.push(
            `Màu ${index + 1}, Size ${vIndex + 1}: Tên biến thể không được để trống`
            );
        }

        if (variant.quantity < 0) {
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