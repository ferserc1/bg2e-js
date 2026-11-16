#include <bg2e/base/TextRasterizer.hpp>
#include <fstream>
#include <iostream>
#include <iterator>
int main(int argc, char** argv) {
    std::ifstream file(argv[1], std::ios::binary);
    std::vector<uint8_t> bytes((std::istreambuf_iterator<char>(file)), {});
    auto font = bg2e::base::TextFont::load(bytes.data(), bytes.size());
    if (!font) return 1;
    bg2e::base::Text::Parameters p;
    p.content = "Hello World"; p.fontIdentifier = "tutorial"; p.fontSize = 160;
    p.paragraphSize = {1024,256}; p.bitmapResolution = {2048,512}; p.margins = {24,24,24,24};
    p.alignment = bg2e::base::Text::Alignment::Center; p.verticalAlignment = bg2e::base::Text::VerticalAlignment::Center;
    auto r = bg2e::base::TextRasterizer::rasterize(bg2e::base::Text(p), *font);
    std::ofstream out(argv[2], std::ios::binary); out.write((char*)r.rgba.data(), r.rgba.size());
    std::cout << r.width << "x" << r.height << " " << r.layout.lines[0].width << " " << r.layout.lines[0].baseline << "\n";
}
