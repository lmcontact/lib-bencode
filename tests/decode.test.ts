import {
  DecodeError,
  decodeInt,
  decodeString,
  decodeList,
  decodeDict,
  decode
} from "../src/decode";

describe("decodeInt", () => {
  const te = new TextEncoder();
  const validTests = [
    {
      value: te.encode("asai1231edafds"),
      decoded: BigInt(1231),
      startIndex: 3,
      endIndex: 9
    },
    {
      value: te.encode("eqwei0easdas"),
      decoded: BigInt(0),
      startIndex: 4,
      endIndex: 7
    },
    {
      value: te.encode("eqwei3123123123123124edasd"),
      decoded: BigInt(3123123123123124),
      startIndex: 4,
      endIndex: 22
    },
    {
      value: te.encode("fdssfi-4123423edas"),
      decoded: BigInt(-4123423),
      startIndex: 5,
      endIndex: 15
    },
    {
      value: te.encode("dai-3213e12312"),
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
    { value: te.encode("dasdi00123edasd"), startIndex: 4 },
    { value: te.encode("qwwwei-03123eewa"), startIndex: 5 },
    { value: te.encode("dasi--13eda"), startIndex: 3 },
    { value: te.encode("adi312d21edad"), startIndex: 2 }
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
  const te = new TextEncoder();
  const validTests = [
    {
      value: te.encode("dasd4:testfsdf"),
      decoded: te.encode("test"),
      startIndex: 4,
      endIndex: 10
    },
    {
      value: te.encode("eqweqe0:eqweqwe"),
      decoded: te.encode(""),
      startIndex: 6,
      endIndex: 8
    },
    {
      value: te.encode("fasd1:zdasd"),
      decoded: te.encode("z"),
      startIndex: 4,
      endIndex: 7
    },
    {
      value: te.encode("asd1::dad"),
      decoded: te.encode(":"),
      startIndex: 3,
      endIndex: 6
    }
  ];

  it.each(validTests)("result should contains the string", elt => {
    const [, value] = decodeString(elt.startIndex, elt.value);

    expect(value).toEqual(elt.decoded);
  });

  it.each(validTests)("result should contains the next starting index", elt => {
    const [index] = decodeString(elt.startIndex, elt.value);

    expect(index).toEqual(elt.endIndex);
  });

  const invalidTests = [
    { value: te.encode("das4:we"), startIndex: 3 },
    { value: te.encode("ewae5dasda"), startIndex: 4 }
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
  const te = new TextEncoder();
  const validTests = [
    {
      value: te.encode("dasdledasd"),
      decoded: [],
      startIndex: 4,
      endIndex: 6
    },
    {
      value: te.encode("dadadli54ei412ei3123eefsdfsf"),
      decoded: [BigInt(54), BigInt(412), BigInt(3123)],
      startIndex: 5,
      endIndex: 22
    },
    {
      value: te.encode("dasdl4:test1:a3:abcedasd"),
      decoded: [te.encode("test"), te.encode("a"), te.encode("abc")],
      startIndex: 4,
      endIndex: 20
    },
    {
      value: te.encode("dadasdli11232e5:test1i4234eedasd"),
      decoded: [BigInt(11232), te.encode("test1"), BigInt(4234)],
      startIndex: 6,
      endIndex: 28
    },
    {
      value: te.encode("dali312el4:testi7657ee6:foobaredasd"),
      decoded: [
        BigInt(312),
        [te.encode("test"), BigInt(7657)],
        te.encode("foobar")
      ],
      startIndex: 2,
      endIndex: 31
    },
    {
      value: te.encode("dasld1:ai543eei3123e4:testedsad"),
      decoded: [{ a: BigInt(543) }, BigInt(3123), te.encode("test")],
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
    { value: te.encode("dali03eeda"), startIndex: 2 },
    { value: te.encode("ddal4dasde"), startIndex: 3 },
    { value: te.encode("dallzeeas"), startIndex: 2 },
    { value: te.encode("dalzead"), startIndex: 2 },
    { value: te.encode("dasldzeeas"), startIndex: 3 },
    { value: te.encode("dasdl3:foo3:bar"), startIndex: 4 }
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
  const te = new TextEncoder();
  const validTests = [
    { value: te.encode("asddeaf"), decoded: {}, startIndex: 3, endIndex: 5 },
    {
      value: te.encode("dad1:a3:fooeasd"),
      decoded: { a: te.encode("foo") },
      startIndex: 2,
      endIndex: 12
    },
    {
      value: te.encode("azd1:bi423eead"),
      decoded: { b: BigInt(423) },
      startIndex: 2,
      endIndex: 12
    },
    {
      value: te.encode("adadd1:ai41231e1:b4:testezxc"),
      decoded: { a: BigInt(41231), b: te.encode("test") },
      startIndex: 4,
      endIndex: 25
    },
    {
      value: te.encode("pld1:ai964e1:bl3:foo3:bare1:c4:testekhjk"),
      decoded: {
        a: BigInt(964),
        b: [te.encode("foo"), te.encode("bar")],
        c: te.encode("test")
      },
      startIndex: 2,
      endIndex: 36
    },
    {
      value: te.encode("vfdvd1:a3:foo1:bd1:ci8423e1:d4:teste1:ei6345eeasd"),
      decoded: {
        a: te.encode("foo"),
        b: { c: BigInt(8423), d: te.encode("test") },
        e: BigInt(6345)
      },
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
    { value: te.encode("asdasd1:azepfp"), startIndex: 5 },
    { value: te.encode("azasd1:alzeezas"), startIndex: 4 },
    { value: te.encode("davad1:adzeeqasd"), startIndex: 4 },
    { value: te.encode("dasd1:a4:e"), startIndex: 3 },
    { value: te.encode("zacad1:ai--0eedasd"), startIndex: 4 },
    { value: te.encode("dasd1:a3:foo"), startIndex: 3 }
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
  const te = new TextEncoder();
  const validTests = [
    { value: te.encode(""), decoded: null },
    { value: te.encode("i312331e"), decoded: BigInt(312331) },
    { value: te.encode("4:test"), decoded: te.encode("test") },
    {
      value: te.encode("l3:foo3:bari5235ee"),
      decoded: [te.encode("foo"), te.encode("bar"), BigInt(5235)]
    },
    {
      value: te.encode("d1:a3:baz1:bi366ee"),
      decoded: { a: te.encode("baz"), b: BigInt(366) }
    },
    {
      value: te.encode("l4:testd1:ai3123e1:b3:fooei2563ee"),
      decoded: [
        te.encode("test"),
        { a: BigInt(3123), b: te.encode("foo") },
        BigInt(2563)
      ]
    },
    {
      value: te.encode("d1:ai5345e1:bl3:foo3:bare1:c4:teste"),
      decoded: {
        a: BigInt(5345),
        b: [te.encode("foo"), te.encode("bar")],
        c: te.encode("test")
      }
    },
    {
      value: te.encode("4:test3:foo"),
      decoded: [te.encode("test"), te.encode("foo")]
    },
    {
      value: te.encode("4:testi4234e"),
      decoded: [te.encode("test"), BigInt(4234)]
    }
  ];

  it.each(validTests)("result should be the decoded value", elt => {
    const value = decode(elt.value);

    expect(value).toEqual(elt.decoded);
  });

  const invalidTests = [
    { value: te.encode("z") },
    { value: te.encode("i--3123e") },
    { value: te.encode("4:ea") },
    { value: te.encode("lze") },
    { value: te.encode("d1:aze") },
    { value: te.encode("l3:foo4:test3:bar") }
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
