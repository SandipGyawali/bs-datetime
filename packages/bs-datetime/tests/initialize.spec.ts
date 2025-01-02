import { expect, test, describe } from "bun:test";
import { NepaliDate } from "../src/nepali-date";

describe("test the construction of Nepali Date object", () => {
  test("with a date object as argument", () => {
    const date = new NepaliDate(new Date(1713032100000)); // April 14, 2024, i.e. baisakh 2

    expect(date.toString()).toBe("2081/01/02");
  });

  test("with a number as argument", () => {
    const date = new NepaliDate(1713032100000); // April 14, 2024, i.e. baisakh 2

    expect(date.toString()).toBe("2081/01/02");
  });

  test("with another NepaliDate object as argument", () => {
    const date = new NepaliDate(1713032100000); // April 14, 2024, i.e. baisakh 2
    const newDate = new NepaliDate(date);

    expect(date.toString()).toBe("2081/01/02");
    expect(newDate.toString()).toBe(date.toString());

    // make sure the objects are different
    expect(newDate).not.toBe(date);
  });

  test.skip("with a string", () => {});
});
