import {
  EncodeError,
  getType,
  encodeString,
  encodeInt,
  encodeList,
  encodeDict,
  encode
} from "../src/encode";

describe("getType", () => {
  const validTests = [
    { value: "test", type: "string" },
    { value: 4234n, type: "bigint" },
    { value: [1n, 2n, 3n], type: "list" },
    { value: { a: 1, b: 2 }, type: "dict" },
    { value: 123, type: "number" },
    { value: true, type: "boolean" },
    { value: undefined, type: "undefined" },
    { value: null, type: "null" }
  ];

  it.each(validTests)(
    "result should be the bencoded corresponding type",
    elt => {
      expect(getType(elt.value)).toBe(elt.type);
    }
  );
});

describe("encodeString", () => {
  const validTests = ["test", "bencoded", "a", "str", "abc:def", ":", ""].map(
    elt => ({
      str: elt,
      encoded: encodeString(elt)
    })
  );

  it.each(validTests)("result should contains a colon", elt => {
    expect(elt.encoded.indexOf(":")).not.toBe(-1);
  });

  it.each(validTests)(
    "result should contains string length before colon",
    elt => {
      const indexColon = elt.encoded.indexOf(":");
      const len = parseInt(elt.encoded.substring(0, indexColon));

      expect(len).toBe(elt.str.length);
    }
  );

  it.each(validTests)(
    "result should contains exact string after colon",
    elt => {
      const indexColon = elt.encoded.indexOf(":");
      const str = elt.encoded.substring(indexColon + 1);

      expect(str).toBe(elt.str);
    }
  );
});

describe("encodeInt", () => {
  const validTests = [
    1n,
    0n,
    131123n,
    1312312323123n,
    371238127398127381927398127391273n
  ].map(elt => ({ value: elt, encoded: encodeInt(elt) }));

  it.each(validTests)("ressult should have 'i' as first character", elt => {
    expect(elt.encoded[0]).toBe("i");
  });

  it.each(validTests)("result should have 'e' as last character", elt => {
    expect(elt.encoded[elt.encoded.length - 1]).toBe("e");
  });

  it.each(validTests)(
    "result should contains exact bigint between 'i' and 'e'",
    elt => {
      const str = elt.encoded.substring(1, elt.encoded.length - 1);
      const n = BigInt(str);

      expect(n).toBe(elt.value);
    }
  );
});

describe("encodeList", () => {
  const validTests = [
    { value: [], encoded: "le" },
    { value: ["1", "2", "3"], encoded: "l1:11:21:3e" },
    { value: [1n, 2n, 3n], encoded: "li1ei2ei3ee" },
    { value: [1n, "test", 4n], encoded: "li1e4:testi4ee" },
    { value: [1n, [2n, 3n]], encoded: "li1eli2ei3eee" },
    { value: [1n, ["2", "3"]], encoded: "li1el1:21:3ee" },
    {
      value: [1n, { a: "1", b: "2" }, { c: "3" }],
      encoded: "li1ed1:a1:11:b1:2ed1:c1:3ee"
    }
  ];

  it.each(validTests)("result should have 'l' as first character", elt => {
    const str = encodeList(elt.value);

    expect(str[0]).toBe("l");
  });

  it.each(validTests)("result should have 'e' as last character", elt => {
    const str = encodeList(elt.value);

    expect(str[str.length - 1]).toBe("e");
  });

  it.each(validTests)("result should be exact encoded list", elt => {
    const str = encodeList(elt.value);

    expect(str).toBe(elt.encoded);
  });

  const invalidTests = [
    { value: [1, 2] },
    { value: [true, 2] },
    { value: [null, 4] },
    { value: [undefined, 3] }
  ];

  it.each(invalidTests)(
    "should throw EncodeListError if list contains forbidden type",
    elt => {
      expect(() => {
        encodeList(elt.value);
      }).toThrow(EncodeError);
    }
  );
});

describe("encodeDict", () => {
  const validTests = [
    { value: {}, encoded: "de" },
    { value: { a: 1n, b: 2n }, encoded: "d1:ai1e1:bi2ee" },
    { value: { a: "test", b: 3n }, encoded: "d1:a4:test1:bi3ee" },
    {
      value: { a: { b: 1n, c: "2" }, d: "3" },
      encoded: "d1:ad1:bi1e1:c1:2e1:d1:3e"
    },
    { value: { a: [1n, "2"], b: "3" }, encoded: "d1:ali1e1:2e1:b1:3e" },
    {
      value: { a: [{ b: 1n }, { c: "2" }], d: { e: 3n, f: "4" } },
      encoded: "d1:ald1:bi1eed1:c1:2ee1:dd1:ei3e1:f1:4ee"
    }
  ];

  it.each(validTests)("result should have 'd' as first character", elt => {
    const str = encodeDict(elt.value);

    expect(str[0]).toBe("d");
  });

  it.each(validTests)("result should have 'e' as first character", elt => {
    const str = encodeDict(elt.value);

    expect(str[str.length - 1]).toBe("e");
  });

  it.each(validTests)("result should contains exact dict", elt => {
    const str = encodeDict(elt.value);

    expect(str).toBe(elt.encoded);
  });

  const invalidTests = [
    { value: { a: 1 } },
    { value: { a: true } },
    { value: { a: null } },
    { value: { a: undefined } }
  ];

  it.each(invalidTests)(
    "should throw EncodedDictError if dict contains forbidden type",
    elt => {
      expect(() => {
        encodeDict(elt);
      }).toThrow(EncodeError);
    }
  );
});

describe("encode", () => {
  const validTests = [
    { value: 1n, encoded: "i1e" },
    { value: "test", encoded: "4:test" },
    { value: [1n, 2n, 3n, "test"], encoded: "li1ei2ei3e4:teste" },
    { value: { a: 1n, b: "2" }, encoded: "d1:ai1e1:b1:2e" }
  ];

  it.each(validTests)("should returns the exact encoded value", elt => {
    const str = encode(elt.value);

    expect(str).toBe(elt.encoded);
  });

  const invalidTests = [
    { value: null },
    { value: undefined },
    { value: true },
    { value: 15 }
  ];

  it.each(invalidTests)(
    "should throw an EncodeError if arg is of a forbidden type",
    elt => {
      expect(() => {
        encode(elt.value);
      }).toThrow(EncodeError);
    }
  );
});
