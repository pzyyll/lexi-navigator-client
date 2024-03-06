#ifndef KMHOOK_MACOS_H
#define KMHOOK_MACOS_H

#include <ApplicationServices/ApplicationServices.h>

#include <any>
#include <map>

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

  void Start();
  void Stop();
  void StartWithLoop();

 private:
  void _handle_event(CGEventTapProxy proxy, CGEventType type, CGEventRef event);
  void _handle_key_event(CGEventRef event);
  void _handle_modifier_event(CGEventRef event);
  void _handle_mouse_leftdown_event(CGEventRef event);
  void _handle_mouse_leftup_event(CGEventRef event);
  void _handle_mouse_leftdragged_event(CGEventRef event);

  CGEventMask _eventMask = 0;
  CFMachPortRef _eventTap = NULL;
  CFRunLoopSourceRef _runLoopSource = NULL;

  std::map<std::string, std::any> _shortcuts;

  int _keyInterval = kDefaultKeyInterval;
  int64_t _cacheKeyInterval = 0;
  std::string _cacheKey = "";

  uint64_t _cacheLastModifierFlag = 0;
  int64_t _cacheLastModifierInterval = 0;
  std::string _cacheModifierKey = "";
};

}  // namespace kmhook

#endif  // KMHOOK_MACOS_H