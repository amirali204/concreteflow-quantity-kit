/** Explicit decimal strings; do not pass JavaScript numbers. */
export type QuantityDecimal = string;
export type RateUnit = "kg/m3" | "L/m3";
export interface MaterialRate {
  id: string;
  ratePerM3: QuantityDecimal;
  unit: RateUnit;
}
export interface BatchQuantityRequest {
  volumeM3: QuantityDecimal;
  materials: MaterialRate[];
}
export interface CalculatedMaterial {
  id: string;
  ratePerM3: QuantityDecimal;
  unit: RateUnit;
  total: QuantityDecimal;
  totalUnit: "kg" | "L";
}
export interface BatchQuantityResult {
  volumeM3: QuantityDecimal;
  materials: ReadonlyArray<Readonly<CalculatedMaterial>>;
  status: "calculation_only_not_an_instruction";
}
/**
 * Returns exact decimal-string products without rounding.
 * Not an engineering, safety, quality approval, or equipment-control API.
 */
export declare function calculateBatchQuantities(
  input: BatchQuantityRequest
): Readonly<BatchQuantityResult>;
