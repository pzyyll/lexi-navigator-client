
export class KMHook {
  constructor();

  RegisterShortcut(shortcut: string, callback: () => void): void;
  UnregisterShortcut(shortcut: string): void;
  UnregisterAllShortcuts(): void;

  RegisterMouseEvent(eventType: number, callback: (event: MouseEvent) => void): number;
  UnregisterMouseEvent(id: number): void;
  UnregisterAllMouse(): void;

  Start(): void;
  Stop(): void;
}

export const MouseLeftDown: number;
export const MouseLeftUp: number;
export const MouseLeftDrag: number;

interface MouseEvent {
  point: {
    x: number;
    y: number;
  };
}
