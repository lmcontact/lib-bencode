import * as tokens from "./tokens";

/**
 * Class representing an encoding error.
 *
 * @private
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
 * @private
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
 * Function encodeMap maps function to argument type.
 *
 * @private
 * @function encodeMap
 * @throws EncodeError
 * @param {string} type - The type of the element.
 * @param {any} elt - The element to encode.
 * @return {Uint8Array} - The encoded element.
 */
function encodeMap(type: string, elt: any): Uint8Array {
  let encodedElt: Uint8Array;

  if (type === "dict") {
    encodedElt = encodeDict(elt);
  } else if (type === "list") {
    encodedElt = encodeList(elt);
  } else if (type === "rawstring") {
    encodedElt = encodeString(elt);
  } else if (type === "string") {
    encodedElt = encodeString(new TextEncoder().encode(elt));
  } else if (type === "bigint") {
    encodedElt = encodeInt(elt);
  } else {
    throw new EncodeError(`encodeDict: wrong type ${type}`);
  }

  return encodedElt;
}

/**
 * Return a bencoded string given a javascript string.
 *
 * @private
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
 * @private
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
 * @private
 * @function encodeList
 * @throws EncodeError
 * @param {*} list - The javascript array.
 * @return {string} The bencoded list.
 */
function encodeList(list: any[]): Uint8Array {
  const result: Uint8Array[] = [];

  list.forEach(elt => {
    const type = getType(elt);

    result.push(encodeMap(type, elt));
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
 * @private
 * @function encodeDict
 * @throws EncodeError
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
    result.push(encodeMap(type, dict[k]));
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
 * @public
 * @function encode
 * @param {*} elt - The javascript element to encode.
 * @return {Uint8Array} The bencoded form of the element.
 */
function encode(elt: any): Uint8Array {
  const type = getType(elt);

  return encodeMap(type, elt);
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
