import {
  EncodeError,
  getType,
  encodeString,
  encodeInt,
  encodeList,
  encodeDict,
  encode
} from "../src/encode";
import * as tokens from "../src/tokens";

describe("getType", () => {
  const te = new TextEncoder();
  const validTests = [
    {
      value: te.encode("adsd"),
      type: "rawstring"
    },
    { value: "test", type: "string" },
    { value: BigInt(4234), type: "bigint" },
    { value: [BigInt(1), BigInt(2), BigInt(3)], type: "list" },
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
  const te = new TextEncoder();
  const td = new TextDecoder();
  const validTests = ["test", "bencoded", "a", "str", "abc:def", ":", ""].map(
    elt => ({
      str: te.encode(elt),
      encoded: encodeString(te.encode(elt))
    })
  );

  it.each(validTests)("result should contains a colon", elt => {
    expect(elt.encoded.indexOf(tokens.COLON)).not.toBe(-1);
  });

  it.each(validTests)(
    "result should contains string length before colon",
    elt => {
      const indexColon = elt.encoded.indexOf(tokens.COLON);
      const len = parseInt(td.decode(elt.encoded.slice(0, indexColon)));

      expect(len).toBe(elt.str.length);
    }
  );

  it.each(validTests)(
    "result should contains exact string after colon",
    elt => {
      const indexColon = elt.encoded.indexOf(tokens.COLON);
      const str = elt.encoded.slice(indexColon + 1);

      expect(str.toString()).toBe(elt.str.toString());
    }
  );
});

describe("encodeInt", () => {
  const validTests = [
    BigInt(1),
    BigInt(0),
    BigInt(131123),
    BigInt(1312312323123),
    BigInt(371238127398127381927398127391273)
  ].map(elt => ({ value: elt, encoded: encodeInt(elt) }));

  it.each(validTests)("result should have 'i' as first character", elt => {
    expect(elt.encoded[0]).toBe(tokens.INT_DELIMITER);
  });

  it.each(validTests)("result should have 'e' as last character", elt => {
    expect(elt.encoded[elt.encoded.length - 1]).toBe(tokens.END_DELIMITER);
  });

  it.each(validTests)(
    "result should contains exact bigint between 'i' and 'e'",
    elt => {
      const str = new TextDecoder().decode(
        elt.encoded.slice(1, elt.encoded.length - 1)
      );
      const n = BigInt(str);

      expect(n).toBe(elt.value);
    }
  );
});

describe("encodeList", () => {
  const te = new TextEncoder();
  const validTests = [
    { value: [], encoded: te.encode("le") },
    { value: [te.encode("1"), te.encode("2")], encoded: te.encode("l1:11:2e") },
    { value: ["1", "2", "3"], encoded: te.encode("l1:11:21:3e") },
    {
      value: [BigInt(1), BigInt(2), BigInt(3)],
      encoded: te.encode("li1ei2ei3ee")
    },
    {
      value: [BigInt(1), "test", BigInt(4)],
      encoded: te.encode("li1e4:testi4ee")
    },
    {
      value: [BigInt(1), [BigInt(2), BigInt(3)]],
      encoded: te.encode("li1eli2ei3eee")
    },
    { value: [BigInt(1), ["2", "3"]], encoded: te.encode("li1el1:21:3ee") },
    {
      value: [BigInt(1), { a: "1", b: "2" }, { c: "3" }],
      encoded: te.encode("li1ed1:a1:11:b1:2ed1:c1:3ee")
    }
  ];

  it.each(validTests)("result should have 'l' as first character", elt => {
    const str = encodeList(elt.value);

    expect(str[0]).toBe(tokens.LIST_DELIMITER);
  });

  it.each(validTests)("result should have 'e' as last character", elt => {
    const str = encodeList(elt.value);

    expect(str[str.length - 1]).toBe(tokens.END_DELIMITER);
  });

  it.each(validTests)("result should be exact encoded list", elt => {
    const str = encodeList(elt.value);

    expect(str.toString()).toBe(elt.encoded.toString());
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
  const te = new TextEncoder();
  const validTests = [
    { value: {}, encoded: te.encode("de") },
    {
      value: { a: te.encode("1"), b: "2" },
      encoded: te.encode("d1:a1:11:b1:2e")
    },
    {
      value: { a: BigInt(1), b: BigInt(2) },
      encoded: te.encode("d1:ai1e1:bi2ee")
    },
    {
      value: { a: "test", b: BigInt(3) },
      encoded: te.encode("d1:a4:test1:bi3ee")
    },
    {
      value: { a: { b: BigInt(1), c: "2" }, d: "3" },
      encoded: te.encode("d1:ad1:bi1e1:c1:2e1:d1:3e")
    },
    {
      value: { a: [BigInt(1), "2"], b: "3" },
      encoded: te.encode("d1:ali1e1:2e1:b1:3e")
    },
    {
      value: { a: [{ b: BigInt(1) }, { c: "2" }], d: { e: BigInt(3), f: "4" } },
      encoded: te.encode("d1:ald1:bi1eed1:c1:2ee1:dd1:ei3e1:f1:4ee")
    }
  ];

  it.each(validTests)("result should have 'd' as first character", elt => {
    const str = encodeDict(elt.value);

    expect(str[0]).toBe(tokens.DICT_DELIMITER);
  });

  it.each(validTests)("result should have 'e' as first character", elt => {
    const str = encodeDict(elt.value);

    expect(str[str.length - 1]).toBe(tokens.END_DELIMITER);
  });

  it.each(validTests)("result should contains exact dict", elt => {
    const str = encodeDict(elt.value);

    expect(str.toString()).toBe(elt.encoded.toString());
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
  const te = new TextEncoder();
  const validTests = [
    { value: BigInt(1), encoded: te.encode("i1e") },
    { value: "test", encoded: te.encode("4:test") },
    { value: te.encode("test"), encoded: te.encode("4:test") },
    {
      value: [BigInt(1), BigInt(2), BigInt(3), "test"],
      encoded: te.encode("li1ei2ei3e4:teste")
    },
    { value: { a: BigInt(1), b: "2" }, encoded: te.encode("d1:ai1e1:b1:2e") }
  ];

  it.each(validTests)("should returns the exact encoded value", elt => {
    const str = encode(elt.value);

    expect(str.toString()).toBe(elt.encoded.toString());
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
