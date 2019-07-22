/**
 * This file contains all the functions needed to decode bencoded values
 * to their javascript equivalent.
 */

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
 * @param {string} data - The data to decode.
 * @return {[number, bigint]} The array containing the next index and the
 * decoded int.
 */
function decodeInt(index: number, data: string): [number, bigint] {
  index++;

  const endIndex = data.indexOf("e", index);
  let nb: bigint;

  if (data[index] === "0" && data[index + 1] !== "e") {
    throw new DecodeError("decodeInt: leading zero");
  } else if (data[index] === "-" && !"123456789".includes(data[index + 1])) {
    throw new DecodeError("decodeInt: invalid value");
  }

  try {
    nb = BigInt(data.slice(index, endIndex));
  } catch {
    throw new DecodeError("decodeInt: invalid value");
  }

  return [endIndex + 1, nb];
}

/**
 * Return an array containing the next starting index and the decoded string.
 * @param {number} index - The starting index.
 * @param {string} data - The data to decode.
 * @return {[number, string]} The array containing the next starting index and
 * the decoded string.
 */
function decodeString(index: number, data: string): [number, string] {
  let colonIndex = data.indexOf(":", index);
  if (colonIndex === -1) {
    throw new DecodeError("decodeString: no colon found");
  }

  const len = parseInt(data.slice(index, colonIndex));
  if (data.slice(colonIndex + 1).length < len) {
    throw new DecodeError("decodeString: data too short");
  }

  colonIndex++;

  return [colonIndex + len, data.slice(colonIndex, colonIndex + len)];
}

/**
 * Return an array containing the next starting index and the decoded list.
 * @param {number} index - The starting index.
 * @param {string} data - The data to decode.
 * @return {[number, *[]]} The arraay containing the next starting index and
 * the decoded list.
 */
function decodeList(index: number, data: string): any[] {
  index++;

  const result = [];

  while (index < data.length && data[index] !== "e") {
    let nextIndex, value;

    if (data[index] === "i") {
      try {
        [nextIndex, value] = decodeInt(index, data);
      } catch {
        throw new DecodeError("decodeList: error while int");
      }
    } else if ("0123456789".includes(data[index])) {
      try {
        [nextIndex, value] = decodeString(index, data);
      } catch {
        throw new DecodeError("decodeList: error while decoding string");
      }
    } else if (data[index] === "l") {
      try {
        [nextIndex, value] = decodeList(index, data);
      } catch {
        throw new DecodeError("decodeList: error decoding list");
      }
    } else if (data[index] === "d") {
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

  if (data[index] !== "e") {
    throw new DecodeError("decodeList: unexpected end");
  }

  return [index + 1, result];
}

/**
 * Return an array containing the next starting index and the decoded dict.
 * @param {number} index - The starting index.
 * @param {string} data - The data to decode.
 * @return {[number, *]} The array containing the next starting index and the
 * decoded dict.
 */
function decodeDict(index: number, data: string): [number, any] {
  index++;

  const result: any = {};

  while (index < data.length && data[index] !== "e") {
    let nextIndex, value, key;

    try {
      [nextIndex, key] = decodeString(index, data);
    } catch {
      throw new DecodeError("decodeDict: error decoding key");
    }
    index = nextIndex;

    if (data[index] === "i") {
      try {
        [nextIndex, value] = decodeInt(index, data);
      } catch {
        throw new DecodeError("decodeDict: error decoding int");
      }
    } else if ("0123456789".includes(data[index])) {
      try {
        [nextIndex, value] = decodeString(index, data);
      } catch {
        throw new DecodeError("decodeDict: error decoding string");
      }
    } else if (data[index] === "l") {
      try {
        [nextIndex, value] = decodeList(index, data);
      } catch {
        throw new DecodeError("decodeDict: decoding list");
      }
    } else if (data[index] === "d") {
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

  if (data[index] !== "e") {
    throw new DecodeError("decodeDict: unexpected end");
  }

  return [index + 1, result];
}

function decode(data: string): any {
  const result: any[] = [];
  let index = 0;

  while (index < data.length) {
    let nextIndex, value;

    if (data[index] === "i") {
      try {
        [nextIndex, value] = decodeInt(index, data);
      } catch {
        throw new DecodeError("decode: error decoding int");
      }
    } else if ("0123456789".includes(data[index])) {
      try {
        [nextIndex, value] = decodeString(index, data);
      } catch {
        throw new DecodeError("decode: error decoding string");
      }
    } else if (data[index] === "l") {
      try {
        [nextIndex, value] = decodeList(index, data);
      } catch {
        throw new DecodeError("decode: error decoding list");
      }
    } else if (data[index] === "d") {
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
