// src/app/admin/product/update/[productId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Product, 
  Category, 
  Color, 
  Size, 
  ProductColor,
  ProductVariant,
  UpdateProductColorFormData,
  UpdateProductVariantFormData 
} from '@/models/RequestUpdateProduct';

interface UpdateProductPageProps {
  params: { productId: string };
}

export default function UpdateProductPage({ params }: UpdateProductPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Product data
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  
  // Form fields
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  
  // Product colors
  const [productColors, setProductColors] = useState<UpdateProductColorFormData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch product details
      const productRes = await fetch(`/api/product/${params.productId}`);
      const productData = await productRes.json();
      
      if (productData.data) {
        const prod = productData.data;
        setProduct(prod);
        setProductName(prod.productName);
        setDescription(prod.description);
        setPrice(prod.price);
        setCategoryId(prod.categoryId);
        setMainImagePreview(prod.mainImageUrl);
        
        // Map existing product colors
        if (prod.productColors && prod.productColors.length > 0) {
          const mappedColors = prod.productColors.map((pc: ProductColor) => ({
            productColorId: pc.productColorId,
            colorId: pc.colorId,
            lensId: pc.lensId,
            noBgImgUrl: undefined,
            noBgImgPreview: pc.noBgImgUrl,
            productVariantImages: [],
            productVariantImagePreviews: pc.productImages?.map(img => img.imageUrl) || [],
            variants: pc.productVariants?.map((pv: ProductVariant) => ({
              productVariantId: pv.productVariantId,
              sizeId: pv.sizeId,
              variantName: pv.variantName,
              quantity: pv.quantity,
              imageUrl: undefined,
              imagePreview: pv.imageUrl,
              status: pv.status,
              productWeight: pv.productWeight,
              productLength: pv.productLength,
              productWidth: pv.productWidth,
              productHeight: pv.productHeight,
            })) || []
          }));
          setProductColors(mappedColors);
        }
      }
      
      // Fetch categories, colors, sizes
      const [catRes, colRes, sizeRes] = await Promise.all([
        fetch('/api/category'),
        fetch('/api/color'),
        fetch('/api/size'),
      ]);
      
      const [catData, colData, sizeData] = await Promise.all([
        catRes.json(),
        colRes.json(),
        sizeRes.json(),
      ]);
      
      setCategories(catData.data || []);
      setColors(colData.data || []);
      setSizes(sizeData.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const addProductColor = () => {
    setProductColors([
      ...productColors,
      {
        colorId: undefined,
        noBgImgUrl: undefined,
        lensId: '',
        productVariantImages: [],
        variants: [],
        colorName: '',
        colorPrefix: '',
        hexCode: '',
      },
    ]);
  };

  const removeProductColor = (index: number) => {
    setProductColors(productColors.filter((_, i) => i !== index));
  };

  const updateProductColor = (index: number, field: string, value: any) => {
    const updated = [...productColors];
    (updated[index] as any)[field] = value;
    setProductColors(updated);
  };

  const handleColorNoBgImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateProductColor(index, 'noBgImgUrl', file);
      updateProductColor(index, 'noBgImgPreview', URL.createObjectURL(file));
    }
  };

  const handleColorVariantImagesChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      updateProductColor(index, 'productVariantImages', files);
      updateProductColor(index, 'productVariantImagePreviews', files.map(f => URL.createObjectURL(f)));
    }
  };

  const addVariant = (colorIndex: number) => {
    const updated = [...productColors];
    if (!updated[colorIndex].variants) {
      updated[colorIndex].variants = [];
    }
    updated[colorIndex].variants!.push({
      sizeId: undefined,
      variantName: '',
      quantity: 0,
      imageUrl: undefined,
      status: 'Active',
      productWeight: undefined,
      productLength: undefined,
      productWidth: undefined,
      productHeight: undefined,
      sizeCode: '',
    });
    setProductColors(updated);
  };

  const removeVariant = (colorIndex: number, variantIndex: number) => {
    const updated = [...productColors];
    updated[colorIndex].variants = updated[colorIndex].variants!.filter((_, i) => i !== variantIndex);
    setProductColors(updated);
  };

  const updateVariant = (colorIndex: number, variantIndex: number, field: string, value: any) => {
    const updated = [...productColors];
    (updated[colorIndex].variants![variantIndex] as any)[field] = value;
    setProductColors(updated);
  };

  const handleVariantImageChange = (colorIndex: number, variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateVariant(colorIndex, variantIndex, 'imageUrl', file);
      updateVariant(colorIndex, variantIndex, 'imagePreview', URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
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
        });
      });
      
      const response = await fetch(`/api/product/${params.productId}`, {
        method: 'PUT',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('Cập nhật sản phẩm thành công!');
        router.push('/admin/product');
      } else {
        alert(result.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Có lỗi xảy ra khi cập nhật sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Cập nhật sản phẩm</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Tên sản phẩm</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Mô tả</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Giá</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2">Danh mục</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-2">Ảnh chính</label>
              {mainImagePreview && (
                <img src={mainImagePreview} alt="Preview" className="w-32 h-32 object-cover mb-2" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Product Colors */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Màu sắc sản phẩm</h2>
            <button
              type="button"
              onClick={addProductColor}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Thêm màu
            </button>
          </div>
          
          {productColors.map((pc, colorIndex) => (
            <div key={colorIndex} className="border p-4 mb-4 rounded">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Màu {colorIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeProductColor(colorIndex)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Xóa
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Color selection */}
                <div>
                  <label className="block font-medium mb-2">Chọn màu có sẵn</label>
                  <select
                    value={pc.colorId || ''}
                    onChange={(e) => updateProductColor(colorIndex, 'colorId', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Hoặc tạo màu mới --</option>
                    {colors.map(color => (
                      <option key={color.colorId} value={color.colorId}>
                        {color.colorName} ({color.colorPrefix})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Create new color fields */}
                {(!pc.colorId || pc.colorId === 0) && (
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="font-medium mb-2">Tạo màu mới:</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Color Prefix (VD: BLK)"
                        value={pc.colorPrefix || ''}
                        onChange={(e) => updateProductColor(colorIndex, 'colorPrefix', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Tên màu (VD: Đen)"
                        value={pc.colorName || ''}
                        onChange={(e) => updateProductColor(colorIndex, 'colorName', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Hex Code (VD: #000000)"
                        value={pc.hexCode || ''}
                        onChange={(e) => updateProductColor(colorIndex, 'hexCode', e.target.value)}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block font-medium mb-2">Lens ID</label>
                  <input
                    type="text"
                    value={pc.lensId || ''}
                    onChange={(e) => updateProductColor(colorIndex, 'lensId', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Ảnh không nền</label>
                  {(pc as any).noBgImgPreview && (
                    <img src={(pc as any).noBgImgPreview} alt="Preview" className="w-32 h-32 object-cover mb-2" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleColorNoBgImageChange(colorIndex, e)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block font-medium mb-2">Ảnh variants (nhiều ảnh)</label>
                  {(pc as any).productVariantImagePreviews && (pc as any).productVariantImagePreviews.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {(pc as any).productVariantImagePreviews.map((url: string, idx: number) => (
                        <img key={idx} src={url} alt={`Preview ${idx}`} className="w-20 h-20 object-cover" />
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleColorVariantImagesChange(colorIndex, e)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                {/* Variants */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Biến thể</h4>
                    <button
                      type="button"
                      onClick={() => addVariant(colorIndex)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Thêm biến thể
                    </button>
                  </div>
                  
                  {pc.variants?.map((variant, variantIndex) => (
                    <div key={variantIndex} className="bg-gray-50 p-3 mb-3 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Biến thể {variantIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeVariant(colorIndex, variantIndex)}
                          className="bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Size selection */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Chọn size có sẵn</label>
                          <select
                            value={variant.sizeId || ''}
                            onChange={(e) => updateVariant(colorIndex, variantIndex, 'sizeId', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="">-- Hoặc tạo size mới --</option>
                            {sizes.map(size => (
                              <option key={size.sizeId} value={size.sizeId}>
                                {size.sizeCode}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Create new size */}
                        {(!variant.sizeId || variant.sizeId === 0) && (
                          <div className="col-span-2 bg-white p-2 rounded">
                            <label className="block text-sm font-medium mb-1">Tạo size mới (VD: L, XL, 42)</label>
                            <input
                              type="text"
                              placeholder="Size Code"
                              value={variant.sizeCode || ''}
                              onChange={(e) => updateVariant(colorIndex, variantIndex, 'sizeCode', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm"
                            />
                          </div>
                        )}
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Tên biến thể</label>
                          <input
                            type="text"
                            value={variant.variantName || ''}
                            onChange={(e) => updateVariant(colorIndex, variantIndex, 'variantName', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Số lượng</label>
                          <input
                            type="number"
                            value={variant.quantity || ''}
                            onChange={(e) => updateVariant(colorIndex, variantIndex, 'quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Trạng thái</label>
                          <select
                            value={variant.status || 'Active'}
                            onChange={(e) => updateVariant(colorIndex, variantIndex, 'status', e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Ảnh biến thể</label>
                          {(variant as any).imagePreview && (
                            <img src={(variant as any).imagePreview} alt="Preview" className="w-20 h-20 object-cover mb-1" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleVariantImageChange(colorIndex, variantIndex, e)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Cân nặng (kg)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.productWeight || ''}
                            onChange={(e) => updateVariant(colorIndex, variantIndex, 'productWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Chiều dài (cm)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.productLength || ''}
                            onChange={(e) => updateVariant(colorIndex, variantIndex, 'productLength', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Chiều rộng (cm)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.productWidth || ''}
                            onChange={(e) => updateVariant(colorIndex, variantIndex, 'productWidth', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Chiều cao (cm)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.productHeight || ''}
                            onChange={(e) => updateVariant(colorIndex, variantIndex, 'productHeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Submit buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {submitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}