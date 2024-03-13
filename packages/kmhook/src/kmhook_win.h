#ifndef KMHOOK_WIN_H
#define KMHOOK_WIN_H

#define NOMINMAX
#include <Windows.h>

#include <iostream>
#include <memory>
#include <vector>

#include "kmhook_base.h"

namespace kmhook {

class KMHookWin : public KMHookBase {
  static LRESULT CALLBACK LowLevelKeyboardProc(int nCode, WPARAM wParam,
                                               LPARAM lParam);
  static void TrySetKeyboardHook();
  static void TryUnsetKeyboardHook();

  static LRESULT CALLBACK LowLevelMouseProc(int nCode, WPARAM wParam,
                                            LPARAM lParam);
  static void TrySetMouseHook();
  static void TryUnsetMouseHook();

 public:
  KMHookWin();
  ~KMHookWin();

  void Start() override;
  void Stop() override;
  void StartWithLoop() override;

 private:
  bool _is_running = false;
  static HHOOK _kKeyboardHook;
  static HHOOK _kMouseHook;
  static std::vector<KMHookWin*> _kKeyboardInstances;
  static std::vector<KMHookWin*> _kMouseInstances;
  void RemoveListen();
  void AddListen();
  void OnKeyboardEvent(WPARAM wParam, LPARAM lParam);
  void OnMouseEvent(WPARAM wParam, LPARAM lParam);
};

}  // namespace kmhook

#endif  // KMHOOK_WIN_H