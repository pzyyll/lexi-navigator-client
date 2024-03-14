#include "kmhook_win.h"

#include <iostream>

using namespace kmhook;

HHOOK KMHookWin::_kKeyboardHook = NULL;
HHOOK KMHookWin::_kMouseHook = NULL;
std::vector<KMHookWin *> KMHookWin::_kKeyboardInstances;
std::vector<KMHookWin *> KMHookWin::_kMouseInstances;


LRESULT CALLBACK KMHookWin::LowLevelKeyboardProc(int nCode, WPARAM wParam,
                                                 LPARAM lParam) {
  if (nCode == HC_ACTION) {
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

unsigned SetModifierState(unsigned &state, const DWORD &vk_code) {
  auto it = kWinModifierBitMap.find(vk_code);
  if (it != kWinModifierBitMap.end()) {
    state |= it->second;
    return it->second;
  }
  return 0;
}

void UnsetModifierState(unsigned &state, const DWORD &vk_code) {
  auto it = kWinModifierBitMap.find(vk_code);
  if (it != kWinModifierBitMap.end()) {
    state &= ~it->second;
  }
}

void GetModifierStateList(unsigned &state, std::vector<unsigned> &modifiers) {
  for (const auto &k : kKMHookModifiers) {
    if (state & k) {
      modifiers.push_back(k);
    }
  }
}

LRESULT CALLBACK KMHookWin::LowLevelMouseProc(int nCode, WPARAM wParam,
                                              LPARAM lParam) {
  if (nCode == HC_ACTION) {
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
  // std::cout << "Keyboard event: " << wParam << "," << lParam << std::endl;
  PKBDLLHOOKSTRUCT p = (PKBDLLHOOKSTRUCT)lParam;
  const auto now = _now_msec();
  switch (wParam) {
    case WM_SYSKEYUP:
    case WM_KEYUP: {
      // key up
      UnsetModifierState(_modifier_state, p->vkCode);
      _cache_keys_state.erase(p->vkCode);
      break;
    }
    case WM_SYSKEYDOWN:
    case WM_KEYDOWN: {
      std::vector<unsigned> modifiers;
      std::string keys;
      std::string smodifies;

      // Key down
      auto modifier_key = SetModifierState(_modifier_state, p->vkCode);
      if (modifier_key) {
        // 按下的是功能键
        if (now - _last_modifies_time > _double_click_interval) {
          _cache_modifies = "";
          _cache_modifies_cnt = 0;
        } 
        _last_modifies_time = now;
        _cache_modifies += std::to_string(modifier_key) + "+";
        _cache_modifies_cnt++;
        smodifies = _cache_modifies;
      } else {
        GetModifierStateList(_modifier_state, modifiers);
        for (const auto &m : modifiers) {
          smodifies += std::to_string(m) + "+";
        }

        if (now - _last_keys_time > _double_click_interval) {
          _cache_keys = "";
          _cache_keys_cnt = 0;
        }

        _last_keys_time = now;
        _cache_keys_cnt++;
        _cache_keys += std::to_string(p->vkCode) + "+";
        keys = _cache_keys;
      }

      if (_cache_keys_state.find(p->vkCode) != _cache_keys_state.end()) {
        // not repeat
        return;
      }

      _cache_keys_state.insert(p->vkCode);

      unsigned all_cnt = 0;
      if (!smodifies.empty()) all_cnt += _cache_modifies_cnt;
      if (!keys.empty()) all_cnt += _cache_keys_cnt;
      if (all_cnt > 5) {
        return;
      }

      std::string shortcut = smodifies + keys;
      if (shortcut.empty()) {
        return;
      }
      if (shortcut.back() == '+') {
        shortcut.pop_back();
      }

      // std::cout << "Shortcut: " << shortcut << std::endl;
      shortcut = _get_wrapper_key(std::move(shortcut));
      _excute_key_event(shortcut);
      break;
    }
    default:
      break;
  }
}

void KMHookWin::OnMouseEvent(WPARAM wParam, LPARAM lParam) {
  // ...
  // std::cout << "Mouse event: " << wParam << "," << lParam << std::endl;
  static bool is_left_down = false;

  auto msg = (PMSLLHOOKSTRUCT)lParam;
  KMPoint point = {msg->pt.x, msg->pt.y};
  MouseEvent event = {point};

  switch (wParam) {
    case WM_LBUTTONDOWN: {
      is_left_down = true;
      _excute_mouse_event(MouseEventType::kLeftDown, event);
      break;
    }
    case WM_LBUTTONUP:{
      is_left_down = false;
      _excute_mouse_event(MouseEventType::kLeftUp, event);
      break;
    }
    case WM_MOUSEMOVE:{
      if (is_left_down) {
        _excute_mouse_event(MouseEventType::kLeftDragged, event);
      }
      break;
    }
    default:
      break;
  }
}