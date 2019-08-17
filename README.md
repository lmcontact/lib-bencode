# lib-bencode

[![CircleCI](https://circleci.com/gh/lmcontact/lib-bencode.svg?style=svg)](https://circleci.com/gh/lmcontact/lib-bencode)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8da79bb0c4b64da43ad4/test_coverage)](https://codeclimate.com/github/lmcontact/lib-bencode/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/8da79bb0c4b64da43ad4/maintainability)](https://codeclimate.com/github/lmcontact/lib-bencode/maintainability)

Bencode library in TypeScript.

It's not pre-compiled, made for use with webpack.

Require ES6 support for BigInt.

## Testing

```bash
yarn && yarn run test && yarn run clean
```
## Usage

```typescript
import * as bencode from 'lib-bencode'

// decode
const rawFile = new Uint8Array([]);
const result = bencode.decode(rawFile);

// encode
const bencoded = bencode.encode(result);
```