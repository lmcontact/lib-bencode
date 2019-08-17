# lib-bencode

Bencode library in TypeScript.

It's not pre-compiled, made for use with webpack.

Require ES6 support for BigInt.

## Usage

```typescript
import * as bencode from 'lib-bencode'

// decode
const rawFile = new Uint8Array([]);
const result = bencode.decode(rawFile);

// encode
const bencoded = bencode.encode(result);
```