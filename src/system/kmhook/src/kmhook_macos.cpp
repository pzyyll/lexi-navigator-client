#include "kmhook_macos.h"

#include <iostream>

using namespace kmhook;
using namespace std;

MouseEvent GetMouseEventInfo(CGEventRef event) {
  CGPoint location = CGEventGetLocation(event);
  MouseEvent event_info;
  event_info.point.x = location.x;
  event_info.point.y = location.y;
  return event_info;
}

KMHookMacOS::KMHookMacOS() {
  // ...
  this->_eventMask = CGEventMaskBit(kCGEventKeyDown) |
                     CGEventMaskBit(kCGEventFlagsChanged) |
                     CGEventMaskBit(kCGEventLeftMouseDown) |
                     CGEventMaskBit(kCGEventLeftMouseUp) |
                     CGEventMaskBit(kCGEventLeftMouseDragged);
}

KMHookMacOS::~KMHookMacOS() { this->Stop(); }

CGEventRef KMHookMacOS::event_callback(CGEventTapProxy proxy, CGEventType type,
                                       CGEventRef event, void *refcon) {
  // ...
  KMHookMacOS *p_kmhook = static_cast<KMHookMacOS *>(refcon);
  p_kmhook->_handle_event(proxy, type, event);
  return event;
}

void KMHookMacOS::_handle_event(CGEventTapProxy proxy, CGEventType type,
                                CGEventRef event) {
  switch (type) {
    case kCGEventFlagsChanged:
      _handle_modifier_event(event);
      break;
    case kCGEventKeyDown:
      _handle_key_event(event);
      break;
    case kCGEventLeftMouseDown:
      _handle_mouse_leftdown_event(event);
      break;
    case kCGEventLeftMouseUp:
      _handle_mouse_leftup_event(event);
      break;
    case kCGEventLeftMouseDragged:
      _handle_mouse_leftdragged_event(event);
      break;
    default:
      break;
  };
}

void KMHookMacOS::_handle_modifier_event(CGEventRef event) {
  // Only double check the modifier key

  CGEventFlags flags = CGEventGetFlags(event);

  flags &= kCGEventFlagMaskShift | kCGEventFlagMaskControl |
           kCGEventFlagMaskAlternate | kCGEventFlagMaskCommand;

  if (!flags) {
    return;
  }

  auto now = _now_msec();
  if (now - _cacheLastModifierInterval > _double_click_interval ||
      flags != _cacheLastModifierFlag) {
    // 超时或者按键发生变化
    _cacheModifierKey = "";
  }

  if (_cacheLastModifierFlag & ~flags) {
    // 释放了按键
    flags = 0;
    _cacheLastModifierFlag = 0;
    _cacheModifierKey = "";
  } else {
    _cacheLastModifierFlag = flags;
  }

  switch (flags) {
    case kCGEventFlagMaskShift:
      _cacheModifierKey += std::to_string(kCGEventFlagMaskShift) + "+";
      _cacheLastModifierInterval = now;
      break;
    case kCGEventFlagMaskControl:
      _cacheModifierKey += std::to_string(kCGEventFlagMaskControl) + "+";
      _cacheLastModifierInterval = now;
      break;
    case kCGEventFlagMaskAlternate:
      _cacheModifierKey += std::to_string(kCGEventFlagMaskAlternate) + "+";
      _cacheLastModifierInterval = now;
      break;
    case kCGEventFlagMaskCommand:
      _cacheModifierKey += std::to_string(kCGEventFlagMaskCommand) + "+";
      _cacheLastModifierInterval = now;
      break;
    default:
      // 按下了其他按键
      _cacheModifierKey = "";
      _cacheLastModifierInterval = 0;
      break;
  }

  std::string keys = _cacheModifierKey;
  if (!(keys.empty()) && keys.back() == '+') {
    keys.pop_back();
  }
  keys = _get_wrapper_key(std::move(keys));
  if (!keys.empty()) this->_excute_key_event(keys);
}

void KMHookMacOS::_handle_key_event(CGEventRef event) {
  CGKeyCode keyCode = static_cast<CGKeyCode>(
      CGEventGetIntegerValueField(event, kCGKeyboardEventKeycode));
  CGEventFlags flags = CGEventGetFlags(event);

  auto now = _now_msec();

  if (now - _cacheKeyInterval > _double_click_interval) {
    _cacheKey = "";
  }

  _cacheKey += std::to_string(keyCode) + "+";
  _cacheKeyInterval = now;

  std::string keys;
  if (flags & kCGEventFlagMaskControl)
    keys += std::to_string(kCGEventFlagMaskControl) + "+";
  if (flags & kCGEventFlagMaskShift)
    keys += std::to_string(kCGEventFlagMaskShift) + "+";
  if (flags & kCGEventFlagMaskAlternate)
    keys += std::to_string(kCGEventFlagMaskAlternate) + "+";
  if (flags & kCGEventFlagMaskCommand)
    keys += std::to_string(kCGEventFlagMaskCommand) + "+";

  keys += _cacheKey;

  if (!keys.empty() && keys.back() == '+') {
    keys.pop_back();
  }

  keys = _get_wrapper_key(std::move(keys));

  if (!keys.empty()) this->_excute_key_event(keys);
}

void KMHookMacOS::_handle_mouse_leftdown_event(CGEventRef event) {
  this->_excute_mouse_event(MouseEventType::kLeftDown,
                            GetMouseEventInfo(event));
}

void KMHookMacOS::_handle_mouse_leftup_event(CGEventRef event) {
  this->_excute_mouse_event(MouseEventType::kLeftUp, GetMouseEventInfo(event));
}

void KMHookMacOS::_handle_mouse_leftdragged_event(CGEventRef event) {
  this->_excute_mouse_event(MouseEventType::kLeftDragged,
                            GetMouseEventInfo(event));
}

void KMHookMacOS::Start() {
  if (this->_runLoopSource) {
    return;
  }

  this->_eventTap = CGEventTapCreate(kCGSessionEventTap, kCGHeadInsertEventTap,
                                     kCGEventTapOptionDefault, this->_eventMask,
                                     &KMHookMacOS::event_callback, this);

  if (!this->_eventTap) {
    return;
  }

  this->_runLoopSource =
      CFMachPortCreateRunLoopSource(kCFAllocatorDefault, this->_eventTap, 0);
  CFRunLoopAddSource(CFRunLoopGetCurrent(), this->_runLoopSource,
                     kCFRunLoopCommonModes);
  CGEventTapEnable(this->_eventTap, true);
}

void KMHookMacOS::Stop() {
  if (!this->_runLoopSource) {
    return;
  }
  if (_start_with_loop) {
    CFRunLoopStop(CFRunLoopGetCurrent());
  }

  CFRelease(this->_eventTap);
  CFRelease(this->_runLoopSource);

  this->_eventTap = NULL;
  this->_runLoopSource = NULL;
  this->_start_with_loop = false;
}

void KMHookMacOS::StartWithLoop() {
  this->Start();
  _start_with_loop = true;
  CFRunLoopRun();
}