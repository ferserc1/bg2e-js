#!/bin/sh

build_example() {
    name=$1
    cd examples/$name
    npm run build
    cd -
}


build_example 00_math
build_example 01_tools
build_example 02_load_model_basic
build_example 03_base
build_example 04_scene_load_0
build_example 05_app
build_example 06_present_texture
build_example 07_webgl
build_example 08_merge_textures
build_example 09_process_detection
build_example 10_render_state_basic
build_example 11_webgl_shader_utils
build_example 12_render_to_texture
build_example 13_render_to_cubemap
build_example 14_sky_sphere
build_example 15_sky_cube
build_example 16_env_renderer
build_example 17_pbr_basic
build_example 18_pbr_ibl
build_example 19_render_queue
build_example 20_scene_renderer
build_example 21_scene_app_controller
build_example 22_scene_load_1
