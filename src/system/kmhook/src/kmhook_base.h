#ifndef KM_HOOK_BASE_H
#define KM_HOOK_BASE_H

#include <any>
#include <cctype>
#include <chrono>
#include <iostream>
#include <map>
#include <string>
#include <vector>

#include "kmhook_def.h"

namespace kmhook {

class KMHookProtocol {
 public:
  void RegisterShortcut(std::string, Callback &&callback);
  virtual void UnregisterShortcut(const std::string &) = 0;
  virtual void UnregisterAllShortcuts() = 0;
  virtual bool Has(const std::string &) = 0;
  virtual Callback &Find(const std::string &) = 0;

  virtual ID RegisterMouseEvent(MouseEventType, MouseCallback &&) = 0;
  virtual void UnregisterMouseEvent(ID) = 0;
  virtual void UnregisterAllMouse() = 0;

  virtual void Start() = 0;
  virtual void Stop() = 0;
  virtual void StartWithLoop() = 0;
};

class KMHookBase : public KMHookProtocol {
 public:
  KMHookBase() = default;
  virtual ~KMHookBase() = default;

  void RegisterShortcut(std::string shortcut, Callback &&callback) {
    _shortcuts[_trans_shortcut(shortcut)] = std::forward<Callback>(callback);
  }

  void UnregisterShortcut(const std::string &shortcut) {
    std::string st = _trans_shortcut(shortcut);
    if (_shortcuts.find(st) == _shortcuts.end()) {
      return;
    }
    _shortcuts.erase(st);
  }

  void UnregisterAllShortcuts() { _shortcuts.clear(); };

  bool Has(const std::string &shortcut) {
    return _shortcuts.find(_trans_shortcut(shortcut)) != _shortcuts.end();
  }

  Callback &Find(const std::string &shortcut) {
    return _shortcuts[_trans_shortcut(shortcut)];
  }

  ID RegisterMouseEvent(MouseEventType event, MouseCallback &&callback) {
    MouseCallbackInfo wrapper;
    wrapper.id = ++_mouse_cb_next_id;
    wrapper.callback = std::forward<MouseCallback>(callback);

    _mouse_callbacks[event].push_back(wrapper);
    _mouse_ids_type_map[wrapper.id] = event;
    return wrapper.id;
  }

  void UnregisterMouseEvent(ID id) {
    auto eventIt = _mouse_ids_type_map.find(id);
    if (eventIt == _mouse_ids_type_map.end()) {
      return;
    }
    auto event_type = eventIt->second;

    auto &callbacks = _mouse_callbacks[event_type];
    callbacks.erase(
        std::remove_if(callbacks.begin(), callbacks.end(),
                       [id](auto &wrapper) { return wrapper.id == id; }),
        callbacks.end());
  }

  void UnregisterAllMouse() {
    _mouse_callbacks.clear();
    _mouse_ids_type_map.clear();
  }

 protected:
  virtual std::string _trans_shortcut(std::string shortcut) {
    std::transform(shortcut.begin(), shortcut.end(), shortcut.begin(),
                   [](unsigned char c) { return std::tolower(c); });
    return shortcut;
  }

  void _excute_mouse_event(MouseEventType event, const MouseEvent &event_info) {
    auto callback_it = _mouse_callbacks.find(event);
    if (callback_it == _mouse_callbacks.end()) {
      return;
    }
    auto &callbacks = callback_it->second;
    for (auto &callback : callbacks) {
      callback.callback(callback.id, event_info);
    }
  }

  void _excute_key_event(std::string &shortcut) {
    auto result = _shortcuts.find(_trans_shortcut(shortcut));
    if (result != _shortcuts.end()) {
      result->second();
    }
  }

  auto _now_msec() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
               std::chrono::system_clock::now().time_since_epoch())
        .count();
  }

 private:
  std::map<std::string, Callback> _shortcuts;
  std::map<int, std::vector<MouseCallbackInfo>> _mouse_callbacks;
  std::map<ID, MouseEventType> _mouse_ids_type_map;
  ID _mouse_cb_next_id = 0;
};

}  // namespace kmhook

#endif  // KM_HOOK_BASE_H