"use strict";
/**
 * This file contains all the functions needed to encode a javascript object
 * to it's bencoded form, if it's possible.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/** Class representing an encoding error.
 * @extends Error
 */
class EncodeError extends Error {
  /**
   * Create an EncodeError object.
   * @param {string} message - A string describing the error.
   */
  constructor(message) {
    super(message);
  }
}
exports.EncodeError = EncodeError;
/**
 * Helper - return the type of the element given in argument.
 * @param {*} elt - The element from which we want the type.
 * @return {string} The string corresponding to the type.
 */
function getType(elt) {
  const type = typeof elt;
  if (type === "object") {
    return elt === null ? "null" : elt instanceof Array ? "list" : "dict";
  } else {
    return type;
  }
}
exports.getType = getType;
/**
 * Return a bencoded string given a javascript string.
 * @param {string} str - The javascript string.
 * @return {string} The bencoded string.
 */
function encodeString(str) {
  return `${str.length}:${str}`;
}
exports.encodeString = encodeString;
/**
 * Return a bencoded int given a javascript BigInt.
 * @param {BigInt} n - The javascript BigInt.
 * @return {string} The bencoded int.
 */
function encodeInt(n) {
  return `i${n.toString()}e`;
}
exports.encodeInt = encodeInt;
/**
 * Return a bencoded list given a javascript array.
 * @param {*} list - The javascript array.
 * @return {string} The bencoded list.
 */
function encodeList(list) {
  const result = [];
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
      throw new EncodeError(`bencoded list can't contains ${type}`);
    }
  });
  return `l${result.join("")}e`;
}
exports.encodeList = encodeList;
/**
 * Return a bencoded dict given a javascript object.
 * @param {*} dict - The javascript object.
 * @return {string} The bencoded dict.
 */
function encodeDict(dict) {
  const result = [];
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
      throw new EncodeError(`bencoded dict can't contains ${type}`);
    }
  }
  return `d${result.join("")}e`;
}
exports.encodeDict = encodeDict;
/**
 * Return the bencoded form of the given argument.
 * @param {*} elt - The javascript element to encode.
 * @return {string} The bencoded form of the element.
 */
function encode(elt) {
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
    throw new EncodeError(`can't encode element of type ${type}`);
  }
}
exports.encode = encode;
//# sourceMappingURL=encode.js.map
