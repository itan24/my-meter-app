
export function calculateBill(units: number, isProtected: boolean = false): number {
  let energyCharge = 0;
  let remainingUnits = units;

  // Tariff slabs (base rates, single-phase residential)
  const slabs = isProtected
    ? [
        { maxUnits: 100, rate: 14.00 },
        { maxUnits: 200, rate: 25.00 },
      ]
    : [
        { maxUnits: 100, rate: 14.00 },
        { maxUnits: 200, rate: 25.00 },
        { maxUnits: 300, rate: 43.00 },
        { maxUnits: 400, rate: 65.00 },
        { maxUnits: 700, rate: 65.00 },
        { maxUnits: Infinity, rate: 43.00 },
      ];

  // Calculate energy charge
  let currentSlabIndex = 0;
  while (remainingUnits > 0 && currentSlabIndex < slabs.length) {
    const currentSlab = slabs[currentSlabIndex];
    const prevMaxUnits = currentSlabIndex === 0 ? 0 : slabs[currentSlabIndex - 1].maxUnits;
    const unitsInSlab = Math.min(remainingUnits, currentSlab.maxUnits - prevMaxUnits);
    energyCharge += unitsInSlab * currentSlab.rate;
    remainingUnits -= unitsInSlab;
    currentSlabIndex++;
  }

  // Fixed charges
  const fixedCharge = units <= 200 ? 500 : 1000;

  // Meter rent (PKR 6 + 18% GST)
  const meterRent = 7.08;

  // Taxes and surcharges
  const electricityDuty = energyCharge * 0.015; // 1.5%
  const gst = energyCharge * 0.17; // 17%
  const fpa = units * 2.00; // Fuel Price Adjustment
  const trSurcharge = units * 1.00; // Tariff Rationalization
  const qtrAdjustment = units * 0.50; // Quarterly Adjustment
  const muct = 50; // Municipal Utility Charges

  // Total bill before income tax
  let totalBill =
    energyCharge +
    fixedCharge +
    meterRent +
    electricityDuty +
    gst +
    fpa +
    trSurcharge +
    qtrAdjustment +
    muct;

  // Apply 7.5% advanced income tax if bill >= PKR 25,000
  if (totalBill >= 25000) {
    totalBill *= 1.075;
  }

  return Number(totalBill.toFixed(2));
}