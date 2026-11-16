#include <emscripten/bind.h>
#include <bg2e/base/TextRasterizer.hpp>
#include <unordered_map>
#include <stdexcept>
using namespace bg2e::base;
using emscripten::val;
namespace {
std::unordered_map<unsigned, std::shared_ptr<const TextFont>> fonts;
unsigned nextId = 1;
unsigned openFont(val bytes, unsigned face) {
    const auto data = emscripten::convertJSArrayToNumberVector<uint8_t>(bytes);
    auto font = TextFont::load(data.data(), data.size(), face);
    if (!font) return 0;
    const auto id = nextId++;
    fonts.emplace(id, std::move(font));
    return id;
}
void closeFont(unsigned id) { fonts.erase(id); }
val rasterize(unsigned id, val input) {
    auto found = fonts.find(id);
    if (found == fonts.end()) throw std::runtime_error("Font handle is unavailable");
    Text::Parameters p;
    p.content = input["content"].as<std::string>();
    p.fontIdentifier = input["fontIdentifier"].as<std::string>();
    p.fontSize = input["fontSize"].as<float>();
    p.lineSpacing = input["lineSpacing"].as<float>();
    p.characterSpacing = input["characterSpacing"].as<float>();
    p.paragraphSize = { input["paragraphSize"]["width"].as<float>(), input["paragraphSize"]["height"].as<float>() };
    p.bitmapResolution = { input["bitmapResolution"]["width"].as<unsigned>(), input["bitmapResolution"]["height"].as<unsigned>() };
    const auto m = input["margins"];
    p.margins = { m["left"].as<float>(), m["top"].as<float>(), m["right"].as<float>(), m["bottom"].as<float>() };
    const auto a = input["alignment"].as<std::string>();
    p.alignment = a == "right" ? Text::Alignment::Right : a == "center" ? Text::Alignment::Center : Text::Alignment::Left;
    const auto v = input["verticalAlignment"].as<std::string>();
    p.verticalAlignment = v == "bottom" ? Text::VerticalAlignment::Bottom : v == "center" ? Text::VerticalAlignment::Center : Text::VerticalAlignment::Top;
    const auto w = input["wrapMode"].as<std::string>();
    p.wrapMode = w == "none" ? Text::WrapMode::None : w == "character" ? Text::WrapMode::Character : Text::WrapMode::Word;
    const auto o = input["overflowPolicy"].as<std::string>();
    p.overflowPolicy = o == "hide" || o == "error" ? Text::OverflowPolicy::Hide : Text::OverflowPolicy::Clip;
    auto result = TextRasterizer::rasterize(Text(std::move(p)), *found->second);
    auto output = val::object();
    output.set("width", result.width); output.set("height", result.height);
    output.set("renderable", result.layout.renderable); output.set("overflowed", result.layout.overflowed);
    output.set("contentWidth", result.layout.contentWidth); output.set("contentHeight", result.layout.contentHeight);
    // Copy before native result destruction; never expose borrowed WASM memory.
    output.set("rgba", val(emscripten::typed_memory_view(result.rgba.size(), result.rgba.data())).call<val>("slice"));
    auto lines = val::array();
    for (const auto& line : result.layout.lines) {
        auto item = val::object();
        item.set("firstGlyph", line.firstGlyph); item.set("glyphCount", line.glyphCount);
        item.set("width", line.width); item.set("baseline", line.baseline); lines.call<void>("push", item);
    }
    output.set("lines", lines);
    auto glyphs = val::array();
    for (const auto& glyph : result.layout.glyphs) {
        auto item = val::object(); item.set("index", glyph.index); item.set("x", glyph.x); item.set("baseline", glyph.baseline);
        glyphs.call<void>("push", item);
    }
    output.set("glyphs", glyphs);
    return output;
}
}
EMSCRIPTEN_BINDINGS(bg2text) {
    emscripten::function("openFont", &openFont);
    emscripten::function("closeFont", &closeFont);
    emscripten::function("rasterize", &rasterize);
}
