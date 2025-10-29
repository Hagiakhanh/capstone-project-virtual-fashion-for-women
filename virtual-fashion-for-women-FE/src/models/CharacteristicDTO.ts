export type Characteristic = {
  characteristicId?: number;
  userId: number;
  weight?: number;
  height?: number;
  age?: number;
  bust?: number | null;
  waist?: number | null;
  hips?: number | null;
  styleTypeNote?: string | null;
  occasionNote?: string | null;
  skinToneNote?: string | null;
  styleTypeId?: number | null;
  occasionPreferenceId?: number | null;
  skinToneId?: number | null;
  colorPreference?: string | null;

  // Liên kết object con (từ API)
  styleType?: {
    styleTypeId: number;
    styleTypeName: string;
    imageUrl?: string;
    characteristics?: any[];
  } | null;

  occasionPreference?: {
    occasionPreferenceId: number;
    occasionPreferenceName: string;
    imageUrl?: string;
    characteristics?: any[];
  } | null;

  skinTone?: {
    skinToneId: number;
    skinToneName: string;
    imageUrl?: string;
    characteristics?: any[];
  } | null;

  user?: any | null;
};
