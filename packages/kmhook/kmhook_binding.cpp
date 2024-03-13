#include <napi.h>

#include <iostream>
#include <memory>

#include "kmhook.h"

class KMHookWrapper : public Napi::ObjectWrap<KMHookWrapper> {
 public:
  using CallbackRef = Napi::Reference<Napi::Function>;

  static void log(const auto& info, const std::string& msg) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    auto global = env.Global();
    auto console = global.Get("console").As<Napi::Object>();
    auto log = console.Get("log").As<Napi::Function>();
    log.Call(console, {Napi::String::New(env, msg)});
  }

  static Napi::Object Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env, "KMHook",
        {
            InstanceMethod("RegisterShortcut",
                           &KMHookWrapper::RegisterShortcut),
            InstanceMethod("UnregisterShortcut",
                           &KMHookWrapper::UnregisterShortcut),
            InstanceMethod("UnregisterAllShortcuts",
                           &KMHookWrapper::UnregisterAllShortcuts),
            InstanceMethod("RegisterMouseEvent",
                           &KMHookWrapper::RegisterMouseEvent),
            InstanceMethod("UnregisterMouseEvent",
                           &KMHookWrapper::UnregisterMouseEvent),
            InstanceMethod("UnregisterAllMouse",
                           &KMHookWrapper::UnregisterAllMouse),
            InstanceMethod("Start", &KMHookWrapper::Start),
            InstanceMethod("Stop", &KMHookWrapper::Stop),
            InstanceMethod("StartWithLoop", &KMHookWrapper::StartWithLoop),
            InstanceMethod("SetDoubleClickInterval",
                           &KMHookWrapper::SetDoubleClickInterval),
            InstanceMethod("TestCallback", &KMHookWrapper::TestCallback),
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("KMHook", func);
    exports.Set("MouseLeftDown",
                Napi::Number::New(env, kmhook::MouseEventType::kLeftDown));
    exports.Set("MouseLeftUp",
                Napi::Number::New(env, kmhook::MouseEventType::kLeftUp));
    exports.Set("MouseLeftDrag",
                Napi::Number::New(env, kmhook::MouseEventType::kLeftDragged));
    return exports;
  };

  KMHookWrapper(const Napi::CallbackInfo& info)
      : Napi::ObjectWrap<KMHookWrapper>(info),
        _kmhook(nullptr),
        _shortcut_cbs() {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    this->_kmhook = kmhook::CreateKMHook();
  }

  ~KMHookWrapper() {
    this->_kmhook->Stop();
    this->_kmhook.reset();
  }

 private:
  static Napi::FunctionReference constructor;
  std::unique_ptr<kmhook::KMHookBase> _kmhook;
  std::map<std::string, CallbackRef> _shortcut_cbs;
  std::map<kmhook::ID, CallbackRef> _mouse_cbs;

  bool CheckArgsLenght(const Napi::CallbackInfo& info, std::size_t length) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (info.Length() < length) {
      Napi::TypeError::New(env, "Wrong number of arguments")
          .ThrowAsJavaScriptException();
      return false;
    }
    return true;
  }

  bool CheckArgIsString(const Napi::CallbackInfo& info, int index) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (!info[index].IsString()) {
      std::string err = "Argument: location { " + std::to_string(index) +
                        " } must be a string";
      Napi::TypeError::New(env, err).ThrowAsJavaScriptException();
      return false;
    }
    return true;
  }

  bool CheckArgIsFunction(const Napi::CallbackInfo& info, int index) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (!info[index].IsFunction()) {
      std::string err = "Argument: location { " + std::to_string(index) +
                        " } must be a function";
      Napi::TypeError::New(env, err).ThrowAsJavaScriptException();
      return false;
    }
    return true;
  }

  bool CheckArgIsNumber(const Napi::CallbackInfo& info, int index) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (!info[index].IsNumber()) {
      std::string err = "Argument: location { " + std::to_string(index) +
                        " } must be a number";
      Napi::TypeError::New(env, err).ThrowAsJavaScriptException();
      return false;
    }
    return true;
  }

  // Binding methods
  Napi::Value RegisterShortcut(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    KMHookWrapper::log(info, "RegisterShortcut");

    if (!CheckArgsLenght(info, 2)) {
      return env.Null();
    }

    // 提取参数并进行类型检查
    if (!CheckArgIsString(info, 0)) {
      return env.Null();
    }

    if (!CheckArgIsFunction(info, 1)) {
      return env.Null();
    }

    std::string shortcut = info[0].As<Napi::String>().Utf8Value();
    Napi::Function callback = info[1].As<Napi::Function>();

    this->SafeUnregisterShoutcutRef(shortcut);

    this->_shortcut_cbs[shortcut] = Napi::Persistent(callback);
    auto& cb_ref = this->_shortcut_cbs[shortcut];

    this->_kmhook->RegisterShortcut(shortcut, [shortcut, &cb_ref, this]() {
      if (cb_ref.IsEmpty()) {
        this->SafeUnregisterShoutcutRef(shortcut);
        return;
      }
      KMHookWrapper::log(cb_ref, std::string("callback: ") + shortcut);
      Napi::Env env = cb_ref.Env();
      Napi::HandleScope scope(env);
      const auto& callback = cb_ref.Value();
      callback.Call(env.Global(), {});
    });
    return env.Undefined();
  }

  Napi::Value UnregisterShortcut(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (!CheckArgsLenght(info, 1)) {
      return env.Null();
    }

    if (!CheckArgIsString(info, 0)) {
      return env.Null();
    }

    std::string shortcut = info[0].As<Napi::String>().Utf8Value();
    this->SafeUnregisterShoutcutRef(shortcut);
    return env.Undefined();
  }

  CallbackRef& GetShortcutCallbackRef(const std::string& shortcut) {
    static CallbackRef empty;
    auto it = this->_shortcut_cbs.find(shortcut);
    if (it != this->_shortcut_cbs.end()) {
      return it->second;
    }
    return empty;
  }

  void SafeUnregisterShoutcutRef(const std::string& shortcut) {
    auto it = this->_shortcut_cbs.find(shortcut);
    if (it != this->_shortcut_cbs.end()) {
      it->second.Unref();
      this->_shortcut_cbs.erase(it);
    }
    this->_kmhook->UnregisterShortcut(shortcut);
  }

  Napi::Value UnregisterAllShortcuts(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    this->_kmhook->UnregisterAllShortcuts();
    for (auto& it : this->_shortcut_cbs) {
      it.second.Unref();
    }
    this->_shortcut_cbs.clear();
    return env.Undefined();
  }

  CallbackRef& GetMouseCallbackRef(kmhook::ID id) {
    static CallbackRef empty;
    auto it = this->_mouse_cbs.find(id);
    if (it != this->_mouse_cbs.end()) {
      return it->second;
    }
    return empty;
  }

  void SafeUnregisterMouseRef(kmhook::ID id) {
    auto it = this->_mouse_cbs.find(id);
    if (it != this->_mouse_cbs.end()) {
      it->second.Unref();
      this->_mouse_cbs.erase(it);
    }
    this->_kmhook->UnregisterMouseEvent(id);
  }

  Napi::Value RegisterMouseEvent(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);

    if (!CheckArgsLenght(info, 2)) {
      return env.Null();
    }
    if (!CheckArgIsNumber(info, 0)) {
      return env.Null();
    }
    if (!CheckArgIsFunction(info, 1)) {
      return env.Null();
    }
    kmhook::MouseEventType event_ty = static_cast<kmhook::MouseEventType>(
        info[0].As<Napi::Number>().Int32Value());
    Napi::Function callback = info[1].As<Napi::Function>();
    CallbackRef cb_ref = Napi::Persistent(callback);

    kmhook::ID id = this->_kmhook->RegisterMouseEvent(
        event_ty, [this](kmhook::ID id, kmhook::MouseEvent event) {
          const auto& cb_ref = this->GetMouseCallbackRef(id);
          if (cb_ref.IsEmpty()) {
            this->SafeUnregisterMouseRef(id);
            return;
          }
          Napi::Env env = cb_ref.Env();
          Napi::HandleScope scope(env);
          const auto& callback = cb_ref.Value();
          Napi::Object obj = Napi::Object::New(env);
          Napi::Object pos = Napi::Object::New(env);
          pos.Set("x", Napi::Number::New(env, event.point.x));
          pos.Set("y", Napi::Number::New(env, event.point.y));
          obj.Set("point", pos);
          callback.Call(env.Global(), {obj});
        });

    this->_mouse_cbs[id] = std::move(cb_ref);
    return Napi::Number::New(env, id);
  }

  Napi::Value UnregisterMouseEvent(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (!CheckArgsLenght(info, 1)) {
      return env.Null();
    }
    if (!CheckArgIsNumber(info, 0)) {
      return env.Null();
    }
    kmhook::ID id = info[0].As<Napi::Number>().Int32Value();
    this->SafeUnregisterMouseRef(id);
    return env.Undefined();
  }

  Napi::Value UnregisterAllMouse(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    this->_kmhook->UnregisterAllMouse();
    for (auto& it : this->_mouse_cbs) {
      it.second.Unref();
    }
    this->_mouse_cbs.clear();
    return env.Undefined();
  }

  Napi::Value Start(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    try {
      this->_kmhook->Start();
    } catch (const std::exception& e) {
      Napi::Error::New(env, e.what()).ThrowAsJavaScriptException();
    }
    return env.Undefined();
  }
  Napi::Value Stop(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    this->_kmhook->Stop();
    return env.Undefined();
  }
  Napi::Value StartWithLoop(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    this->_kmhook->StartWithLoop();
    return env.Undefined();
  }
  Napi::Value SetDoubleClickInterval(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (!CheckArgsLenght(info, 1)) {
      return env.Null();
    }
    if (!CheckArgIsNumber(info, 0)) {
      return env.Null();
    }
    unsigned int interval = info[0].As<Napi::Number>().Uint32Value();
    this->_kmhook->SetDoubleClickInterval(interval);
    return env.Undefined();
  }

  Napi::Value TestCallback(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::HandleScope scope(env);
    if (!CheckArgsLenght(info, 1)) {
      return env.Null();
    }
    if (!CheckArgIsFunction(info, 0)) {
      return env.Null();
    }
    Napi::Function callback = info[0].As<Napi::Function>();
    callback.Call(env.Global(), {});
    return env.Undefined();
  }
  // Additional methods as needed...
};

Napi::FunctionReference KMHookWrapper::constructor;

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  return KMHookWrapper::Init(env, exports);
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)