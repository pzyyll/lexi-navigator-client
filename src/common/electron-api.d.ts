export {};

declare enum Channel {
  GetConfig,
}


declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: (data: any) => void) => void;
      async_request: (channel: Channel) => any;
    };
  }
}
