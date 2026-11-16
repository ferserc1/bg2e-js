#pragma once
#include <iostream>
namespace bg2e::base::detail { template<class... T> void textWarning(const T&... v) noexcept { try { std::cerr << "Text warning: "; (std::cerr << ... << v); std::cerr << "\n"; } catch (...) {} } }
