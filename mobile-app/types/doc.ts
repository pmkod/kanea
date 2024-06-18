export interface Doc {
  id: number;
  file?: Blob | Buffer | string;
  name?: string;
  url: string;
  mimeType?: string;
}
