#include <functional>
#include <iostream>

#include "kmhook.h"

int main(int argc, char const* argv[]) {
  auto kmhook = kmhook::CreateKMHook();
  kmhook->RegisterShortcut("a", []() { std::cout << "a" << std::endl; });
  kmhook->RegisterShortcut("command+c+c",
                          []() { std::cout << "command+c+c" << std::endl; });
  
  int id = 0;
  id = kmhook->RegisterMouseEvent(
      kmhook::MouseEventType::kLeftDown, [](kmhook::ID id, const kmhook::MouseEvent& event) {
        std::cout << "mouse down: " << event.point.x << ", " << event.point.y
                  << std::endl;
        std::cout << "id " << id << std::endl;
      });
  std::cout << "id " << id << std::endl;
  kmhook->RegisterShortcut("command+e", [&kmhook, id]() {
    kmhook->UnregisterMouseEvent(id);
    std::cout << "command+e, " << id << std::endl;
  });
  kmhook->RegisterShortcut("command+c+r", [&kmhook]() {
    kmhook->UnregisterAllMouse();
    std::cout << "command+c+r" << std::endl;
  });

  kmhook->Start();
  return 0;
}