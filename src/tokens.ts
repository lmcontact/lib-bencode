const INT_DELIMITER = "i".charCodeAt(0);
const LIST_DELIMITER = "l".charCodeAt(0);
const DICT_DELIMITER = "d".charCodeAt(0);
const END_DELIMITER = "e".charCodeAt(0);
const ZERO = "0.".charCodeAt(0);
const MINUS = "-".charCodeAt(0);
const COLON = ":".charCodeAt(0);
const STR_DELIMITERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(
  c => c.charCodeAt(0)
);

export {
  INT_DELIMITER,
  LIST_DELIMITER,
  DICT_DELIMITER,
  END_DELIMITER,
  ZERO,
  MINUS,
  COLON,
  STR_DELIMITERS
};
