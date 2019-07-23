/**
 * This file contains all the functions needed to decode bencoded values
 * to their javascript equivalent.
 */

import * as tokens from "./tokens";

/** Class representing a decoding error.
 * @extends Error
 */
class DecodeError extends Error {
  /**
   * Create an DecodeError object.
   * @param {string} message - A string describing the error.
   */
  constructor(message: string) {
    super(message);
  }
}

/**
 * Return an array containing the next starting index and the decoded int.
 * @param {number} index - The starting index.
 * @param {Uint8Array} data - The data to decode.
 * @return {[number, bigint]} The array containing the next index and the
 * decoded int.
 */
function decodeInt(index: number, data: Uint8Array): [number, bigint] {
  index++;

  const endIndex = data.indexOf(tokens.END_DELIMITER, index);
  let nb: bigint;

  if (data[index] === tokens.ZERO && data[index + 1] !== tokens.END_DELIMITER) {
    throw new DecodeError("decodeInt: leading zero");
  } else if (
    data[index] === tokens.MINUS &&
    (data[index + 1] === "0".charCodeAt(0) ||
      !tokens.STR_DELIMITERS.includes(data[index + 1]))
  ) {
    throw new DecodeError("decodeInt: invalid value");
  }

  try {
    const nbStr = new TextDecoder().decode(data.slice(index, endIndex));
    nb = BigInt(nbStr);
  } catch {
    throw new DecodeError("decodeInt: invalid value");
  }

  return [endIndex + 1, nb];
}

/**
 * Return an array containing the next starting index and the decoded string.
 * @param {number} index - The starting index.
 * @param {Uint8Array} data - The data to decode.
 * @return {[number, string]} The array containing the next starting index and
 * the decoded string.
 */
function decodeString(index: number, data: Uint8Array): [number, Uint8Array] {
  let colonIndex = data.indexOf(tokens.COLON, index);
  if (colonIndex === -1) {
    throw new DecodeError("decodeString: no colon found");
  }

  const lenStr = new TextDecoder().decode(data.slice(index, colonIndex));
  const len = parseInt(lenStr);

  colonIndex++;

  if (data.slice(colonIndex, colonIndex + len).length < len) {
    throw new DecodeError("decodeString: data too short");
  }

  return [colonIndex + len, data.slice(colonIndex, colonIndex + len)];
}

/**
 * Return an array containing the next starting index and the decoded list.
 * @param {number} index - The starting index.
 * @param {Uint8Array} data - The data to decode.
 * @return {[number, *[]]} The arraay containing the next starting index and
 * the decoded list.
 */
function decodeList(index: number, data: Uint8Array): any[] {
  index++;

  const result = [];

  while (index < data.length && data[index] !== tokens.END_DELIMITER) {
    let nextIndex, value;

    if (data[index] === tokens.INT_DELIMITER) {
      try {
        [nextIndex, value] = decodeInt(index, data);
      } catch {
        throw new DecodeError("decodeList: error while int");
      }
    } else if (tokens.STR_DELIMITERS.includes(data[index])) {
      try {
        [nextIndex, value] = decodeString(index, data);
      } catch {
        throw new DecodeError("decodeList: error while decoding string");
      }
    } else if (data[index] === tokens.LIST_DELIMITER) {
      try {
        [nextIndex, value] = decodeList(index, data);
      } catch {
        throw new DecodeError("decodeList: error decoding list");
      }
    } else if (data[index] === tokens.DICT_DELIMITER) {
      try {
        [nextIndex, value] = decodeDict(index, data);
      } catch {
        throw new DecodeError("decodeList: error decoding dict");
      }
    } else {
      throw new DecodeError("decodeList: invalid value");
    }

    result.push(value);
    index = nextIndex;
  }

  if (data[index] !== tokens.END_DELIMITER) {
    throw new DecodeError("decodeList: unexpected end");
  }

  return [index + 1, result];
}

/**
 * Return an array containing the next starting index and the decoded dict.
 * @param {number} index - The starting index.
 * @param {Uint8Array} data - The data to decode.
 * @return {[number, *]} The array containing the next starting index and the
 * decoded dict.
 */
function decodeDict(index: number, data: Uint8Array): [number, any] {
  index++;

  const result: any = {};

  while (index < data.length && data[index] !== tokens.END_DELIMITER) {
    let nextIndex, value, rawKey, key;

    try {
      [nextIndex, rawKey] = decodeString(index, data);
      key = new TextDecoder().decode(rawKey);
    } catch {
      throw new DecodeError("decodeDict: error decoding key");
    }
    index = nextIndex;

    if (data[index] === tokens.INT_DELIMITER) {
      try {
        [nextIndex, value] = decodeInt(index, data);
      } catch {
        throw new DecodeError("decodeDict: error decoding int");
      }
    } else if (tokens.STR_DELIMITERS.includes(data[index])) {
      try {
        [nextIndex, value] = decodeString(index, data);
      } catch {
        throw new DecodeError("decodeDict: error decoding string");
      }
    } else if (data[index] === tokens.LIST_DELIMITER) {
      try {
        [nextIndex, value] = decodeList(index, data);
      } catch {
        throw new DecodeError("decodeDict: decoding list");
      }
    } else if (data[index] === tokens.DICT_DELIMITER) {
      try {
        [nextIndex, value] = decodeDict(index, data);
      } catch {
        throw new DecodeError("decodeDict: error decoding dict");
      }
    } else {
      throw new DecodeError("decodeDict: invalid value");
    }

    result[key] = value;
    index = nextIndex;
  }

  if (data[index] !== tokens.END_DELIMITER) {
    throw new DecodeError("decodeDict: unexpected end");
  }

  return [index + 1, result];
}

/**
 * Return the decoded bencoded data string converted into javascript object.
 * @param {Uint8Array} data - The bencoded data.
 * @return {*} The javascript object obtained by decoding the data.
 */
function decode(data: Uint8Array): any {
  const result: any[] = [];
  let index = 0;

  while (index < data.length) {
    let nextIndex, value;

    if (data[index] === tokens.INT_DELIMITER) {
      try {
        [nextIndex, value] = decodeInt(index, data);
      } catch {
        throw new DecodeError("decode: error decoding int");
      }
    } else if (tokens.STR_DELIMITERS.includes(data[index])) {
      try {
        [nextIndex, value] = decodeString(index, data);
      } catch {
        throw new DecodeError("decode: error decoding string");
      }
    } else if (data[index] === tokens.LIST_DELIMITER) {
      try {
        [nextIndex, value] = decodeList(index, data);
      } catch {
        throw new DecodeError("decode: error decoding list");
      }
    } else if (data[index] === tokens.DICT_DELIMITER) {
      try {
        [nextIndex, value] = decodeDict(index, data);
      } catch {
        throw new DecodeError("decode: error decoding dict");
      }
    } else {
      throw new DecodeError("decode: invalid value");
    }

    result.push(value);
    index = nextIndex;
  }

  return result.length > 1 ? result : result.length ? result[0] : null;
}

export { DecodeError, decodeInt, decodeString, decodeList, decodeDict, decode };
