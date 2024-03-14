const kmhook = require('./build/Release/kmhook.node');

let km = new kmhook.KMHook();

console.log("Start");
km.RegisterShortcut("command+c+c", () => {
    console.log("command+c+c+pressed");
});

let mid0 = km.RegisterMouseEvent(kmhook.MouseLeftDown, (event) => {
  console.log(`MouseLeftDown, ${event.point.x}, ${event.point.y}`);
});

let mid1 = km.RegisterMouseEvent(kmhook.MouseLeftUp, (event) => {
  console.log(`MouseLeftUp, ${event.point.x}, ${event.point.y}`);
});

let mid2 = km.RegisterMouseEvent(kmhook.MouseLeftDrag, (event) => {
  console.log(`MouseLeftDrag, ${event.point.x}, ${event.point.y}`);
});

console.log("mid0", mid0);
console.log("mid1", mid1);
console.log("mid2", mid2);

km.RegisterShortcut("command+c+v", () => {
  km.UnregisterAllShortcuts();
});

km.RegisterShortcut("command+c+x", () => {
  km.UnregisterShortcut("command+c+c");
});

km.RegisterShortcut("command+c+z", () => {
  km.RegisterShortcut("command+c+c", () => {
    console.log("command+c+c+pressed 2");
  });
});

km.RegisterShortcut("command+c+e", () => {
  km.UnregisterMouseEvent(mid0);
});

km.RegisterShortcut("command+c+r", () => {
  km.UnregisterAllMouse();
});

km.RegisterShortcut("command+c+q", () => {
  km.Stop();
});

km.RegisterShortcut("alt+c+c", () => {
  console.log("alt+c+c+pressed");
});

km.StartWithLoop();
