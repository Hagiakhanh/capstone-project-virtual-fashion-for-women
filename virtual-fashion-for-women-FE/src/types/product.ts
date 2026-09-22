export type typeRequestListProduct = {
   PageIndex: number;
   PageSize: number;
   ProductSort: 2 | 3;
}

export interface typeProductColor {
   colorId: number;
   colorName: string;
   colorPrefix: string;
   hexCode: string;
}

export interface typeProductSize {
   sizeId: number;
   sizeCode: string;
}