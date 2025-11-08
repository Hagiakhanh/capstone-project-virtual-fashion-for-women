export interface TemplateDetailsModel {
    sizeId: number;
    minShoulder?: number | null;
    maxShoulder?: number | null;
    minBust?: number | null;
    maxBust?: number | null;
    minWaist?: number | null;
    maxWaist?: number | null;
    minHips?: number | null;
    maxHips?: number | null;
}

export interface RequestCreateCategoryTemplatesModel {
    categoryId: number;
    templates: TemplateDetailsModel[];
}