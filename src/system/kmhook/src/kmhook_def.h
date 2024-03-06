#ifndef kmhook_def_h
#define kmhook_def_h

#include <any>
#include <functional>
#include <map>

namespace kmhook {

const int kDefaultKeyInterval = 400;

enum MouseEventType { kLeftDown, kLeftUp, kLeftDragged };
using ID = int;

struct KMPoint {
  int x;
  int y;
};

struct MouseEvent {
  KMPoint point;
};

using Callback = std::function<void()>;
using MouseCallback = std::function<void(ID id, const MouseEvent &)>;

struct MouseCallbackInfo {
  ID id;
  MouseCallback callback;
};


#ifdef __APPLE__
#include <ApplicationServices/ApplicationServices.h>
#include <Carbon/Carbon.h>

const std::map<CGKeyCode, std::string> kKeyCodeMap = {
    {kVK_ANSI_A, "a"},
    {kVK_ANSI_S, "s"},
    {kVK_ANSI_D, "d"},
    {kVK_ANSI_F, "f"},
    {kVK_ANSI_H, "h"},
    {kVK_ANSI_G, "g"},
    {kVK_ANSI_Z, "z"},
    {kVK_ANSI_X, "x"},
    {kVK_ANSI_C, "c"},
    {kVK_ANSI_V, "v"},
    {kVK_ANSI_B, "b"},
    {kVK_ANSI_Q, "q"},
    {kVK_ANSI_W, "w"},
    {kVK_ANSI_E, "e"},
    {kVK_ANSI_R, "r"},
    {kVK_ANSI_Y, "y"},
    {kVK_ANSI_T, "t"},
    {kVK_ANSI_1, "1"},
    {kVK_ANSI_2, "2"},
    {kVK_ANSI_3, "3"},
    {kVK_ANSI_4, "4"},
    {kVK_ANSI_5, "5"},
    {kVK_ANSI_6, "6"},
    {kVK_ANSI_7, "7"},
    {kVK_ANSI_8, "8"},
    {kVK_ANSI_9, "9"},
    {kVK_ANSI_0, "0"},
    {kVK_ANSI_I, "i"},
    {kVK_ANSI_O, "o"},
    {kVK_ANSI_P, "p"},
    {kVK_ANSI_L, "l"},
    {kVK_ANSI_J, "j"},
    {kVK_ANSI_K, "k"},
    {kVK_ANSI_N, "n"},
    {kVK_ANSI_M, "m"},
    {kVK_ANSI_U, "u"},

    // 添加额外的按键映射
    {kVK_ANSI_Grave, "`"},
    {kVK_ANSI_Minus, "-"},
    {kVK_ANSI_Equal, "="},
    {kVK_ANSI_LeftBracket, "["},
    {kVK_ANSI_RightBracket, "]"},
    {kVK_ANSI_Backslash, "\\"},
    {kVK_ANSI_Semicolon, ";"},
    {kVK_ANSI_Quote, "'"},
    {kVK_ANSI_Comma, ","},
    {kVK_ANSI_Period, "."},
    {kVK_ANSI_Slash, "/"},

    // 可能需要根据实际需求调整的功能键映射
    {kVK_Delete, "delete"},
    {kVK_ForwardDelete, "forward_delete"},
    {kVK_Return, "return"},
    {kVK_Tab, "tab"},
    {kVK_Space, "space"},
    {kVK_Escape, "escape"},

    // 方向键
    {kVK_LeftArrow, "left"},
    {kVK_RightArrow, "right"},
    {kVK_UpArrow, "up"},
    {kVK_DownArrow, "down"},
};

const std::map<CGEventFlags, std::string> kModifierMap = {
    {kCGEventFlagMaskShift, "shift"},
    {kCGEventFlagMaskControl, "control"},
    {kCGEventFlagMaskAlternate, "option"},
    {kCGEventFlagMaskCommand, "command"}};
#elif _WIN32
// todo
const std::map<int, std::string> kKeyCodeMap = {};
const std::map<int, std::string> kModifierMap = {};
#elif __linux__
// todo
const std::map<int, std::string> kKeyCodeMap = {};
const std::map<int, std::string> kModifierMap = {};
#endif

}  // namespace kmhook

#endif  // kmhook_def_h