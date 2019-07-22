/**
 * This file contains all the functions needed to encode a javascript object
 * to it's bencoded equivalent
 */

/** Class representing an encoding error.
 * @extends Error
 */
class EncodeError extends Error {
  /**
   * Create an EncodeError object.
   * @param {string} message - A string describing the error.
   */
  constructor(message: string) {
    super(message);
  }
}

/**
 * Helper - return the type of the element given in argument.
 * @param {*} elt - The element from which we want the type.
 * @return {string} The string corresponding to the type.
 */
function getType(elt: any): string {
  const type = typeof elt;

  if (type === "object") {
    return elt === null ? "null" : elt instanceof Array ? "list" : "dict";
  } else {
    return type;
  }
}

/**
 * Return a bencoded string given a javascript string.
 * @param {string} str - The javascript string.
 * @return {string} The bencoded string.
 */
function encodeString(str: string): string {
  return `${str.length}:${str}`;
}

/**
 * Return a bencoded int given a javascript BigInt.
 * @param {BigInteger} n - The javascript BigInt.
 * @return {string} The bencoded int.
 */
function encodeInt(n: BigInt): string {
  return `i${n.toString()}e`;
}

/**
 * Return a bencoded list given a javascript array.
 * @param {*} list - The javascript array.
 * @return {string} The bencoded list.
 */
function encodeList(list: any[]): string {
  const result: string[] = [];

  list.forEach(elt => {
    const type = getType(elt);

    if (type === "list") {
      result.push(encodeList(elt));
    } else if (type === "dict") {
      result.push(encodeDict(elt));
    } else if (type === "bigint") {
      result.push(encodeInt(elt));
    } else if (type === "string") {
      result.push(encodeString(elt));
    } else {
      throw new EncodeError(`encodeList: wrong type ${type}`);
    }
  });

  return `l${result.join("")}e`;
}

/**
 * Return a bencoded dict given a javascript object.
 * @param {*} dict - The javascript object.
 * @return {string} The bencoded dict.
 */
function encodeDict(dict: any): string {
  const result: string[] = [];
  const keys = Object.keys(dict);

  keys.sort();

  for (let k of keys) {
    const type = getType(dict[k]);

    result.push(`${k.length}:${k}`);
    if (type === "dict") {
      result.push(encodeDict(dict[k]));
    } else if (type === "list") {
      result.push(encodeList(dict[k]));
    } else if (type === "string") {
      result.push(encodeString(dict[k]));
    } else if (type === "bigint") {
      result.push(encodeInt(dict[k]));
    } else {
      throw new EncodeError(`encodeDict: wrong type ${type}`);
    }
  }

  return `d${result.join("")}e`;
}

/**
 * Return the bencoded form of the given argument.
 * @param {*} elt - The javascript element to encode.
 * @return {string} The bencoded form of the element.
 */
function encode(elt: any): string {
  const type = getType(elt);

  if (type === "dict") {
    return encodeDict(elt);
  } else if (type === "list") {
    return encodeList(elt);
  } else if (type === "bigint") {
    return encodeInt(elt);
  } else if (type === "string") {
    return encodeString(elt);
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
