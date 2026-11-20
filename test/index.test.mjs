import test from "node:test";
import assert from "node:assert/strict";
import { calculateBatchQuantities } from "../src/index.mjs";

const request = (volumeM3 = "7.25", ratePerM3 = "320.5", unit = "kg/m3") => ({
  volumeM3,
  materials: [{ id: "cement", ratePerM3, unit }]
});

test("exact example multiplication and explicit mass unit", () => {
  const result = calculateBatchQuantities(request());
  assert.deepEqual(result, {
    volumeM3: "7.25",
    materials: [{ id: "cement", ratePerM3: "320.5", unit: "kg/m3", total: "2323.625", totalUnit: "kg" }],
    status: "calculation_only_not_an_instruction"
  });
});

test("volume unit lines remain separate; no kg/L conversion", () => {
  const value = calculateBatchQuantities({
    volumeM3: "7.25",
    materials: [
      { id: "powder", ratePerM3: "320.5", unit: "kg/m3" },
      { id: "liquid", ratePerM3: "182.125", unit: "L/m3" }
    ]
  });
  assert.equal(value.materials[0].total, "2323.625");
  assert.equal(value.materials[0].totalUnit, "kg");
  assert.equal(value.materials[1].total, "1320.40625");
  assert.equal(value.materials[1].totalUnit, "L");
});

test("smallest six-decimal inputs preserve twelve-place precision", () => {
  const value = calculateBatchQuantities(request("0.000001", "0.000001"));
  assert.equal(value.materials[0].total, "0.000000000001");
});

test("fixed-point multiplication avoids IEEE-754 drift", () => {
  const value = calculateBatchQuantities(request("0.1", "0.2"));
  assert.equal(value.materials[0].total, "0.02");
});

test("input canonicalized without rounding", () => {
  const value = calculateBatchQuantities(request("1.000000", "10.010000"));
  assert.equal(value.volumeM3, "1");
  assert.equal(value.materials[0].ratePerM3, "10.01");
  assert.equal(value.materials[0].total, "10.01");
});

test("large exact products do not overflow JS number", () => {
  const value = calculateBatchQuantities(request("999999999999.999999", "999999999999.999999"));
  assert.equal(value.materials[0].total, "999999999999999998000000.000000000001");
});

test("reject wrong and missing top-level fields", () => {
  for (const value of [null, [], "bad", 12, {}]) {
    assert.throws(() => calculateBatchQuantities(value));
  }
  assert.throws(() => calculateBatchQuantities({ ...request(), approval: true }), /unsupported field/);
});

test("reject zero, negative, numeric, exponent, whitespace and locale decimal inputs", () => {
  const invalid = [
    "0", "0.000000", "-1", 1, NaN, Infinity, "1e2", "1.", ".1", "01",
    " 1", "1 ", "+1", "1,0", "1.0000000", "1000000000000", ""
  ];
  for (const volumeM3 of invalid) {
    assert.throws(() => calculateBatchQuantities(request(volumeM3)), undefined, String(volumeM3));
  }
});

test("reject invalid dose values, including zero and overprecision", () => {
  for (const ratePerM3 of ["0", "-0.1", "2.0000001", "1e3", 42, null, "9999999999999"]) {
    assert.throws(() => calculateBatchQuantities(request("1", ratePerM3)));
  }
});

test("reject unknown units and refuse implicit density conversion", () => {
  for (const unit of ["kg", "L", "kg/l", "g/m3", "m3", "", null, "KG/M3"]) {
    assert.throws(() => calculateBatchQuantities(request("1", "1", unit)));
  }
});

test("material count must be 1..256", () => {
  const blank = { volumeM3: "1", materials: [] };
  assert.throws(() => calculateBatchQuantities(blank), /1\.\.256/);
  assert.throws(() => calculateBatchQuantities({ ...blank, materials: new Array(257).fill(blank) }));
  assert.throws(() => calculateBatchQuantities({ ...blank, materials: null }));
});

test("accept exactly 256 materials with stable order and exact quantities", () => {
  const materials = Array.from({ length: 256 }, (_, index) => ({
    id: `material-${index + 1}`,
    ratePerM3: `0.${String(index + 1).padStart(3, "0")}`,
    unit: index % 2 === 0 ? "kg/m3" : "L/m3"
  }));
  const result = calculateBatchQuantities({ volumeM3: "0.1", materials });
  assert.equal(result.materials.length, 256);
  assert.deepEqual(result.materials.map(({ id }) => id), materials.map(({ id }) => id));
  assert.deepEqual(
    [result.materials[0].total, result.materials[255].total],
    ["0.0001", "0.0256"]
  );
  assert.deepEqual(
    [result.materials[0].totalUnit, result.materials[255].totalUnit],
    ["kg", "L"]
  );
});

test("unique material IDs ignore ASCII case", () => {
  assert.throws(() => calculateBatchQuantities({
    volumeM3: "1",
    materials: [
      { id: "MAT-1", ratePerM3: "2", unit: "kg/m3" },
      { id: "mat-1", ratePerM3: "3", unit: "L/m3" }
    ]
  }), /duplicate/);
});

test("IDs must be bounded ASCII and not paths", () => {
  for (const id of ["", "../x", "a/b", "é", "a b", "_hidden", "x".repeat(65), null, 12]) {
    assert.throws(() => calculateBatchQuantities({
      volumeM3: "1", materials: [{ id, ratePerM3: "1", unit: "kg/m3" }]
    }));
  }
});

test("accept a 64-character material ID but reject 65 characters", () => {
  const id = "A" + "b".repeat(63);
  const result = calculateBatchQuantities({
    volumeM3: "1",
    materials: [{ id, ratePerM3: "2", unit: "kg/m3" }]
  });
  assert.equal(result.materials[0].id, id);
  assert.throws(
    () => calculateBatchQuantities({
      volumeM3: "1",
      materials: [{ id: id + "c", ratePerM3: "2", unit: "kg/m3" }]
    }),
    /material id/
  );
});

test("reject extra line fields or inherited required fields", () => {
  assert.throws(() => calculateBatchQuantities({
    volumeM3: "1",
    materials: [{ id: "a", ratePerM3: "1", unit: "kg/m3", approved: true }]
  }));
  const line = Object.create({ unit: "kg/m3" });
  line.id = "a";
  line.ratePerM3 = "1";
  assert.throws(() => calculateBatchQuantities({ volumeM3: "1", materials: [line] }));
});

test("does not mutate inputs and freezes returned output", () => {
  const input = request();
  const before = JSON.stringify(input);
  const result = calculateBatchQuantities(input);
  assert.equal(JSON.stringify(input), before);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.materials), true);
  assert.equal(Object.isFrozen(result.materials[0]), true);
  assert.throws(() => { result.materials[0].total = "wrong"; }, TypeError);
});

test("reject sparse materials array (do not skip unvalidated holes)", () => {
  const input = { volumeM3: "1", materials: Array(2) };
  input.materials[0] = { id: "one", ratePerM3: "1", unit: "kg/m3" };
  assert.throws(() => calculateBatchQuantities(input));
});
