#ifndef KMHOOK_WIN_H
#define KMHOOK_WIN_H

#define NOMINMAX
#include <Windows.h>

#include <iostream>
#include <memory>
#include <set>
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

 protected:
  std::string _key_string_map(std::string keystr) override {
    std::transform(keystr.begin(), keystr.end(), keystr.begin(), ::tolower);

    auto codeIt = kKeyCodeMap.find(keystr);
    if (codeIt != kKeyCodeMap.end()) {
      return std::to_string(codeIt->second);
    }
    auto modifierCodeIt = kModifierNameMap.find(keystr);
    if (modifierCodeIt != kModifierNameMap.end()) {
      return std::to_string(modifierCodeIt->second);
    }
    if (keystr.length() == 1) {
      // to ascii
      std::transform(keystr.begin(), keystr.end(), keystr.begin(), ::toupper);
      return std::to_string(int(keystr[0]));
    }

    return keystr;
  }

 private:
  bool _is_running = false;
  unsigned _modifier_state = 0;

  long long _last_modifies_time = 0;
  unsigned _cache_modifies_cnt = 0;
  std::string _cache_modifies;

  long long _last_keys_time = 0;
  unsigned _cache_keys_cnt = 0;
  std::string _cache_keys;
  std::set<DWORD> _cache_keys_state;

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