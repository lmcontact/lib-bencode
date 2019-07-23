// Type definitions for bencode

declare namespace bencode {
    function encode(elt: any): Uint8Array;
    function decode (data: Uint8Array): any;
}