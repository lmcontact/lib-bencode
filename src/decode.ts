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
 * @return {[number, *]} The array containing the next index and the value.
 */
function decodeMap(data: Uint8Array, index: number): [number, any] {
  let nextIndex: number, value: any;

  if (data[index] === tokens.INT_DELIMITER) {
    [nextIndex, value] = decodeInt(index, data);
  } else if (tokens.STR_DELIMITERS.includes(data[index])) {
    [nextIndex, value] = decodeString(index, data);
  } else if (data[index] === tokens.LIST_DELIMITER) {
    [nextIndex, value] = decodeList(index, data);
  } else if (data[index] === tokens.DICT_DELIMITER) {
    [nextIndex, value] = decodeDict(index, data);
  } else {
    throw new DecodeError("decode: invalid value");
  }

  return [nextIndex, value];
}

/**
 * Helper - Function returns true if the char at index is leading zero else returns false.
 *
 * @private
 * @function isLeadingZero
 * @return {boolean} True if it's a leading zero else false.
 */
function isLeadingZero(data: Uint8Array, index: number): boolean {
  return (
    data[index] === tokens.ZERO && data[index + 1] !== tokens.END_DELIMITER
  );
}

/**
 * Helper - Function returns true if the char at index is an invalid minus else returns false.
 *
 * @private
 * @function isInvalidMinus
 * @return {boolean} True if it's a invalid minus else false.
 */
function isInvalidMinus(data: Uint8Array, index: number): boolean {
  return (
    data[index] === tokens.MINUS &&
    (data[index + 1] === "0".charCodeAt(0) ||
      !tokens.STR_DELIMITERS.includes(data[index + 1]))
  );
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
  const endIndex = data.indexOf(tokens.END_DELIMITER, ++index);
  let nb: bigint;

  if (isLeadingZero(data, index)) {
    throw new DecodeError("decodeInt: leading zero");
  } else if (isInvalidMinus(data, index)) {
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
  const result: any[] = [];

  index++;
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
