import { ResponseProductColorDTO } from "./ResponseProductColorDTO ";
import { ResponseProductDTO } from "./ResponseProductDTO ";

export interface TryOnDTO {
    tryOnSlotId: number;
    customerId: number;
    uploadImageUrl: string;
    outputImageUrl?: string;
    OutputTaskId: string;
    updatedAt: string;
    tryOnProductVariant: ResponseProductDTO[]
}