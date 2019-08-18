import * as tokens from "./tokens";

/**
 * Class representing a decoding error.
 *
 * @private
 * @class DecodeError
 * @extends Error
 */
class DecodeError extends Error {
  /**
   * @constructs DecodeError
   * @param {string} message - A string describing the error.
   */
  constructor(message: string) {
    super(message);
  }
}

/**
 * Function mapping a decode function given a delimiter.
 *
 * @private
 * @function decodeMap
 * @throw DecodeError
 * @return {function} The function corresponding to the delimiter.
 */
function decodeMap(data: Uint8Array, index: number): [number, any] {
  if (data[index] === tokens.INT_DELIMITER) {
    try {
      return decodeInt(index, data);
    } catch {
      throw new DecodeError("decode: error decoding int");
    }
  } else if (tokens.STR_DELIMITERS.includes(data[index])) {
    try {
      return decodeString(index, data);
    } catch {
      throw new DecodeError("decode: error decoding string");
    }
  } else if (data[index] === tokens.LIST_DELIMITER) {
    try {
      return decodeList(index, data);
    } catch {
      throw new DecodeError("decode: error decoding list");
    }
  } else if (data[index] === tokens.DICT_DELIMITER) {
    try {
      return decodeDict(index, data);
    } catch {
      throw new DecodeError("decode: error decoding dict");
    }
  } else {
    throw new DecodeError("decode: invalid value");
  }
}

/**
 * Function returning an array containing the next starting index and the decoded int.
 *
 * @private
 * @function decodeInt
 * @throws DecodeError
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
 *
 * @private
 * @function decodeString
 * @throws DecodeError
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
 *
 * @private
 * @function decodeList
 * @throws DecodeError
 * @param {number} index - The starting index.
 * @param {Uint8Array} data - The data to decode.
 * @return {[number, *[]]} The array containing the next starting index and
 * the decoded list.
 */
function decodeList(index: number, data: Uint8Array): [number, any[]] {
  index++;

  const result: any[] = [];

  while (index < data.length && data[index] !== tokens.END_DELIMITER) {
    const [nextIndex, value] = decodeMap(data, index);

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
 *
 * @private
 * @function decodeDict
 * @throws DecodeError
 * @param {number} index - The starting index.
 * @param {Uint8Array} data - The data to decode.
 * @return {[number, *]} The array containing the next starting index and the
 * decoded dict.
 */
function decodeDict(index: number, data: Uint8Array): [number, any] {
  index++;

  const result: any = {};

  while (index < data.length && data[index] !== tokens.END_DELIMITER) {
    let nextIndex: number, value: number;
    let rawKey: Uint8Array;
    let key: string;

    try {
      [nextIndex, rawKey] = decodeString(index, data);
      key = new TextDecoder().decode(rawKey);
    } catch {
      throw new DecodeError("decodeDict: error decoding key");
    }
    index = nextIndex;

    [nextIndex, value] = decodeMap(data, index);

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
 *
 * @public
 * @function decode
 * @throws DecodeError
 * @param {Uint8Array} data - The bencoded data.
 * @return {*} The javascript object obtained by decoding the data.
 */
function decode(data: Uint8Array): any {
  const result: any[] = [];
  let index = 0;

  while (index < data.length) {
    const [nextIndex, value] = decodeMap(data, index);

    result.push(value);
    index = nextIndex;
  }

  return result.length > 1 ? result : result.length ? result[0] : null;
}

export { DecodeError, decodeInt, decodeString, decodeList, decodeDict, decode };
