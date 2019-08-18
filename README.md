# lib-bencode

[![CircleCI](https://circleci.com/gh/lmcontact/lib-bencode.svg?style=svg)](https://circleci.com/gh/lmcontact/lib-bencode)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8da79bb0c4b64da43ad4/test_coverage)](https://codeclimate.com/github/lmcontact/lib-bencode/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/8da79bb0c4b64da43ad4/maintainability)](https://codeclimate.com/github/lmcontact/lib-bencode/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bencode library in TypeScript based on [specification](https://wiki.theory.org/index.php/BitTorrentSpecification#Bencoding).

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

## Todo

[ ] Add Webpack script to build bundle and declarations.
