{
  "targets": [
    {
      "target_name": "kmhook",
      "sources": [
        "kmhook_binding.cpp"
      ],
      "include_dirs": [
        "node_modules/node-addon-api",
        "src/"
      ],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "conditions": [
        ['OS=="mac"', {
          'cflags+': ['-fvisibility=hidden'],
          "sources": ["src/kmhook_macos.cpp"],
          "xcode_settings": {
            'OTHER_LDFLAGS': [
              "-framework ApplicationServices", 
            ],
            'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES', # -fvisibility=hidden
            "OTHER_CPLUSPLUSFLAGS": ["-std=c++20"],
            "CLANG_CXX_LANGUAGE_STANDARD": "c++20"
          }
        }],
        ['OS=="win"', {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "AdditionalOptions": ["/std:c++20"]
            }
          }
        }],
        ['OS=="linux"', {
          "cflags_cc": ["-std=c++20"]
        }]
      ]
    }
  ]
}
