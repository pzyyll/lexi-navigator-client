#ifndef KMHOOK_MACOS_H
#define KMHOOK_MACOS_H

#include <ApplicationServices/ApplicationServices.h>

#include <any>
#include <map>
#include <string>
#include <set>

extern "C" {
#include <Carbon/Carbon.h>
}

#include "kmhook_base.h"
#include "kmhook_def.h"

namespace kmhook {

class KMHookMacOS : public KMHookBase {
  static CGEventRef event_callback(CGEventTapProxy proxy, CGEventType type,
                                   CGEventRef event, void *refcon);

 public:
  KMHookMacOS();
  ~KMHookMacOS();

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

    auto modifierCodeIt = kModifierMap.find(keystr);
    if (modifierCodeIt != kModifierMap.end()) {
      return std::to_string(modifierCodeIt->second);
    }
    return keystr;
  }

 private:
  void _handle_event(CGEventTapProxy proxy, CGEventType type, CGEventRef event);
  void _handle_key_event(CGEventRef event);
  void _handle_key_up_event(CGEventRef event);
  void _handle_modifier_event(CGEventRef event);
  void _handle_mouse_leftdown_event(CGEventRef event);
  void _handle_mouse_leftup_event(CGEventRef event);
  void _handle_mouse_leftdragged_event(CGEventRef event);

  CGEventMask _eventMask = 0;
  CFMachPortRef _eventTap = NULL;
  CFRunLoopSourceRef _runLoopSource = NULL;
  bool _start_with_loop = false;

  std::map<std::string, std::any> _shortcuts;

  int64_t _cacheKeyInterval = 0;
  std::string _cacheKey = "";

  uint64_t _cacheLastModifierFlag = 0;
  int64_t _cacheLastModifierInterval = 0;
  std::string _cacheModifierKey = "";

  std::set<uint64_t> _cache_keys_down; 
};

}  // namespace kmhook

#endif  // KMHOOK_MACOS_H