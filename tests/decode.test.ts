"use strict";

import {
  DecodeError,
  decodeInt,
  decodeString,
  decodeList,
  decodeDict,
  decode
} from "../src/decode";

describe("decodeInt", () => {
  const validTests = [
    {
      value: "asai1231edafds",
      decoded: BigInt(1231),
      startIndex: 3,
      endIndex: 9
    },
    { value: "eqwei0easdas", decoded: BigInt(0), startIndex: 4, endIndex: 7 },
    {
      value: "eqwei3123123123123124edasd",
      decoded: BigInt(3123123123123124),
      startIndex: 4,
      endIndex: 22
    },
    {
      value: "fdssfi-4123423edas",
      decoded: BigInt(-4123423),
      startIndex: 5,
      endIndex: 15
    },
    {
      value: "dai-3213e12312",
      decoded: BigInt(-3213),
      startIndex: 2,
      endIndex: 9
    }
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
      decoded: [BigInt(54), BigInt(412), BigInt(3123)],
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
      decoded: [BigInt(11232), "test1", BigInt(4234)],
      startIndex: 6,
      endIndex: 28
    },
    {
      value: "dali312el4:testi7657ee6:foobaredasd",
      decoded: [BigInt(312), ["test", BigInt(7657)], "foobar"],
      startIndex: 2,
      endIndex: 31
    },
    {
      value: "dasld1:ai543eei3123e4:testedsad",
      decoded: [{ a: BigInt(543) }, BigInt(3123), "test"],
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
    "should throw an error if problem decoding subtype or with list structure",
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
      decoded: { b: BigInt(423) },
      startIndex: 2,
      endIndex: 12
    },
    {
      value: "adadd1:ai41231e1:b4:testezxc",
      decoded: { a: BigInt(41231), b: "test" },
      startIndex: 4,
      endIndex: 25
    },
    {
      value: "pld1:ai964e1:bl3:foo3:bare1:c4:testekhjk",
      decoded: { a: BigInt(964), b: ["foo", "bar"], c: "test" },
      startIndex: 2,
      endIndex: 36
    },
    {
      value: "vfdvd1:a3:foo1:bd1:ci8423e1:d4:teste1:ei6345eeasd",
      decoded: { a: "foo", b: { c: BigInt(8423), d: "test" }, e: BigInt(6345) },
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
    "should throw an error if problem decoding subtype or with dict structure",
    elt => {
      expect(() => {
        decodeDict(elt.startIndex, elt.value);
      }).toThrow(DecodeError);
    }
  );
});

describe("decode", () => {
  const validTests = [
    { value: "", decoded: null },
    { value: "i312331e", decoded: BigInt(312331) },
    { value: "4:test", decoded: "test" },
    { value: "l3:foo3:bari5235ee", decoded: ["foo", "bar", BigInt(5235)] },
    { value: "d1:a3:baz1:bi366ee", decoded: { a: "baz", b: BigInt(366) } },
    {
      value: "l4:testd1:ai3123e1:b3:fooei2563ee",
      decoded: ["test", { a: BigInt(3123), b: "foo" }, BigInt(2563)]
    },
    {
      value: "d1:ai5345e1:bl3:foo3:bare1:c4:teste",
      decoded: { a: BigInt(5345), b: ["foo", "bar"], c: "test" }
    },
    {
      value: "4:test3:foo",
      decoded: ["test", "foo"]
    },
    {
      value: "4:testi4234e",
      decoded: ["test", BigInt(4234)]
    }
  ];

  it.each(validTests)("result should be the decoded value", elt => {
    const value = decode(elt.value);

    expect(value).toEqual(elt.decoded);
  });

  const invalidTests = [
    { value: "z" },
    { value: "i--3123e" },
    { value: "4:ea" },
    { value: "lze" },
    { value: "d1:aze" },
    { value: "l3:foo4:test3:bar" }
  ];

  it.each(invalidTests)(
    "should throw an error if problem with subconversion or with input structure",
    elt => {
      expect(() => {
        decode(elt.value);
      }).toThrow(DecodeError);
    }
  );
});
