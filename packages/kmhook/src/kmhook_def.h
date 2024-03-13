#ifndef kmhook_def_h
#define kmhook_def_h

#include <any>
#include <functional>
#include <map>

namespace kmhook {

const unsigned int kDefaultKeyInterval = 500;
const unsigned int kDoubleClickMinInterval = 100;
const unsigned int kDoubleClickMaxInterval = 1000;

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

const std::map<std::string, CGKeyCode> kKeyCodeMap = {
    {"a", kVK_ANSI_A},
    {"s", kVK_ANSI_S},
    {"d", kVK_ANSI_D},
    {"f", kVK_ANSI_F},
    {"h", kVK_ANSI_H},
    {"g", kVK_ANSI_G},
    {"z", kVK_ANSI_Z},
    {"x", kVK_ANSI_X},
    {"c", kVK_ANSI_C},
    {"v", kVK_ANSI_V},
    {"b", kVK_ANSI_B},
    {"q", kVK_ANSI_Q},
    {"w", kVK_ANSI_W},
    {"e", kVK_ANSI_E},
    {"r", kVK_ANSI_R},
    {"y", kVK_ANSI_Y},
    {"t", kVK_ANSI_T},
    {"1", kVK_ANSI_1},
    {"2", kVK_ANSI_2},
    {"3", kVK_ANSI_3},
    {"4", kVK_ANSI_4},
    {"5", kVK_ANSI_5},
    {"6", kVK_ANSI_6},
    {"7", kVK_ANSI_7},
    {"8", kVK_ANSI_8},
    {"9", kVK_ANSI_9},
    {"0", kVK_ANSI_0},
    {"i", kVK_ANSI_I},
    {"o", kVK_ANSI_O},
    {"p", kVK_ANSI_P},
    {"l", kVK_ANSI_L},
    {"j", kVK_ANSI_J},
    {"k", kVK_ANSI_K},
    {"n", kVK_ANSI_N},
    {"m", kVK_ANSI_M},
    {"u", kVK_ANSI_U},

    // 添加额外的按键映射
    {"`", kVK_ANSI_Grave},
    {"-", kVK_ANSI_Minus},
    {"=", kVK_ANSI_Equal},
    {"[", kVK_ANSI_LeftBracket},
    {"]", kVK_ANSI_RightBracket},
    {"\\", kVK_ANSI_Backslash},
    {";", kVK_ANSI_Semicolon},
    {"'", kVK_ANSI_Quote},
    {",", kVK_ANSI_Comma},
    {".", kVK_ANSI_Period},
    {"/", kVK_ANSI_Slash},

    // 调整的功能键映射
    {"delete", kVK_Delete},
    {"forward_delete", kVK_ForwardDelete},
    {"return", kVK_Return},
    {"tab", kVK_Tab},
    {"space", kVK_Space},
    {"escape", kVK_Escape},
    {"left", kVK_LeftArrow},
    {"right", kVK_RightArrow},
    {"up", kVK_UpArrow},
    {"down", kVK_DownArrow},
};

// Invert the kModifierMap
const std::map<std::string, CGEventFlags> kModifierMap = {
    {"shift", kCGEventFlagMaskShift},
    {"control", kCGEventFlagMaskControl},
    {"option", kCGEventFlagMaskAlternate},
    {"command", kCGEventFlagMaskCommand},
    {"ctrlorcommand", kCGEventFlagMaskCommand},
};

#elif _WIN32
#include <windows.h>
const std::map<std::string, int> kKeyCodeMap = {
    {"a", VK_A},
    {"s", VK_S},
    {"d", VK_D},
    {"f", VK_F},
    {"h", VK_H},
    {"g", VK_G},
    {"z", VK_Z},
    {"x", VK_X},
    {"c", VK_C},
    {"v", VK_V},
    {"b", VK_B},
    {"q", VK_Q},
    {"w", VK_W},
    {"e", VK_E},
    {"r", VK_R},
    {"y", VK_Y}, // 注意: 在Windows中，没有VK_Y，这里假设与VK_T的行为相同
    {"t", VK_T},
    {"1", VK_1},
    {"2", VK_2},
    {"3", VK_3},
    {"4", VK_4},
    {"5", VK_5},
    {"6", VK_6},
    {"7", VK_7},
    {"8", VK_8},
    {"9", VK_9},
    {"0", VK_0},
    {"i", VK_I},
    {"o", VK_O},
    {"p", VK_P},
    {"l", VK_L},
    {"j", VK_J},
    {"k", VK_K},
    {"n", VK_N},
    {"m", VK_M},
    {"u", VK_U},
    // 添加额外的按键映射
    {"`", VK_OEM_3},
    {"-", VK_OEM_MINUS},
    {"=", VK_OEM_PLUS},
    {"[", VK_OEM_4},
    {"]", VK_OEM_6},
    {"\\", VK_OEM_5},
    {";", VK_OEM_1},
    {"'", VK_OEM_7},
    {",", VK_OEM_COMMA},
    {".", VK_OEM_PERIOD},
    {"/", VK_OEM_2},
    // 调整的功能键映射
    {"delete", VK_BACK},
    {"forward_delete", VK_DELETE},
    {"return", VK_RETURN},
    {"tab", VK_TAB},
    {"space", VK_SPACE},
    {"escape", VK_ESCAPE},
    {"left", VK_LEFT},
    {"right", VK_RIGHT},
    {"up", VK_UP},
    {"down", VK_DOWN},
};

const std::map<int, std::string> kModifierMap = {};
#elif __linux__
// todo
const std::map<int, std::string> kKeyCodeMap = {};
const std::map<int, std::string> kModifierMap = {};
#endif

}  // namespace kmhook

#endif  // kmhook_def_h