cmake_minimum_required(VERSION 3.12)

project(kmhook VERSION 1.0)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 添加 src 目录下的源文件
file(GLOB SOURCES "src/*.cpp")

# 添加头文件的搜索目录
include_directories(${PROJECT_SOURCE_DIR}/src)
include_directories(${PROJECT_SOURCE_DIR}/node_modules/node-addon-api)

# 指定库文件搜索路径（如果有外部库的话）
# link_directories(${PROJECT_SOURCE_DIR}/libs/lib)

# 指定头文件搜索路径（如果有外部头文件的话）
include_directories(${PROJECT_SOURCE_DIR}/libs/include)

# 生成可执行文件
add_executable(test test.cpp ${SOURCES})

if(APPLE)
    find_library(APPLICATION_SERVICES_FRAMEWORK ApplicationServices REQUIRED)
    if (APPLICATION_SERVICES_FRAMEWORK)
        target_link_libraries(test "${APPLICATION_SERVICES_FRAMEWORK}")
    endif()
endif()