import { NodeWorker } from "~/services/lumina-node-wasm/lumina_node_wasm.d.ts"

Error.stackTraceLimit = 99

const worker = new NodeWorker(self)

worker.run()
