// Type definitions for bencode

declare namespace bencode {
    declare function encode(elt: any): Uint8Array;
    declare function decode (data: Uint8Array): any;
}