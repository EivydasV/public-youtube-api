import internal from 'node:stream';

export interface VideoUploadInterface {
  folder: string;
  file:
    | string
    | Buffer
    | internal.Readable
    | ReadableStream<any>
    | Blob
    | Uint8Array;
  fileName: string;
  contentType?: string;
}
