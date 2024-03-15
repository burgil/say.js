declare module 'say' {
  const say: SayJS.Say;

  namespace SayJS {
    type errorCallback = (err: string) => void;
    type dataCallback = (data: string) => void;

    class Say {
      public export(text: string, voice?: string, speed?: number, filePath?: string, callback?: errorCallback): void;
      public stream(text: string, voice?: string, speed?: number): Promise<Array>;
      public streamRealTime(text: string, voice?: string, speed?: number, data_callback?: dataCallback, error_callback?: errorCallback): void;
      public speak(text: string, voice?: string, speed?: number, callback?: errorCallback): void;
      public stop(): void;
      public getInstalledVoices(callback: errorCallback): void;
    }
  }

  export = say;
}