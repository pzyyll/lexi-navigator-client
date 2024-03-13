#include "kmhook_win.h"

#include <iostream>

using namespace kmhook;

HHOOK KMHookWin::_kKeyboardHook = NULL;
HHOOK KMHookWin::_kMouseHook = NULL;
std::vector<KMHookWin *> KMHookWin::_kKeyboardInstances;
std::vector<KMHookWin *> KMHookWin::_kMouseInstances;

LRESULT CALLBACK KMHookWin::LowLevelKeyboardProc(int nCode, WPARAM wParam,
                                                 LPARAM lParam) {
  if (nCode >= 0) {
    for (auto &k : _kKeyboardInstances) {
      k->OnKeyboardEvent(wParam, lParam);
    }
  }
  return CallNextHookEx(NULL, nCode, wParam, lParam);
}

void KMHookWin::TrySetKeyboardHook() {
  if (!_kKeyboardHook && _kKeyboardInstances.size() > 0) {
    _kKeyboardHook = SetWindowsHookEx(WH_KEYBOARD_LL, LowLevelKeyboardProc,
                                      GetModuleHandle(NULL), 0);
  }
}

void KMHookWin::TryUnsetKeyboardHook() {
  if (_kKeyboardHook && _kKeyboardInstances.size() == 0) {
    UnhookWindowsHookEx(_kKeyboardHook);
    _kKeyboardHook = NULL;
  }
}

LRESULT CALLBACK KMHookWin::LowLevelMouseProc(int nCode, WPARAM wParam,
                                              LPARAM lParam) {
  if (nCode >= 0) {
    for (auto &k : _kMouseInstances) {
      k->OnMouseEvent(wParam, lParam);
    }
  }
  return CallNextHookEx(NULL, nCode, wParam, lParam);
}

void KMHookWin::TrySetMouseHook() {
  if (!_kMouseHook && _kMouseInstances.size() > 0) {
    _kMouseHook = SetWindowsHookEx(WH_MOUSE_LL, LowLevelMouseProc,
                                   GetModuleHandle(NULL), 0);
  }
}

void KMHookWin::TryUnsetMouseHook() {
  if (_kMouseHook && _kMouseInstances.size() == 0) {
    UnhookWindowsHookEx(_kMouseHook);
    _kMouseHook = NULL;
  }
}

KMHookWin::KMHookWin() {
  // ...
}

KMHookWin::~KMHookWin() { this->Stop(); }

void KMHookWin::Start() {
  _is_running = true;
  AddListen();
}

void KMHookWin::Stop() {
  _is_running = false;
  RemoveListen();
}

void KMHookWin::StartWithLoop() {
  Start();

  MSG msg;
  while (GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
    std::cout << "Message: " << msg.message << std::endl;
  }
}

void KMHookWin::RemoveListen() {
  _kKeyboardInstances.erase(
      std::remove(_kKeyboardInstances.begin(), _kKeyboardInstances.end(), this),
      _kKeyboardInstances.end());
  _kMouseInstances.erase(
      std::remove(_kMouseInstances.begin(), _kMouseInstances.end(), this),
      _kMouseInstances.end());
  TryUnsetKeyboardHook();
  TryUnsetMouseHook();
}

void KMHookWin::AddListen() {
  if (!ShortcutsEmpty() &&
      std::find(_kKeyboardInstances.begin(), _kKeyboardInstances.end(), this) ==
          _kKeyboardInstances.end()) {
    _kKeyboardInstances.push_back(this);
    TrySetKeyboardHook();
  }
  if (!MouseCallbacksEmpty() &&
      std::find(_kMouseInstances.begin(), _kMouseInstances.end(), this) ==
          _kMouseInstances.end()) {
    _kMouseInstances.push_back(this);
    TrySetMouseHook();
  }
}

void KMHookWin::OnKeyboardEvent(WPARAM wParam, LPARAM lParam) {
  // ...
  std::cout << "Keyboard event: " << wParam << "," << lParam << std::endl;
}

void KMHookWin::OnMouseEvent(WPARAM wParam, LPARAM lParam) {
  // ...
  std::cout << "Mouse event: " << wParam << "," << lParam << std::endl;
}