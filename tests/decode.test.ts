"use strict";

import {
  DecodeError,
  decodeInt,
  decodeString,
  decodeList,
  decodeDict
} from "../src/decode";

describe("decodeInt", () => {
  const validTests = [
    { value: "asai1231edafds", decoded: 1231n, startIndex: 3, endIndex: 9 },
    { value: "eqwei0easdas", decoded: 0n, startIndex: 4, endIndex: 7 },
    {
      value: "eqwei3123123123123124edasd",
      decoded: 3123123123123124n,
      startIndex: 4,
      endIndex: 22
    },
    {
      value: "fdssfi-4123423edas",
      decoded: -4123423n,
      startIndex: 5,
      endIndex: 15
    },
    { value: "dai-3213e12312", decoded: -3213n, startIndex: 2, endIndex: 9 }
  ];

  it.each(validTests)("result should contains the bigint number", elt => {
    const [, value] = decodeInt(elt.startIndex, elt.value);

    expect(value).toBe(elt.decoded);
  });

  it.each(validTests)("should contains the next starting index", elt => {
    const [index] = decodeInt(elt.startIndex, elt.value);

    expect(index).toBe(elt.endIndex);
  });

  const invalidTests = [
    { value: "dasdi00123edasd", startIndex: 4 },
    { value: "qwwwei-03123eewa", startIndex: 5 },
    { value: "dasi--13eda", startIndex: 3 },
    { value: "adi312d21edad", startIndex: 2 }
  ];

  it.each(invalidTests)(
    "should throw an error if there is leading zeroes or if the value can't be converted",
    elt => {
      expect(() => {
        decodeInt(elt.startIndex, elt.value);
      }).toThrow(DecodeError);
    }
  );
});

describe("decodeString", () => {
  const validTests = [
    { value: "dasd4:testfsdf", decoded: "test", startIndex: 4, endIndex: 10 },
    { value: "eqweqe0:eqweqwe", decoded: "", startIndex: 6, endIndex: 8 },
    { value: "fasd1:zdasd", decoded: "z", startIndex: 4, endIndex: 7 },
    { value: "asd1::dad", decoded: ":", startIndex: 3, endIndex: 6 }
  ];

  it.each(validTests)("result should contains the string", elt => {
    const [, value] = decodeString(elt.startIndex, elt.value);

    expect(value).toBe(elt.decoded);
  });

  it.each(validTests)("result should contains the next starting index", elt => {
    const [index] = decodeString(elt.startIndex, elt.value);

    expect(index).toBe(elt.endIndex);
  });

  const invalidTests = [
    { value: "das4:we", startIndex: 3 },
    { value: "ewae5dasda", startIndex: 4 }
  ];

  it.each(invalidTests)(
    "should throw an error if there is no colon or if the string is too short",
    elt => {
      expect(() => {
        decodeString(elt.startIndex, elt.value);
      }).toThrow(DecodeError);
    }
  );
});

describe("decodeList", () => {
  const validTests = [
    {
      value: "dasdledasd",
      decoded: [],
      startIndex: 4,
      endIndex: 6
    },
    {
      value: "dadadli54ei412ei3123eefsdfsf",
      decoded: [54n, 412n, 3123n],
      startIndex: 5,
      endIndex: 22
    },
    {
      value: "dasdl4:test1:a3:abcedasd",
      decoded: ["test", "a", "abc"],
      startIndex: 4,
      endIndex: 20
    },
    {
      value: "dadasdli11232e5:test1i4234eedasd",
      decoded: [11232n, "test1", 4234n],
      startIndex: 6,
      endIndex: 28
    },
    {
      value: "dali312el4:testi7657ee6:foobaredasd",
      decoded: [312n, ["test", 7657n], "foobar"],
      startIndex: 2,
      endIndex: 31
    },
    {
      value: "dasld1:ai543eei3123e4:testedsad",
      decoded: [{ a: 543n }, 3123n, "test"],
      startIndex: 3,
      endIndex: 27
    }
  ];

  it.each(validTests)("result should contains the list", elt => {
    const [, value] = decodeList(elt.startIndex, elt.value);

    expect(value).toEqual(elt.decoded);
  });

  it.each(validTests)("result should contains the next starting index", elt => {
    const [index] = decodeList(elt.startIndex, elt.value);

    expect(index).toBe(elt.endIndex);
  });

  const invalidTests = [
    { value: "dali03eeda", startIndex: 2 },
    { value: "ddal4dasde", startIndex: 3 },
    { value: "dallzeeas", startIndex: 2 },
    { value: "dalzead", startIndex: 2 },
    { value: "dasldzeeas", startIndex: 3 },
    { value: "dasdl3:foo3:bar", startIndex: 4 }
  ];

  it.each(invalidTests)(
    "should throw an error if there is an error decoding subtype or in list structure",
    elt => {
      expect(() => {
        decodeList(elt.startIndex, elt.value);
      }).toThrow(DecodeError);
    }
  );
});

describe("decodeDict", () => {
  const validTests = [
    { value: "asddeaf", decoded: {}, startIndex: 3, endIndex: 5 },
    {
      value: "dad1:a3:fooeasd",
      decoded: { a: "foo" },
      startIndex: 2,
      endIndex: 12
    },
    {
      value: "azd1:bi423eead",
      decoded: { b: 423n },
      startIndex: 2,
      endIndex: 12
    },
    {
      value: "adadd1:ai41231e1:b4:testezxc",
      decoded: { a: 41231n, b: "test" },
      startIndex: 4,
      endIndex: 25
    },
    {
      value: "pld1:ai964e1:bl3:foo3:bare1:c4:testekhjk",
      decoded: { a: 964n, b: ["foo", "bar"], c: "test" },
      startIndex: 2,
      endIndex: 36
    },
    {
      value: "vfdvd1:a3:foo1:bd1:ci8423e1:d4:teste1:ei6345eeasd",
      decoded: { a: "foo", b: { c: 8423n, d: "test" }, e: 6345n },
      startIndex: 4,
      endIndex: 46
    }
  ];

  it.each(validTests)("return should contains the dict", elt => {
    const [, value] = decodeDict(elt.startIndex, elt.value);

    expect(value).toEqual(elt.decoded);
  });

  it.each(validTests)("return should contains the next starting index", elt => {
    const [index] = decodeDict(elt.startIndex, elt.value);

    expect(index).toBe(elt.endIndex);
  });

  const invalidTests = [
    { value: "asdasd1:azepfp", startIndex: 5 },
    { value: "azasd1:alzeezas", startIndex: 4 },
    { value: "davad1:adzeeqasd", startIndex: 4 },
    { value: "dasd1:a4:e", startIndex: 3 },
    { value: "zacad1:ai--0eedasd", startIndex: 4 },
    { value: "dasd1:a3:foo", startIndex: 3 }
  ];

  it.each(invalidTests)(
    "should throw error if there is an error decoding subtype or in dict structure",
    elt => {
      expect(() => {
        decodeDict(elt.startIndex, elt.value);
      }).toThrow(DecodeError);
    }
  );
});
