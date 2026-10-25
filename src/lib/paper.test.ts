// Run with: bun test
// Checks that the site's formulas reproduce the numbers printed in the paper.
import { describe, expect, test } from "bun:test";
import { computeRisk, trend, tierEscalated, WORKED_EXAMPLE } from "./risk";
import { EPSILON_TABLE, SIGMA_FOR_EPSILON_8, epsilonAfterRounds } from "./paper-data";

describe("risk score (Sec. IV.G)", () => {
  test("worked example: 69 points, High Risk, confidence 92.7%", () => {
    const r = computeRisk(WORKED_EXAMPLE);
    expect(r.raw).toBe(69);
    expect(r.score).toBe(69);
    expect(r.level).toBe("high");
    expect(r.confidence).toBe(92.7);
  });

  test("band edges are strict (value on an edge falls in the lower band)", () => {
    const base = { age: 30, systolicBP: 120, cholesterol: 200, bmi: 25, glucose: 100, smoker: false, diabetic: false };
    expect(computeRisk(base).raw).toBe(0);
    expect(computeRisk({ ...base, glucose: 126 }).raw).toBe(7);
  });

  test("score saturates at 100 while raw can reach 125", () => {
    const r = computeRisk({ age: 70, systolicBP: 170, cholesterol: 260, bmi: 35, glucose: 140, smoker: true, diabetic: true });
    expect(r.raw).toBe(125);
    expect(r.score).toBe(100);
    expect(r.confidence).toBe(95);
  });

  test("tier boundaries: <30 low, 30-54 moderate, >=55 high", () => {
    const base = { age: 20, systolicBP: 110, cholesterol: 180, bmi: 22, glucose: 90, smoker: false, diabetic: false };
    expect(computeRisk({ ...base, age: 61, smoker: true }).level).toBe("moderate"); // 40
    expect(computeRisk({ ...base, age: 61, systolicBP: 161, diabetic: true }).level).toBe("high"); // 60
  });
});

describe("risk trajectory (Eq. 24-26)", () => {
  test("±5 point stable band", () => {
    expect(trend(50, 45).trend).toBe("stable");
    expect(trend(51, 45).trend).toBe("deteriorating");
    expect(trend(39, 45).trend).toBe("improving");
  });
  test("alert only when tier escalates", () => {
    expect(tierEscalated("high", "moderate")).toBe(true);
    expect(tierEscalated("moderate", "high")).toBe(false);
    expect(tierEscalated("low", "low")).toBe(false);
  });
});

describe("privacy accounting (Eq. 8, Table III)", () => {
  test("closed form matches Table III for σ ≥ 0.25 (within rounding)", () => {
    for (const row of EPSILON_TABLE.filter((r) => r.sigma >= 0.25)) {
      expect(Math.abs(epsilonAfterRounds(20, row.sigma) - row.epsilon)).toBeLessThan(2);
    }
  });
  test("σ ≈ 9.26 gives ε ≈ 8 after 20 rounds", () => {
    expect(epsilonAfterRounds(20, SIGMA_FOR_EPSILON_8)).toBeCloseTo(8, 1);
  });
  test("no noise means no formal guarantee", () => {
    expect(epsilonAfterRounds(20, 0)).toBe(Infinity);
  });
});
