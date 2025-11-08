// types/size.ts
export type Size = {
    sizeId: number;
    sizeCode: string;
};

// FormData này chỉ chứa các trường cần cho việc tạo/cập nhật
export type SizeFormData = Omit<Size, "sizeId">;