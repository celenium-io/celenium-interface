import * as wasm from "./lumina_node_wasm_bg.wasm"
import { __wbg_set_wasm } from "./lumina_node_wasm_bg.js"

__wbg_set_wasm(wasm)
export * from "./lumina_node_wasm_bg.js"

wasm.__wbindgen_start()
