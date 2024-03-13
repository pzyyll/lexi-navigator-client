#ifndef KMHOOK_WIN_H
#define KMHOOK_WIN_H

#include <Windows.h>

#include <iostream>

#include "kmhook_base.h"

namespace kmhook {

class KMHookWin : public KMHookBase {
 public:
  KMHookWin();
  ~KMHookWin();

  void Start() override;
  void Stop() override;
  void StartWithLoop() override;

 private:
}

}  // namespace kmhook

#endif  // KMHOOK_WIN_H