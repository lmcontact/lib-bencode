import * as tokens from "./tokens";

/**
 * Class representing an encoding error.
 *
 * @class EncodeError
 * @extends Error
 */
class EncodeError extends Error {
  /**
   * @constructs EncodeError
   * @param {string} message - A string describing the error.
   */
  constructor(message: string) {
    super(message);
  }
}

/**
 * Helper - return the type of the element given in argument.
 *
 * @function getType
 * @param {*} elt - The element from which we want the type.
 * @return {string} The string corresponding to the type.
 */
function getType(elt: any): string {
  const type = typeof elt;

  if (elt && elt.buffer) {
    return "rawstring";
  } else if (type === "object") {
    return elt === null ? "null" : elt instanceof Array ? "list" : "dict";
  } else {
    return type;
  }
}

/**
 * Return a bencoded string given a javascript string.
 *
 * @function encodeString
 * @param {string} str - The javascript string.
 * @return {string} The bencoded string.
 */
function encodeString(str: Uint8Array): Uint8Array {
  const len = new TextEncoder().encode(String(str.length));
  const buf = new Uint8Array(new ArrayBuffer(len.length + 1 + str.length));

  buf.set(len, 0);
  buf.set([tokens.COLON], len.length);
  buf.set(str, len.length + 1);

  return buf;
}

/**
 * Return a bencoded int given a javascript BigInt.
 *
 * @function encodeInt
 * @param {BigInteger} n - The javascript BigInt.
 * @return {string} The bencoded int.
 */
function encodeInt(n: BigInt): Uint8Array {
  return new TextEncoder().encode(`i${n.toString()}e`);
}

/**
 * Return a bencoded list given a javascript array.
 *
 * @function encodeList
 * @param {*} list - The javascript array.
 * @return {string} The bencoded list.
 */
function encodeList(list: any[]): Uint8Array {
  const result: Uint8Array[] = [];
  const te = new TextEncoder();

  list.forEach(elt => {
    const type = getType(elt);

    if (type === "list") {
      result.push(encodeList(elt));
    } else if (type === "dict") {
      result.push(encodeDict(elt));
    } else if (type === "bigint") {
      result.push(encodeInt(elt));
    } else if (type === "rawstring") {
      result.push(encodeString(elt));
    } else if (type === "string") {
      result.push(encodeString(te.encode(elt)));
    } else {
      throw new EncodeError(`encodeList: wrong type ${type}`);
    }
  });

  const bufLen = result.length
    ? result.map(elt => elt.length).reduce((a, b) => a + b)
    : 0;
  const buf = new Uint8Array(new ArrayBuffer(bufLen + 2));
  let index = 0;

  buf.set([tokens.LIST_DELIMITER], index);
  index++;
  for (let elt of result) {
    buf.set(elt, index);
    index += elt.length;
  }
  buf.set([tokens.END_DELIMITER], index);

  return buf;
}

/**
 * Return a bencoded dict given a javascript object.
 *
 * @function encodeDict
 * @param {*} dict - The javascript object.
 * @return {string} The bencoded dict.
 */
function encodeDict(dict: any): Uint8Array {
  const result: Uint8Array[] = [];
  const te = new TextEncoder();
  const keys = Object.keys(dict);

  keys.sort();

  for (let k of keys) {
    const type = getType(dict[k]);

    result.push(te.encode(`${k.length}:${k}`));
    if (type === "dict") {
      result.push(encodeDict(dict[k]));
    } else if (type === "list") {
      result.push(encodeList(dict[k]));
    } else if (type === "rawstring") {
      result.push(encodeString(dict[k]));
    } else if (type === "string") {
      result.push(encodeString(te.encode(dict[k])));
    } else if (type === "bigint") {
      result.push(encodeInt(dict[k]));
    } else {
      throw new EncodeError(`encodeDict: wrong type ${type}`);
    }
  }

  const bufLen = result.length
    ? result.map(elt => elt.length).reduce((a, b) => a + b)
    : 0;
  const buf = new Uint8Array(new ArrayBuffer(bufLen + 2));
  let index = 0;

  buf.set([tokens.DICT_DELIMITER], index);
  index++;
  for (let elt of result) {
    buf.set(elt, index);
    index += elt.length;
  }
  buf.set([tokens.END_DELIMITER], index);

  return buf;
}

/**
 * Return the bencoded form of the given argument.
 *
 * @function encode
 * @param {*} elt - The javascript element to encode.
 * @return {Uint8Array} The bencoded form of the element.
 */
function encode(elt: any): Uint8Array {
  const type = getType(elt);

  if (type === "dict") {
    return encodeDict(elt);
  } else if (type === "list") {
    return encodeList(elt);
  } else if (type === "bigint") {
    return encodeInt(elt);
  } else if (type === "rawstring") {
    return encodeString(elt);
  } else if (type === "string") {
    return encodeString(new TextEncoder().encode(elt));
  } else {
    throw new EncodeError(`encodeDict: wrong type ${type}`);
  }
}

export {
  EncodeError,
  getType,
  encodeString,
  encodeInt,
  encodeList,
  encodeDict,
  encode
};
