import { expect, test, describe } from "bun:test";
import { NepaliDate } from "../src/nepali-date";

describe("test the conversion of AD to BS and vice-versa", () => {
  test("AD to BS", () => {
    const date = new Date("April 14, 2022");
    const nepaliDate = new NepaliDate(date);

    expect(nepaliDate.toString()).toBe("2079/01/01");
  });
  test("BS to AD", () => {
    const date = new Date("April 14, 2022");
    const nepaliDate = new NepaliDate(date);

    expect(nepaliDate.getEnglishDate()).toBe(date);
  });
});
