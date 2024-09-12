/* tslint:disable */
/* eslint-disable */
/**
* Set up a logging layer that direct logs to the browser's console.
*/
export function setup_logging(): void;
/**
* @param {(MessageEvent)[]} queued_events
* @returns {Promise<void>}
*/
export function run_worker(queued_events: (MessageEvent)[]): Promise<void>;
/**
* Type of worker to run lumina in. Allows overriding automatically detected worker kind
* (which should usually be appropriate).
*/
export enum NodeWorkerKind {
/**
* Run in [`SharedWorker`]
*
* [`SharedWorker`]: https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
*/
  Shared = 0,
/**
* Run in [`Worker`]
*
* [`Worker`]: https://developer.mozilla.org/en-US/docs/Web/API/Worker
*/
  Dedicated = 1,
}
/**
* Supported Celestia networks.
*/
export enum Network {
/**
* Celestia mainnet.
*/
  Mainnet = 0,
/**
* Arabica testnet.
*/
  Arabica = 1,
/**
* Mocha testnet.
*/
  Mocha = 2,
/**
* Private local network.
*/
  Private = 3,
}
/**
*/
export class ConnectionCountersSnapshot {
  free(): void;
/**
*/
  num_connections: number;
/**
*/
  num_established: number;
/**
*/
  num_established_incoming: number;
/**
*/
  num_established_outgoing: number;
/**
*/
  num_pending: number;
/**
*/
  num_pending_incoming: number;
/**
*/
  num_pending_outgoing: number;
}
/**
*/
export class NetworkInfoSnapshot {
  free(): void;
/**
*/
  num_peers: number;
}
/**
* `NodeDriver` represents lumina node running in a dedicated Worker/SharedWorker.
* It's responsible for sending commands and receiving responses from the node.
*/
export class NodeClient {
  free(): void;
/**
* Create a new connection to a Lumina node running in a Shared Worker.
* Note that single Shared Worker can be accessed from multiple tabs, so Lumina may
* already have been started. Otherwise it needs to be started with [`NodeDriver::start`].
*
* Requires serving a worker script and providing an url to it. The script should look like
* so (the import statement may vary depending on your js-bundler):
* ```js
* import init, { run_worker } from 'lumina_node_wasm.js';
*
* Error.stackTraceLimit = 99;
*
* // for SharedWorker we queue incoming connections
* // for dedicated Worker we queue incoming messages (coming from the single client)
* let queued = [];
* if (typeof SharedWorkerGlobalScope !== 'undefined' && self instanceof SharedWorkerGlobalScope) {
*   onconnect = (event) => {
*     queued.push(event)
*   }
* } else {
*   onmessage = (event) => {
*     queued.push(event);
*   }
* }
*
* init().then(() => {
*   console.log("starting worker, queued messages: ", queued.length);
*   run_worker(queued);
* })
* ```
* @param {string} worker_script_url
* @param {NodeWorkerKind | undefined} [worker_type]
*/
  constructor(worker_script_url: string, worker_type?: NodeWorkerKind);
/**
* Check whether Lumina is currently running
* @returns {Promise<boolean>}
*/
  is_running(): Promise<boolean>;
/**
* Start a node with the provided config, if it's not running
* @param {NodeConfig} config
* @returns {Promise<void>}
*/
  start(config: NodeConfig): Promise<void>;
/**
* Get node's local peer ID.
* @returns {Promise<string>}
*/
  local_peer_id(): Promise<string>;
/**
* Get current [`PeerTracker`] info.
* @returns {Promise<any>}
*/
  peer_tracker_info(): Promise<any>;
/**
* Wait until the node is connected to at least 1 peer.
* @returns {Promise<void>}
*/
  wait_connected(): Promise<void>;
/**
* Wait until the node is connected to at least 1 trusted peer.
* @returns {Promise<void>}
*/
  wait_connected_trusted(): Promise<void>;
/**
* Get current network info.
* @returns {Promise<NetworkInfoSnapshot>}
*/
  network_info(): Promise<NetworkInfoSnapshot>;
/**
* Get all the multiaddresses on which the node listens.
* @returns {Promise<Array<any>>}
*/
  listeners(): Promise<Array<any>>;
/**
* Get all the peers that node is connected to.
* @returns {Promise<Array<any>>}
*/
  connected_peers(): Promise<Array<any>>;
/**
* Trust or untrust the peer with a given ID.
* @param {string} peer_id
* @param {boolean} is_trusted
* @returns {Promise<void>}
*/
  set_peer_trust(peer_id: string, is_trusted: boolean): Promise<void>;
/**
* Request the head header from the network.
* @returns {Promise<any>}
*/
  request_head_header(): Promise<any>;
/**
* Request a header for the block with a given hash from the network.
* @param {string} hash
* @returns {Promise<any>}
*/
  request_header_by_hash(hash: string): Promise<any>;
/**
* Request a header for the block with a given height from the network.
* @param {bigint} height
* @returns {Promise<any>}
*/
  request_header_by_height(height: bigint): Promise<any>;
/**
* Request headers in range (from, from + amount] from the network.
*
* The headers will be verified with the `from` header.
* @param {any} from_header
* @param {bigint} amount
* @returns {Promise<Array<any>>}
*/
  request_verified_headers(from_header: any, amount: bigint): Promise<Array<any>>;
/**
* Get current header syncing info.
* @returns {Promise<any>}
*/
  syncer_info(): Promise<any>;
/**
* Get the latest header announced in the network.
* @returns {Promise<any>}
*/
  get_network_head_header(): Promise<any>;
/**
* Get the latest locally synced header.
* @returns {Promise<any>}
*/
  get_local_head_header(): Promise<any>;
/**
* Get a synced header for the block with a given hash.
* @param {string} hash
* @returns {Promise<any>}
*/
  get_header_by_hash(hash: string): Promise<any>;
/**
* Get a synced header for the block with a given height.
* @param {bigint} height
* @returns {Promise<any>}
*/
  get_header_by_height(height: bigint): Promise<any>;
/**
* Get synced headers from the given heights range.
*
* If start of the range is undefined (None), the first returned header will be of height 1.
* If end of the range is undefined (None), the last returned header will be the last header in the
* store.
*
* # Errors
*
* If range contains a height of a header that is not found in the store.
* @param {bigint | undefined} [start_height]
* @param {bigint | undefined} [end_height]
* @returns {Promise<Array<any>>}
*/
  get_headers(start_height?: bigint, end_height?: bigint): Promise<Array<any>>;
/**
* Get data sampling metadata of an already sampled height.
* @param {bigint} height
* @returns {Promise<any>}
*/
  get_sampling_metadata(height: bigint): Promise<any>;
/**
* Requests SharedWorker running lumina to close. Any events received afterwards wont
* be processed and new NodeClient needs to be created to restart a node.
* @returns {Promise<void>}
*/
  close(): Promise<void>;
/**
* Returns a [`BroadcastChannel`] for events generated by [`Node`].
* @returns {Promise<BroadcastChannel>}
*/
  events_channel(): Promise<BroadcastChannel>;
}
/**
* Config for the lumina wasm node.
*/
export class NodeConfig {
  free(): void;
/**
* Get the configuration with default bootnodes for provided network
* @param {Network} network
* @returns {NodeConfig}
*/
  static default(network: Network): NodeConfig;
/**
* A list of bootstrap peers to connect to.
*/
  bootnodes: (string)[];
/**
* A network to connect to.
*/
  network: Network;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_nodeconfig_free: (a: number) => void;
  readonly __wbg_get_nodeconfig_network: (a: number) => number;
  readonly __wbg_set_nodeconfig_network: (a: number, b: number) => void;
  readonly __wbg_get_nodeconfig_bootnodes: (a: number, b: number) => void;
  readonly __wbg_set_nodeconfig_bootnodes: (a: number, b: number, c: number) => void;
  readonly __wbg_nodeclient_free: (a: number) => void;
  readonly nodeclient_new: (a: number, b: number, c: number) => number;
  readonly nodeclient_is_running: (a: number) => number;
  readonly nodeclient_start: (a: number, b: number) => number;
  readonly nodeclient_local_peer_id: (a: number) => number;
  readonly nodeclient_peer_tracker_info: (a: number) => number;
  readonly nodeclient_wait_connected: (a: number) => number;
  readonly nodeclient_wait_connected_trusted: (a: number) => number;
  readonly nodeclient_network_info: (a: number) => number;
  readonly nodeclient_listeners: (a: number) => number;
  readonly nodeclient_connected_peers: (a: number) => number;
  readonly nodeclient_set_peer_trust: (a: number, b: number, c: number, d: number) => number;
  readonly nodeclient_request_head_header: (a: number) => number;
  readonly nodeclient_request_header_by_hash: (a: number, b: number, c: number) => number;
  readonly nodeclient_request_header_by_height: (a: number, b: number) => number;
  readonly nodeclient_request_verified_headers: (a: number, b: number, c: number) => number;
  readonly nodeclient_syncer_info: (a: number) => number;
  readonly nodeclient_get_network_head_header: (a: number) => number;
  readonly nodeclient_get_local_head_header: (a: number) => number;
  readonly nodeclient_get_header_by_hash: (a: number, b: number, c: number) => number;
  readonly nodeclient_get_header_by_height: (a: number, b: number) => number;
  readonly nodeclient_get_headers: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly nodeclient_get_sampling_metadata: (a: number, b: number) => number;
  readonly nodeclient_close: (a: number) => number;
  readonly nodeclient_events_channel: (a: number) => number;
  readonly nodeconfig_default: (a: number) => number;
  readonly __wbg_networkinfosnapshot_free: (a: number) => void;
  readonly __wbg_connectioncounterssnapshot_free: (a: number) => void;
  readonly __wbg_get_connectioncounterssnapshot_num_connections: (a: number) => number;
  readonly __wbg_set_connectioncounterssnapshot_num_connections: (a: number, b: number) => void;
  readonly __wbg_get_connectioncounterssnapshot_num_pending: (a: number) => number;
  readonly __wbg_set_connectioncounterssnapshot_num_pending: (a: number, b: number) => void;
  readonly __wbg_get_connectioncounterssnapshot_num_pending_incoming: (a: number) => number;
  readonly __wbg_set_connectioncounterssnapshot_num_pending_incoming: (a: number, b: number) => void;
  readonly __wbg_get_connectioncounterssnapshot_num_pending_outgoing: (a: number) => number;
  readonly __wbg_set_connectioncounterssnapshot_num_pending_outgoing: (a: number, b: number) => void;
  readonly __wbg_get_connectioncounterssnapshot_num_established_incoming: (a: number) => number;
  readonly __wbg_set_connectioncounterssnapshot_num_established_incoming: (a: number, b: number) => void;
  readonly __wbg_get_connectioncounterssnapshot_num_established_outgoing: (a: number) => number;
  readonly __wbg_set_connectioncounterssnapshot_num_established_outgoing: (a: number, b: number) => void;
  readonly __wbg_get_connectioncounterssnapshot_num_established: (a: number) => number;
  readonly __wbg_set_connectioncounterssnapshot_num_established: (a: number, b: number) => void;
  readonly __wbg_get_networkinfosnapshot_num_peers: (a: number) => number;
  readonly __wbg_set_networkinfosnapshot_num_peers: (a: number, b: number) => void;
  readonly setup_logging: () => void;
  readonly run_worker: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7015bb73d8aa3e33: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h41d34f09bc82b05b: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h118e93fdb3f6cf94: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha5829e1414ecaafa: (a: number, b: number, c: number, d: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hc0d0f63d2993c8a3: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7421feea5f021dd9: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h14c1333bdc554c2a: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h88226fcd62b5b49e: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__haf6e84eb60f57c83: (a: number, b: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h25a71c740174a791: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
