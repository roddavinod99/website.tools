import { describe, it, expect } from "vitest";
import { formatMoney, formatNumber, formatCompact } from "@/lib/finance/format";

describe("Currency formatting", () => {
  describe("formatMoney", () => {
    it("USD: $10,500.00", () => {
      const result = formatMoney(10500, "USD");
      expect(result).toContain("10,500.00");
      expect(result).toContain("$");
    });

    it("EUR: 10.500,00 € (de-DE locale)", () => {
      const result = formatMoney(10500, "EUR");
      expect(result).toContain("10.500,00");
      expect(result).toContain("€");
    });

    it("GBP: £10,500.00", () => {
      const result = formatMoney(10500, "GBP");
      expect(result).toContain("10,500.00");
      expect(result).toContain("£");
    });

    it("INR: ₹10,500.00 (en-IN locale with Indian grouping)", () => {
      const result = formatMoney(10500, "INR");
      expect(result).toContain("10,500");
      expect(result).toContain("₹");
    });

    it("JPY: ￥10,500 (0 decimals, full-width yen symbol)", () => {
      const result = formatMoney(10500, "JPY");
      // Intl.NumberFormat with ja-JP uses full-width yen symbol
      expect(result).toBe("￥10,500");
    });

    it("CNY: ¥10,500.00", () => {
      const result = formatMoney(10500, "CNY");
      expect(result).toContain("10,500.00");
      expect(result).toContain("¥");
    });

    it("AUD: $10,500.00 (en-AU uses $)", () => {
      const result = formatMoney(10500, "AUD");
      // en-AU locale uses $ as currency symbol
      expect(result).toContain("10,500.00");
      expect(result).toContain("$");
    });

    it("CAD: $10,500.00 (en-CA uses $)", () => {
      const result = formatMoney(10500, "CAD");
      // en-CA locale uses $ as currency symbol
      expect(result).toContain("10,500.00");
      expect(result).toContain("$");
    });

    it("CHF: CHF 10'500.00 (de-CH uses ' as decimal separator)", () => {
      const result = formatMoney(10500, "CHF");
      // de-CH locale uses ' as thousands separator
      expect(result).toContain("10'500.00");
      expect(result).toContain("CHF");
    });

    it("Negative values: -₹10,500.00", () => {
      const result = formatMoney(-10500, "INR");
      expect(result).toContain("-");
      expect(result).toContain("10,500.00");
    });

    it("Zero: $0.00", () => {
      const result = formatMoney(0, "USD");
      expect(result).toContain("0.00");
    });

    it("Non-finite: —", () => {
      const result = formatMoney(NaN, "USD");
      expect(result).toBe("—");
    });

    it("Custom decimals: $10,500.5", () => {
      const result = formatMoney(10500.5, "USD", { decimals: 1 });
      expect(result).toContain("10,500.5");
    });
  });

  describe("formatNumber", () => {
    it("en-US: 10,500.00", () => {
      const result = formatNumber(10500, "en-US", 2);
      expect(result).toBe("10,500.00");
    });

    it("de-DE: 10.500,00", () => {
      const result = formatNumber(10500, "de-DE", 2);
      expect(result).toBe("10.500,00");
    });

    it("en-IN: 10,500.00", () => {
      const result = formatNumber(10500, "en-IN", 2);
      expect(result).toBe("10,500.00");
    });

    it("ja-JP: 10,500", () => {
      const result = formatNumber(10500, "ja-JP", 0);
      expect(result).toBe("10,500");
    });
  });

  describe("formatCompact", () => {
    it("USD: $1.5K", () => {
      const result = formatCompact(1500, "USD");
      expect(result).toBe("$1.5K");
    });

    it("USD: $1.5M", () => {
      const result = formatCompact(1_500_000, "USD");
      expect(result).toBe("$1.5M");
    });

    it("USD: $1.5B", () => {
      const result = formatCompact(1_500_000_000, "USD");
      expect(result).toBe("$1.5B");
    });

    it("USD: $1.5T", () => {
      const result = formatCompact(1_500_000_000_000, "USD");
      expect(result).toBe("$1.5T");
    });

    it("INR: ₹150K (150,000 = 150K)", () => {
      const result = formatCompact(150_000, "INR");
      // formatCompact uses K/M/B/T suffixes, not L/Cr
      expect(result).toContain("150");
      expect(result).toContain("K");
    });

    it("Negative: -$1.5K", () => {
      const result = formatCompact(-1500, "USD");
      expect(result).toBe("-$1.5K");
    });
  });
});