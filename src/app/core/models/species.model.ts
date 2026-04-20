export interface Species {
  id: number;
  commonName: string;
  latinName: string;
  description: string;
  imageUrl: string | null;
  minWeightKg: number | null;
  maxWeightKg: number | null;
  habitat: string | null;
}
