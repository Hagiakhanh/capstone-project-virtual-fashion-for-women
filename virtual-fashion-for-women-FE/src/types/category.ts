export type Category = {
    categoryId: number;
    categoryName: string;
    categorySlug: string;
    bodyPart: string;
};

export type CategoryFormData = Omit<Category, "categoryId">;