/**
 * ConcreteFlow Quantity Kit
 * Pure, dependency-free decimal arithmetic for illustrative material quantities.
 * This package never controls equipment or approves a concrete mix.
 */
const SCALE = 1_000_000n;
const MAX_INTEGER_DIGITS = 12;
const MAX_MATERIALS = 256;
const DECIMAL = /^(0|[1-9][0-9]*)(?:\.([0-9]{1,6}))?$/;
const MATERIAL_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const UNITS = Object.freeze({ "kg/m3": "kg", "L/m3": "L" });

function expectRecord(value, name, allowedKeys) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(name + " must be an object");
  }
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      throw new TypeError(name + " contains an unsupported field");
    }
  }
  for (const key of allowedKeys) {
    if (!Object.hasOwn(value, key)) {
      throw new TypeError(name + " is missing a required field");
    }
  }
}

function parsePositiveDecimal(value, name) {
  if (typeof value !== "string") {
    throw new TypeError(name + " must be a decimal string");
  }
  const match = DECIMAL.exec(value);
  if (!match || match[1].length > MAX_INTEGER_DIGITS) {
    throw new RangeError(name + " must be a positive decimal with at most 12 integer and 6 fractional digits");
  }
  const fractional = (match[2] || "").padEnd(6, "0");
  const scaled = BigInt(match[1]) * SCALE + BigInt(fractional || "0");
  if (scaled === 0n) {
    throw new RangeError(name + " must be greater than zero");
  }
  return scaled;
}

function decimalString(value, fractionDigits) {
  if (typeof value !== "bigint" || value < 0n) {
    throw new TypeError("internal nonnegative bigint expected");
  }
  const divider = 10n ** BigInt(fractionDigits);
  const integer = (value / divider).toString();
  const fraction = (value % divider).toString().padStart(fractionDigits, "0").replace(/0+$/, "");
  return fraction ? integer + "." + fraction : integer;
}

/**
 * Calculate exact string quantities without binary floating-point or implicit
 * conversion between mass and volume units.
 *
 * @param {{volumeM3:string, materials:Array<{id:string, ratePerM3:string, unit:"kg/m3"|"L/m3"}>}} input
 * @returns {{volumeM3:string, materials:Array<{id:string, ratePerM3:string, unit:string, total:string, totalUnit:string}>, status:string}}
 */
export function calculateBatchQuantities(input) {
  expectRecord(input, "input", ["volumeM3", "materials"]);
  const volume = parsePositiveDecimal(input.volumeM3, "volumeM3");

  if (!Array.isArray(input.materials) ||
      input.materials.length < 1 || input.materials.length > MAX_MATERIALS) {
    throw new RangeError("materials must contain 1..256 lines");
  }
  // Array#map skips holes; rejecting them prevents unvalidated output rows.
  for (let index = 0; index < input.materials.length; index++) {
    if (!Object.hasOwn(input.materials, index)) {
      throw new TypeError("materials must not contain sparse array entries");
    }
  }

  const seen = new Set();
  const calculated = input.materials.map((line, index) => {
    expectRecord(line, "materials[" + index + "]", ["id", "ratePerM3", "unit"]);
    if (typeof line.id !== "string" || !MATERIAL_ID.test(line.id)) {
      throw new TypeError("material id must be 1..64 ASCII letters, digits, dot, underscore or hyphen");
    }
    const canonicalId = line.id.toLowerCase();
    if (seen.has(canonicalId)) {
      throw new RangeError("duplicate material id");
    }
    seen.add(canonicalId);
    if (!Object.hasOwn(UNITS, line.unit)) {
      throw new RangeError("unit must be exactly kg/m3 or L/m3; no density conversion is performed");
    }

    const rate = parsePositiveDecimal(line.ratePerM3, "materials[" + index + "].ratePerM3");
    // Two 6-decimal fixed-point inputs yield at most 12 exact fractional digits.
    const totalUnscaled = rate * volume;
    return Object.freeze({
      id: line.id,
      ratePerM3: decimalString(rate, 6),
      unit: line.unit,
      total: decimalString(totalUnscaled, 12),
      totalUnit: UNITS[line.unit]
    });
  });

  return Object.freeze({
    volumeM3: decimalString(volume, 6),
    materials: Object.freeze(calculated),
    status: "calculation_only_not_an_instruction"
  });
}
