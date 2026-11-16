import { calculateBatchQuantities } from "../src/index.mjs";

const calculation = calculateBatchQuantities({
  volumeM3: "7.25",
  materials: [
    { id: "illustrative-powder", ratePerM3: "320.5", unit: "kg/m3" },
    { id: "illustrative-liquid", ratePerM3: "182.125", unit: "L/m3" }
  ]
});

console.log(JSON.stringify(calculation, null, 2));
// Example input is fictional; do not use it as a concrete mix design.
