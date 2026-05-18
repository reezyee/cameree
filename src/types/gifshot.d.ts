declare module 'gifshot' {
  interface GifOptions {
    images: string[];
    interval?: number;
    gifWidth?: number;
    gifHeight?: number;
    filter?: string;
    numWorkers?: number;
  }

  interface GifshotResponse {
    error: boolean;
    errorCode: string;
    errorMsg: string;
    image: string;
  }

  export function createGIF(
    options: GifOptions,
    callback: (obj: GifshotResponse) => void
  ): void;

  const gifshot: {
    createGIF: typeof createGIF;
  };

  export default gifshot;
}