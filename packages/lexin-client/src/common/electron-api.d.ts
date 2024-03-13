export {};

declare global {
  interface Window {
    electronAPI: {
      send: (channel: string, data?:any) => void;
      receive: (channel: string, func: (data: any) => void) => void;
      remove: (channel: string, func: (data: any) => void) => void;
      removeAll: (channel: string) => void;
      invoke: (channel: Channel, ...args:any[]) => any;
    };
  }
}
