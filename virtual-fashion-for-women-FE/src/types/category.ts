export type Category = {
    categoryId: number;
    categoryName: string;
    bodyPart: string;
};

export type CategoryFormData = Omit<Category, "categoryId">;