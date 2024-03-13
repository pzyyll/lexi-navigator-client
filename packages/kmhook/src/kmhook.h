#ifndef KM_HOOK_H
#define KM_HOOK_H

#include <memory>

#include "kmhook_base.h"
#include "kmhook_def.h"

#ifdef __APPLE__
#include "kmhook_macos.h"
#elif _WIN32
// todo
#elif __linux__
// todo
#endif

namespace kmhook {

static std::unique_ptr<KMHookBase> CreateKMHook() {

#ifdef __APPLE__
  return std::make_unique<KMHookMacOS>();
#elif _WIN32
//todo
#elif __linux__
//todo 
#endif

}

}

#endif  // KM_HOOK_H