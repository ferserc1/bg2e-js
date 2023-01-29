#!/bin/sh

clean_example() {
    name=$1
    rm -rf examples/$name/dist
    rm -rf examples/$name/node_modules
}

clean_example 00_math
clean_example 01_tools
clean_example 02_load_model_basic
clean_example 03_base
clean_example 04_scene_load_0
clean_example 05_app
clean_example 06_present_texture
clean_example 07_webgl
clean_example 08_merge_textures
clean_example 09_process_detection
clean_example 10_render_state_basic
clean_example 11_webgl_shader_utils
clean_example 12_render_to_texture
clean_example 13_render_to_cubemap
clean_example 14_sky_sphere
clean_example 15_sky_cube
clean_example 16_env_renderer
clean_example 17_pbr_basic
clean_example 18_pbr_ibl
clean_example 19_render_queue
clean_example 20_scene_renderer
clean_example 21_scene_app_controller
clean_example 22_scene_load_1