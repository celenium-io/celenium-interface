const setInterval = globalThis.setInterval

let wasm

const heap = new Array(128).fill(undefined)

heap.push(undefined, null, true, false)

function getObject(idx) {
	return heap[idx]
}

let WASM_VECTOR_LEN = 0

let cachedUint8Memory0 = null

function getUint8Memory0() {
	if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
		cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer)
	}
	return cachedUint8Memory0
}

const cachedTextEncoder =
	typeof TextEncoder !== "undefined"
		? new TextEncoder("utf-8")
		: {
				encode: () => {
					throw Error("TextEncoder not available")
				},
		  }

const encodeString =
	typeof cachedTextEncoder.encodeInto === "function"
		? function (arg, view) {
				return cachedTextEncoder.encodeInto(arg, view)
		  }
		: function (arg, view) {
				const buf = cachedTextEncoder.encode(arg)
				view.set(buf)
				return {
					read: arg.length,
					written: buf.length,
				}
		  }

function passStringToWasm0(arg, malloc, realloc) {
	if (realloc === undefined) {
		const buf = cachedTextEncoder.encode(arg)
		const ptr = malloc(buf.length, 1) >>> 0
		getUint8Memory0()
			.subarray(ptr, ptr + buf.length)
			.set(buf)
		WASM_VECTOR_LEN = buf.length
		return ptr
	}

	let len = arg.length
	let ptr = malloc(len, 1) >>> 0

	const mem = getUint8Memory0()

	let offset = 0

	for (; offset < len; offset++) {
		const code = arg.charCodeAt(offset)
		if (code > 0x7f) break
		mem[ptr + offset] = code
	}

	if (offset !== len) {
		if (offset !== 0) {
			arg = arg.slice(offset)
		}
		ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0
		const view = getUint8Memory0().subarray(ptr + offset, ptr + len)
		const ret = encodeString(arg, view)

		offset += ret.written
		ptr = realloc(ptr, len, offset, 1) >>> 0
	}

	WASM_VECTOR_LEN = offset
	return ptr
}

function isLikeNone(x) {
	return x === undefined || x === null
}

let cachedInt32Memory0 = null

function getInt32Memory0() {
	if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
		cachedInt32Memory0 = new Int32Array(wasm.memory.buffer)
	}
	return cachedInt32Memory0
}

let heap_next = heap.length

function dropObject(idx) {
	if (idx < 132) return
	heap[idx] = heap_next
	heap_next = idx
}

function takeObject(idx) {
	const ret = getObject(idx)
	dropObject(idx)
	return ret
}

const cachedTextDecoder =
	typeof TextDecoder !== "undefined"
		? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })
		: {
				decode: () => {
					throw Error("TextDecoder not available")
				},
		  }

if (typeof TextDecoder !== "undefined") {
	cachedTextDecoder.decode()
}

function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0
	return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len))
}

function addHeapObject(obj) {
	if (heap_next === heap.length) heap.push(heap.length + 1)
	const idx = heap_next
	heap_next = heap[idx]

	heap[idx] = obj
	return idx
}

let cachedFloat64Memory0 = null

function getFloat64Memory0() {
	if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
		cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer)
	}
	return cachedFloat64Memory0
}

let cachedBigInt64Memory0 = null

function getBigInt64Memory0() {
	if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
		cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer)
	}
	return cachedBigInt64Memory0
}

function debugString(val) {
	// primitive types
	const type = typeof val
	if (type == "number" || type == "boolean" || val == null) {
		return `${val}`
	}
	if (type == "string") {
		return `"${val}"`
	}
	if (type == "symbol") {
		const description = val.description
		if (description == null) {
			return "Symbol"
		} else {
			return `Symbol(${description})`
		}
	}
	if (type == "function") {
		const name = val.name
		if (typeof name == "string" && name.length > 0) {
			return `Function(${name})`
		} else {
			return "Function"
		}
	}
	// objects
	if (Array.isArray(val)) {
		const length = val.length
		let debug = "["
		if (length > 0) {
			debug += debugString(val[0])
		}
		for (let i = 1; i < length; i++) {
			debug += ", " + debugString(val[i])
		}
		debug += "]"
		return debug
	}
	// Test for built-in
	const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val))
	let className
	if (builtInMatches.length > 1) {
		className = builtInMatches[1]
	} else {
		// Failed to match the standard '[object ClassName]'
		return toString.call(val)
	}
	if (className == "Object") {
		// we're a user defined class or Object
		// JSON.stringify avoids problems with cycles, and is generally much
		// easier than looping through ownProperties of `val`.
		try {
			return "Object(" + JSON.stringify(val) + ")"
		} catch (_) {
			return "Object"
		}
	}
	// errors
	if (val instanceof Error) {
		return `${val.name}: ${val.message}\n${val.stack}`
	}
	// TODO we could test for more things here, like `Set`s and `Map`s.
	return className
}

const CLOSURE_DTORS =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((state) => {
				wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
		  })

function makeMutClosure(arg0, arg1, dtor, f) {
	const state = { a: arg0, b: arg1, cnt: 1, dtor }
	const real = (...args) => {
		// First up with a closure we increment the internal reference
		// count. This ensures that the Rust closure environment won't
		// be deallocated while we're invoking it.
		state.cnt++
		const a = state.a
		state.a = 0
		try {
			return f(a, state.b, ...args)
		} finally {
			if (--state.cnt === 0) {
				wasm.__wbindgen_export_2.get(state.dtor)(a, state.b)
				CLOSURE_DTORS.unregister(state)
			} else {
				state.a = a
			}
		}
	}
	real.original = state
	CLOSURE_DTORS.register(real, state, state)
	return real
}
function __wbg_adapter_54(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7015bb73d8aa3e33(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_57(arg0, arg1) {
	wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h41d34f09bc82b05b(
		arg0,
		arg1,
	)
}

function makeClosure(arg0, arg1, dtor, f) {
	const state = { a: arg0, b: arg1, cnt: 1, dtor }
	const real = (...args) => {
		// First up with a closure we increment the internal reference
		// count. This ensures that the Rust closure environment won't
		// be deallocated while we're invoking it.
		state.cnt++
		try {
			return f(state.a, state.b, ...args)
		} finally {
			if (--state.cnt === 0) {
				wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b)
				state.a = 0
				CLOSURE_DTORS.unregister(state)
			}
		}
	}
	real.original = state
	CLOSURE_DTORS.register(real, state, state)
	return real
}
function __wbg_adapter_60(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h118e93fdb3f6cf94(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_63(arg0, arg1, arg2) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
		wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha5829e1414ecaafa(
			retptr,
			arg0,
			arg1,
			addHeapObject(arg2),
		)
		var r0 = getInt32Memory0()[retptr / 4 + 0]
		var r1 = getInt32Memory0()[retptr / 4 + 1]
		if (r1) {
			throw takeObject(r0)
		}
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16)
	}
}

function __wbg_adapter_66(arg0, arg1) {
	wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hc0d0f63d2993c8a3(
		arg0,
		arg1,
	)
}

function __wbg_adapter_69(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7421feea5f021dd9(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_72(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h14c1333bdc554c2a(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_79(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h88226fcd62b5b49e(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_82(arg0, arg1) {
	wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__haf6e84eb60f57c83(
		arg0,
		arg1,
	)
}

let cachedUint32Memory0 = null

function getUint32Memory0() {
	if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
		cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer)
	}
	return cachedUint32Memory0
}

function getArrayJsValueFromWasm0(ptr, len) {
	ptr = ptr >>> 0
	const mem = getUint32Memory0()
	const slice = mem.subarray(ptr / 4, ptr / 4 + len)
	const result = []
	for (let i = 0; i < slice.length; i++) {
		result.push(takeObject(slice[i]))
	}
	return result
}

function passArrayJsValueToWasm0(array, malloc) {
	const ptr = malloc(array.length * 4, 4) >>> 0
	const mem = getUint32Memory0()
	for (let i = 0; i < array.length; i++) {
		mem[ptr / 4 + i] = addHeapObject(array[i])
	}
	WASM_VECTOR_LEN = array.length
	return ptr
}

function _assertClass(instance, klass) {
	if (!(instance instanceof klass)) {
		throw new Error(`expected instance of ${klass.name}`)
	}
	return instance.ptr
}
/**
 * Set up a logging layer that direct logs to the browser's console.
 */
export function setup_logging() {
	wasm.setup_logging()
}

/**
 * @param {(MessageEvent)[]} queued_events
 * @returns {Promise<void>}
 */
export function run_worker(queued_events) {
	const ptr0 = passArrayJsValueToWasm0(queued_events, wasm.__wbindgen_malloc)
	const len0 = WASM_VECTOR_LEN
	const ret = wasm.run_worker(ptr0, len0)
	return takeObject(ret)
}

function handleError(f, args) {
	try {
		return f.apply(this, args)
	} catch (e) {
		wasm.__wbindgen_exn_store(addHeapObject(e))
	}
}

function getArrayU8FromWasm0(ptr, len) {
	ptr = ptr >>> 0
	return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len)
}
function __wbg_adapter_490(arg0, arg1, arg2, arg3) {
	wasm.wasm_bindgen__convert__closures__invoke2_mut__h25a71c740174a791(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3))
}

function notDefined(what) {
	return () => {
		throw new Error(`${what} is not defined`)
	}
}
/**
 * Type of worker to run lumina in. Allows overriding automatically detected worker kind
 * (which should usually be appropriate).
 */
export const NodeWorkerKind = Object.freeze({
	/**
	 * Run in [`SharedWorker`]
	 *
	 * [`SharedWorker`]: https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
	 */
	Shared: 0,
	0: "Shared",
	/**
	 * Run in [`Worker`]
	 *
	 * [`Worker`]: https://developer.mozilla.org/en-US/docs/Web/API/Worker
	 */
	Dedicated: 1,
	1: "Dedicated",
})
/**
 * Supported Celestia networks.
 */
export const Network = Object.freeze({
	/**
	 * Celestia mainnet.
	 */
	Mainnet: 0,
	0: "Mainnet",
	/**
	 * Arabica testnet.
	 */
	Arabica: 1,
	1: "Arabica",
	/**
	 * Mocha testnet.
	 */
	Mocha: 2,
	2: "Mocha",
	/**
	 * Private local network.
	 */
	Private: 3,
	3: "Private",
})

const ConnectionCountersSnapshotFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_connectioncounterssnapshot_free(ptr >>> 0))
/**
 */
export class ConnectionCountersSnapshot {
	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		ConnectionCountersSnapshotFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_connectioncounterssnapshot_free(ptr)
	}
	/**
	 * @returns {number}
	 */
	get num_connections() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_connections(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * @param {number} arg0
	 */
	set num_connections(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_connections(this.__wbg_ptr, arg0)
	}
	/**
	 * @returns {number}
	 */
	get num_pending() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_pending(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * @param {number} arg0
	 */
	set num_pending(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_pending(this.__wbg_ptr, arg0)
	}
	/**
	 * @returns {number}
	 */
	get num_pending_incoming() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_pending_incoming(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * @param {number} arg0
	 */
	set num_pending_incoming(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_pending_incoming(this.__wbg_ptr, arg0)
	}
	/**
	 * @returns {number}
	 */
	get num_pending_outgoing() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_pending_outgoing(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * @param {number} arg0
	 */
	set num_pending_outgoing(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_pending_outgoing(this.__wbg_ptr, arg0)
	}
	/**
	 * @returns {number}
	 */
	get num_established_incoming() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_established_incoming(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * @param {number} arg0
	 */
	set num_established_incoming(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_established_incoming(this.__wbg_ptr, arg0)
	}
	/**
	 * @returns {number}
	 */
	get num_established_outgoing() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_established_outgoing(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * @param {number} arg0
	 */
	set num_established_outgoing(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_established_outgoing(this.__wbg_ptr, arg0)
	}
	/**
	 * @returns {number}
	 */
	get num_established() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_established(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * @param {number} arg0
	 */
	set num_established(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_established(this.__wbg_ptr, arg0)
	}
}

const NetworkInfoSnapshotFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_networkinfosnapshot_free(ptr >>> 0))
/**
 */
export class NetworkInfoSnapshot {
	static __wrap(ptr) {
		ptr = ptr >>> 0
		const obj = Object.create(NetworkInfoSnapshot.prototype)
		obj.__wbg_ptr = ptr
		NetworkInfoSnapshotFinalization.register(obj, obj.__wbg_ptr, obj)
		return obj
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		NetworkInfoSnapshotFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_networkinfosnapshot_free(ptr)
	}
	/**
	 * @returns {number}
	 */
	get num_peers() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_connections(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * @param {number} arg0
	 */
	set num_peers(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_connections(this.__wbg_ptr, arg0)
	}
}

const NodeClientFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_nodeclient_free(ptr >>> 0))
/**
 * `NodeDriver` represents lumina node running in a dedicated Worker/SharedWorker.
 * It's responsible for sending commands and receiving responses from the node.
 */
export class NodeClient {
	static __wrap(ptr) {
		ptr = ptr >>> 0
		const obj = Object.create(NodeClient.prototype)
		obj.__wbg_ptr = ptr
		NodeClientFinalization.register(obj, obj.__wbg_ptr, obj)
		return obj
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		NodeClientFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_nodeclient_free(ptr)
	}
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
	constructor(worker_script_url, worker_type) {
		const ptr0 = passStringToWasm0(worker_script_url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len0 = WASM_VECTOR_LEN
		const ret = wasm.nodeclient_new(ptr0, len0, isLikeNone(worker_type) ? 2 : worker_type)
		return takeObject(ret)
	}
	/**
	 * Check whether Lumina is currently running
	 * @returns {Promise<boolean>}
	 */
	is_running() {
		const ret = wasm.nodeclient_is_running(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Start a node with the provided config, if it's not running
	 * @param {NodeConfig} config
	 * @returns {Promise<void>}
	 */
	start(config) {
		_assertClass(config, NodeConfig)
		var ptr0 = config.__destroy_into_raw()
		const ret = wasm.nodeclient_start(this.__wbg_ptr, ptr0)
		return takeObject(ret)
	}
	/**
	 * Get node's local peer ID.
	 * @returns {Promise<string>}
	 */
	local_peer_id() {
		const ret = wasm.nodeclient_local_peer_id(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get current [`PeerTracker`] info.
	 * @returns {Promise<any>}
	 */
	peer_tracker_info() {
		const ret = wasm.nodeclient_peer_tracker_info(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Wait until the node is connected to at least 1 peer.
	 * @returns {Promise<void>}
	 */
	wait_connected() {
		const ret = wasm.nodeclient_wait_connected(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Wait until the node is connected to at least 1 trusted peer.
	 * @returns {Promise<void>}
	 */
	wait_connected_trusted() {
		const ret = wasm.nodeclient_wait_connected_trusted(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get current network info.
	 * @returns {Promise<NetworkInfoSnapshot>}
	 */
	network_info() {
		const ret = wasm.nodeclient_network_info(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get all the multiaddresses on which the node listens.
	 * @returns {Promise<Array<any>>}
	 */
	listeners() {
		const ret = wasm.nodeclient_listeners(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get all the peers that node is connected to.
	 * @returns {Promise<Array<any>>}
	 */
	connected_peers() {
		const ret = wasm.nodeclient_connected_peers(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Trust or untrust the peer with a given ID.
	 * @param {string} peer_id
	 * @param {boolean} is_trusted
	 * @returns {Promise<void>}
	 */
	set_peer_trust(peer_id, is_trusted) {
		const ptr0 = passStringToWasm0(peer_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len0 = WASM_VECTOR_LEN
		const ret = wasm.nodeclient_set_peer_trust(this.__wbg_ptr, ptr0, len0, is_trusted)
		return takeObject(ret)
	}
	/**
	 * Request the head header from the network.
	 * @returns {Promise<any>}
	 */
	request_head_header() {
		const ret = wasm.nodeclient_request_head_header(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Request a header for the block with a given hash from the network.
	 * @param {string} hash
	 * @returns {Promise<any>}
	 */
	request_header_by_hash(hash) {
		const ptr0 = passStringToWasm0(hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len0 = WASM_VECTOR_LEN
		const ret = wasm.nodeclient_request_header_by_hash(this.__wbg_ptr, ptr0, len0)
		return takeObject(ret)
	}
	/**
	 * Request a header for the block with a given height from the network.
	 * @param {bigint} height
	 * @returns {Promise<any>}
	 */
	request_header_by_height(height) {
		const ret = wasm.nodeclient_request_header_by_height(this.__wbg_ptr, height)
		return takeObject(ret)
	}
	/**
	 * Request headers in range (from, from + amount] from the network.
	 *
	 * The headers will be verified with the `from` header.
	 * @param {any} from_header
	 * @param {bigint} amount
	 * @returns {Promise<Array<any>>}
	 */
	request_verified_headers(from_header, amount) {
		const ret = wasm.nodeclient_request_verified_headers(this.__wbg_ptr, addHeapObject(from_header), amount)
		return takeObject(ret)
	}
	/**
	 * Get current header syncing info.
	 * @returns {Promise<any>}
	 */
	syncer_info() {
		const ret = wasm.nodeclient_syncer_info(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get the latest header announced in the network.
	 * @returns {Promise<any>}
	 */
	get_network_head_header() {
		const ret = wasm.nodeclient_get_network_head_header(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get the latest locally synced header.
	 * @returns {Promise<any>}
	 */
	get_local_head_header() {
		const ret = wasm.nodeclient_get_local_head_header(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get a synced header for the block with a given hash.
	 * @param {string} hash
	 * @returns {Promise<any>}
	 */
	get_header_by_hash(hash) {
		const ptr0 = passStringToWasm0(hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len0 = WASM_VECTOR_LEN
		const ret = wasm.nodeclient_get_header_by_hash(this.__wbg_ptr, ptr0, len0)
		return takeObject(ret)
	}
	/**
	 * Get a synced header for the block with a given height.
	 * @param {bigint} height
	 * @returns {Promise<any>}
	 */
	get_header_by_height(height) {
		const ret = wasm.nodeclient_get_header_by_height(this.__wbg_ptr, height)
		return takeObject(ret)
	}
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
	get_headers(start_height, end_height) {
		const ret = wasm.nodeclient_get_headers(
			this.__wbg_ptr,
			!isLikeNone(start_height),
			isLikeNone(start_height) ? BigInt(0) : start_height,
			!isLikeNone(end_height),
			isLikeNone(end_height) ? BigInt(0) : end_height,
		)
		return takeObject(ret)
	}
	/**
	 * Get data sampling metadata of an already sampled height.
	 * @param {bigint} height
	 * @returns {Promise<any>}
	 */
	get_sampling_metadata(height) {
		const ret = wasm.nodeclient_get_sampling_metadata(this.__wbg_ptr, height)
		return takeObject(ret)
	}
	/**
	 * Requests SharedWorker running lumina to close. Any events received afterwards wont
	 * be processed and new NodeClient needs to be created to restart a node.
	 * @returns {Promise<void>}
	 */
	close() {
		const ret = wasm.nodeclient_close(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Returns a [`BroadcastChannel`] for events generated by [`Node`].
	 * @returns {Promise<BroadcastChannel>}
	 */
	events_channel() {
		const ret = wasm.nodeclient_events_channel(this.__wbg_ptr)
		return takeObject(ret)
	}
}

const NodeConfigFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_nodeconfig_free(ptr >>> 0))
/**
 * Config for the lumina wasm node.
 */
export class NodeConfig {
	static __wrap(ptr) {
		ptr = ptr >>> 0
		const obj = Object.create(NodeConfig.prototype)
		obj.__wbg_ptr = ptr
		NodeConfigFinalization.register(obj, obj.__wbg_ptr, obj)
		return obj
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		NodeConfigFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_nodeconfig_free(ptr)
	}
	/**
	 * A network to connect to.
	 * @returns {Network}
	 */
	get network() {
		const ret = wasm.__wbg_get_nodeconfig_network(this.__wbg_ptr)
		return ret
	}
	/**
	 * A network to connect to.
	 * @param {Network} arg0
	 */
	set network(arg0) {
		wasm.__wbg_set_nodeconfig_network(this.__wbg_ptr, arg0)
	}
	/**
	 * A list of bootstrap peers to connect to.
	 * @returns {(string)[]}
	 */
	get bootnodes() {
		try {
			const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
			wasm.__wbg_get_nodeconfig_bootnodes(retptr, this.__wbg_ptr)
			var r0 = getInt32Memory0()[retptr / 4 + 0]
			var r1 = getInt32Memory0()[retptr / 4 + 1]
			var v1 = getArrayJsValueFromWasm0(r0, r1).slice()
			wasm.__wbindgen_free(r0, r1 * 4, 4)
			return v1
		} finally {
			wasm.__wbindgen_add_to_stack_pointer(16)
		}
	}
	/**
	 * A list of bootstrap peers to connect to.
	 * @param {(string)[]} arg0
	 */
	set bootnodes(arg0) {
		const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc)
		const len0 = WASM_VECTOR_LEN
		wasm.__wbg_set_nodeconfig_bootnodes(this.__wbg_ptr, ptr0, len0)
	}
	/**
	 * Get the configuration with default bootnodes for provided network
	 * @param {Network} network
	 * @returns {NodeConfig}
	 */
	static default(network) {
		const ret = wasm.nodeconfig_default(network)
		return NodeConfig.__wrap(ret)
	}
}

async function __wbg_load(module, imports) {
	if (typeof Response === "function" && module instanceof Response) {
		if (typeof WebAssembly.instantiateStreaming === "function") {
			try {
				return await WebAssembly.instantiateStreaming(module, imports)
			} catch (e) {
				if (module.headers.get("Content-Type") != "application/wasm") {
					console.warn(
						"`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
						e,
					)
				} else {
					throw e
				}
			}
		}

		const bytes = await module.arrayBuffer()
		return await WebAssembly.instantiate(bytes, imports)
	} else {
		const instance = await WebAssembly.instantiate(module, imports)

		if (instance instanceof WebAssembly.Instance) {
			return { instance, module }
		} else {
			return instance
		}
	}
}

function __wbg_get_imports() {
	const imports = {}
	imports.wbg = {}
	imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
		const obj = getObject(arg1)
		const ret = typeof obj === "string" ? obj : undefined
		var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		var len1 = WASM_VECTOR_LEN
		getInt32Memory0()[arg0 / 4 + 1] = len1
		getInt32Memory0()[arg0 / 4 + 0] = ptr1
	}
	imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
		takeObject(arg0)
	}
	imports.wbg.__wbindgen_error_new = function (arg0, arg1) {
		const ret = new Error(getStringFromWasm0(arg0, arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_cb_drop = function (arg0) {
		const obj = takeObject(arg0).original
		if (obj.cnt-- == 1) {
			obj.a = 0
			return true
		}
		const ret = false
		return ret
	}
	imports.wbg.__wbindgen_number_get = function (arg0, arg1) {
		const obj = getObject(arg1)
		const ret = typeof obj === "number" ? obj : undefined
		getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret
		getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret)
	}
	imports.wbg.__wbindgen_number_new = function (arg0) {
		const ret = arg0
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_nodeclient_new = function (arg0) {
		const ret = NodeClient.__wrap(arg0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_networkinfosnapshot_new = function (arg0) {
		const ret = NetworkInfoSnapshot.__wrap(arg0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_is_object = function (arg0) {
		const val = getObject(arg0)
		const ret = typeof val === "object" && val !== null
		return ret
	}
	imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
		const ret = getStringFromWasm0(arg0, arg1)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_is_falsy = function (arg0) {
		const ret = !getObject(arg0)
		return ret
	}
	imports.wbg.__wbindgen_as_number = function (arg0) {
		const ret = +getObject(arg0)
		return ret
	}
	imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
		const ret = getObject(arg0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_boolean_get = function (arg0) {
		const v = getObject(arg0)
		const ret = typeof v === "boolean" ? (v ? 1 : 0) : 2
		return ret
	}
	imports.wbg.__wbindgen_is_undefined = function (arg0) {
		const ret = getObject(arg0) === undefined
		return ret
	}
	imports.wbg.__wbindgen_typeof = function (arg0) {
		const ret = typeof getObject(arg0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_is_string = function (arg0) {
		const ret = typeof getObject(arg0) === "string"
		return ret
	}
	imports.wbg.__wbindgen_in = function (arg0, arg1) {
		const ret = getObject(arg0) in getObject(arg1)
		return ret
	}
	imports.wbg.__wbindgen_is_bigint = function (arg0) {
		const ret = typeof getObject(arg0) === "bigint"
		return ret
	}
	imports.wbg.__wbindgen_bigint_from_i64 = function (arg0) {
		const ret = arg0
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_jsval_eq = function (arg0, arg1) {
		const ret = getObject(arg0) === getObject(arg1)
		return ret
	}
	imports.wbg.__wbindgen_bigint_from_u64 = function (arg0) {
		const ret = BigInt.asUintN(64, arg0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_new_abda76e883ba8a5f = function () {
		const ret = new Error()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_stack_658279fe44541cf6 = function (arg0, arg1) {
		const ret = getObject(arg1).stack
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len1 = WASM_VECTOR_LEN
		getInt32Memory0()[arg0 / 4 + 1] = len1
		getInt32Memory0()[arg0 / 4 + 0] = ptr1
	}
	imports.wbg.__wbg_error_f851667af71bcfc6 = function (arg0, arg1) {
		let deferred0_0
		let deferred0_1
		try {
			deferred0_0 = arg0
			deferred0_1 = arg1
			console.error(getStringFromWasm0(arg0, arg1))
		} finally {
			wasm.__wbindgen_free(deferred0_0, deferred0_1, 1)
		}
	}
	imports.wbg.__wbg_setTimeout_0433cd6d0cbea8a6 = function (arg0, arg1) {
		setTimeout(getObject(arg0), arg1 >>> 0)
	}
	imports.wbg.__wbg_clearTimeout_541ac0980ffcef74 = function (arg0) {
		const ret = clearTimeout(takeObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_clearInterval_7f51e4380e64c6c5 = function (arg0) {
		const ret = clearInterval(takeObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_setTimeout_7d81d052875b0f4f = function () {
		return handleError(function (arg0, arg1) {
			const ret = setTimeout(getObject(arg0), arg1)
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_setInterval_e227d4d8a9d44d66 = function () {
		return handleError(function (arg0, arg1) {
			const ret = setInterval(getObject(arg0), arg1)
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbindgen_jsval_loose_eq = function (arg0, arg1) {
		const ret = getObject(arg0) == getObject(arg1)
		return ret
	}
	imports.wbg.__wbg_String_b9412f8799faab3e = function (arg0, arg1) {
		const ret = String(getObject(arg1))
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len1 = WASM_VECTOR_LEN
		getInt32Memory0()[arg0 / 4 + 1] = len1
		getInt32Memory0()[arg0 / 4 + 0] = ptr1
	}
	imports.wbg.__wbg_getwithrefkey_edc2c8960f0f1191 = function (arg0, arg1) {
		const ret = getObject(arg0)[getObject(arg1)]
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_set_f975102236d3c502 = function (arg0, arg1, arg2) {
		getObject(arg0)[takeObject(arg1)] = takeObject(arg2)
	}
	imports.wbg.__wbg_createBidirectionalStream_e8fb76a65bd6eb52 = function (arg0) {
		const ret = getObject(arg0).createBidirectionalStream()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_instanceof_WebTransportBidirectionalStream_c2f1b598d12205aa = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof WebTransportBidirectionalStream
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_close_1276283703df9bd3 = function (arg0) {
		getObject(arg0).close()
	}
	imports.wbg.__wbg_new_79d7ef5075e2c8ba = function () {
		return handleError(function (arg0, arg1) {
			const ret = new WebTransport(getStringFromWasm0(arg0, arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_newwithoptions_ab349e4b6c5aa6f1 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = new WebTransport(getStringFromWasm0(arg0, arg1), getObject(arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_closed_e9b8485ca19a86c3 = function (arg0) {
		const ret = getObject(arg0).closed
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_incomingBidirectionalStreams_3aefd6b8b45d7b42 = function (arg0) {
		const ret = getObject(arg0).incomingBidirectionalStreams
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_ready_e695c98cb0927ddb = function (arg0) {
		const ret = getObject(arg0).ready
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_readable_40f6b00a326ac74b = function (arg0) {
		const ret = getObject(arg0).readable
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_writable_aae0d9b35543b2a5 = function (arg0) {
		const ret = getObject(arg0).writable
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_WorkerGlobalScope_fd1ac71dd5521929 = function (arg0) {
		const ret = getObject(arg0).WorkerGlobalScope
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_instanceof_Window_f401953a2cf86220 = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof Window
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_navigator_6c8fa55c5cc8796e = function (arg0) {
		const ret = getObject(arg0).navigator
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_clearInterval_4368213fd2b325b0 = function (arg0, arg1) {
		getObject(arg0).clearInterval(arg1)
	}
	imports.wbg.__wbg_fetch_c4b6afebdb1f918e = function (arg0, arg1) {
		const ret = getObject(arg0).fetch(getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_setInterval_fc26942d7c8fecb1 = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			const ret = getObject(arg0).setInterval(getObject(arg1), arg2, ...getObject(arg3))
			return ret
		}, arguments)
	}
	imports.wbg.__wbg_navigator_56803b85352a0575 = function (arg0) {
		const ret = getObject(arg0).navigator
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_clearInterval_4e34ef4defa59ef6 = function (arg0, arg1) {
		getObject(arg0).clearInterval(arg1)
	}
	imports.wbg.__wbg_fetch_921fad6ef9e883dd = function (arg0, arg1) {
		const ret = getObject(arg0).fetch(getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_setInterval_411633bda2729111 = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			const ret = getObject(arg0).setInterval(getObject(arg1), arg2, ...getObject(arg3))
			return ret
		}, arguments)
	}
	imports.wbg.__wbg_debug_5fb96680aecf5dc8 = function (arg0) {
		console.debug(getObject(arg0))
	}
	imports.wbg.__wbg_error_8e3928cfb8a43e2b = function (arg0) {
		console.error(getObject(arg0))
	}
	imports.wbg.__wbg_info_530a29cb2e4e3304 = function (arg0) {
		console.info(getObject(arg0))
	}
	imports.wbg.__wbg_warn_63bbae1730aead09 = function (arg0) {
		console.warn(getObject(arg0))
	}
	imports.wbg.__wbg_indexNames_fd89e01c0b29fe18 = function (arg0) {
		const ret = getObject(arg0).indexNames
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_add_a3b44bfbb3d40345 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).add(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_add_1dac52a28ed73a3a = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).add(getObject(arg1), getObject(arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_clear_b4570827d1866b70 = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).clear()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_count_58c6ff5f27ecc3ae = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).count()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_count_2ccb380b1f3d57bd = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).count(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_createIndex_d786564b37de8e73 = function () {
		return handleError(function (arg0, arg1, arg2, arg3, arg4) {
			const ret = getObject(arg0).createIndex(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_deleteIndex_cbeab45ca61aff12 = function () {
		return handleError(function (arg0, arg1, arg2) {
			getObject(arg0).deleteIndex(getStringFromWasm0(arg1, arg2))
		}, arguments)
	}
	imports.wbg.__wbg_get_5361b64cac0d0826 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).get(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_index_383b6812c1508030 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).index(getStringFromWasm0(arg1, arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_openCursor_30d58ae27a327629 = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).openCursor()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_openCursor_611b1e488c393dd8 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).openCursor(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_openCursor_2df5d7cb6c41ac04 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).openCursor(getObject(arg1), takeObject(arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_put_0a0d7ca0f7fa8f83 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).put(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_put_22792e17580ca18b = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).put(getObject(arg1), getObject(arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_result_6cedf5f78600a79c = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).result
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_error_685b20024dc2d6ca = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).error
			return isLikeNone(ret) ? 0 : addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_transaction_9c6c3c7e1f9283c7 = function (arg0) {
		const ret = getObject(arg0).transaction
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_setonsuccess_632ce0a1460455c2 = function (arg0, arg1) {
		getObject(arg0).onsuccess = getObject(arg1)
	}
	imports.wbg.__wbg_setonerror_8479b33e7568a904 = function (arg0, arg1) {
		getObject(arg0).onerror = getObject(arg1)
	}
	imports.wbg.__wbg_setoncomplete_d8e4236665cbf1e2 = function (arg0, arg1) {
		getObject(arg0).oncomplete = getObject(arg1)
	}
	imports.wbg.__wbg_setonerror_da071ec94e148397 = function (arg0, arg1) {
		getObject(arg0).onerror = getObject(arg1)
	}
	imports.wbg.__wbg_commit_386dbf9bf88312d5 = function () {
		return handleError(function (arg0) {
			getObject(arg0).commit()
		}, arguments)
	}
	imports.wbg.__wbg_objectStore_da468793bd9df17b = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_now_4e659b3d15f470d9 = function (arg0) {
		const ret = getObject(arg0).now()
		return ret
	}
	imports.wbg.__wbg_getReader_205ad0215affbd99 = function (arg0) {
		const ret = getObject(arg0).getReader()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_userAgent_e94c7cbcdac01fea = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg1).userAgent
			const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
			const len1 = WASM_VECTOR_LEN
			getInt32Memory0()[arg0 / 4 + 1] = len1
			getInt32Memory0()[arg0 / 4 + 0] = ptr1
		}, arguments)
	}
	imports.wbg.__wbg_storage_9659672413380819 = function (arg0) {
		const ret = getObject(arg0).storage
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_getWriter_01ddb812f0418756 = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).getWriter()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_count_33e33b561d09c064 = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).count()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_count_8009a1dc77dcac7a = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).count(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_get_d78ddae222eedf30 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).get(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_closed_7c117f63745c8914 = function (arg0) {
		const ret = getObject(arg0).closed
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_desiredSize_7f93f234494b6931 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg1).desiredSize
			getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret
			getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret)
		}, arguments)
	}
	imports.wbg.__wbg_ready_2a66bc1809d7ed5c = function (arg0) {
		const ret = getObject(arg0).ready
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_close_aa5e556ea5c0337f = function (arg0) {
		const ret = getObject(arg0).close()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_write_0305cf168e5e805e = function (arg0, arg1) {
		const ret = getObject(arg0).write(getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_new_7053f98f3a2f6419 = function () {
		return handleError(function (arg0, arg1) {
			const ret = new BroadcastChannel(getStringFromWasm0(arg0, arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_close_10b1f19e83d1b320 = function (arg0) {
		getObject(arg0).close()
	}
	imports.wbg.__wbg_postMessage_318b80af3de6469e = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).postMessage(getObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_length_9ae5daf9a690cba9 = function (arg0) {
		const ret = getObject(arg0).length
		return ret
	}
	imports.wbg.__wbg_contains_c65b44400b549286 = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).contains(getStringFromWasm0(arg1, arg2))
		return ret
	}
	imports.wbg.__wbg_get_910bbb94abdcf488 = function (arg0, arg1, arg2) {
		const ret = getObject(arg1)[arg2 >>> 0]
		var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		var len1 = WASM_VECTOR_LEN
		getInt32Memory0()[arg0 / 4 + 1] = len1
		getInt32Memory0()[arg0 / 4 + 0] = ptr1
	}
	imports.wbg.__wbg_target_2fc177e386c8b7b0 = function (arg0) {
		const ret = getObject(arg0).target
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}
	imports.wbg.__wbg_set_cb0e7a5c2dd66afd = function () {
		return handleError(function (arg0, arg1, arg2, arg3, arg4) {
			getObject(arg0).set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4))
		}, arguments)
	}
	imports.wbg.__wbg_persist_8ff48651f7c13276 = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).persist()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_data_3ce7c145ca4fbcdc = function (arg0) {
		const ret = getObject(arg0).data
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_ports_91c8cfac582f945f = function (arg0) {
		const ret = getObject(arg0).ports
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_instanceof_Response_849eb93e75734b6e = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof Response
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_json_1d5f113e916d8675 = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).json()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_instanceof_DedicatedWorkerGlobalScope_20e3b76dc9531d3e = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof DedicatedWorkerGlobalScope
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_setonmessage_bf8a4436ccd4af19 = function (arg0, arg1) {
		getObject(arg0).onmessage = getObject(arg1)
	}
	imports.wbg.__wbg_postMessage_34005f67a84600d1 = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).postMessage(getObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_setonupgradeneeded_ad7645373c7d5e1b = function (arg0, arg1) {
		getObject(arg0).onupgradeneeded = getObject(arg1)
	}
	imports.wbg.__wbg_readyState_1c157e4ea17c134a = function (arg0) {
		const ret = getObject(arg0).readyState
		return ret
	}
	imports.wbg.__wbg_bufferedAmount_3c6681ad67905b7f = function (arg0) {
		const ret = getObject(arg0).bufferedAmount
		return ret
	}
	imports.wbg.__wbg_setonopen_ce7a4c51e5cf5788 = function (arg0, arg1) {
		getObject(arg0).onopen = getObject(arg1)
	}
	imports.wbg.__wbg_setonerror_39a785302b0cd2e9 = function (arg0, arg1) {
		getObject(arg0).onerror = getObject(arg1)
	}
	imports.wbg.__wbg_setonclose_b9929b1c1624dff3 = function (arg0, arg1) {
		getObject(arg0).onclose = getObject(arg1)
	}
	imports.wbg.__wbg_setonmessage_2af154ce83a3dc94 = function (arg0, arg1) {
		getObject(arg0).onmessage = getObject(arg1)
	}
	imports.wbg.__wbg_setbinaryType_b0cf5103cd561959 = function (arg0, arg1) {
		getObject(arg0).binaryType = takeObject(arg1)
	}
	imports.wbg.__wbg_new_6c74223c77cfabad = function () {
		return handleError(function (arg0, arg1) {
			const ret = new WebSocket(getStringFromWasm0(arg0, arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_close_52033153a6a5ad44 = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			getObject(arg0).close(arg1, getStringFromWasm0(arg2, arg3))
		}, arguments)
	}
	imports.wbg.__wbg_send_5fcd7bab9777194e = function () {
		return handleError(function (arg0, arg1, arg2) {
			getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2))
		}, arguments)
	}
	imports.wbg.__wbg_key_7a534de95a1f5fbf = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).key
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_advance_e211280146391e9c = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).advance(arg1 >>> 0)
		}, arguments)
	}
	imports.wbg.__wbg_continue_f1c3e0815924de62 = function () {
		return handleError(function (arg0) {
			getObject(arg0).continue()
		}, arguments)
	}
	imports.wbg.__wbg_instanceof_IdbFactory_c70f8c7294f93655 = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof IDBFactory
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_open_f0d7259fd7e689ce = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0)
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_open_a05198d687357536 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_instanceof_ReadableStreamDefaultReader_91ddaab964b5d81d = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof ReadableStreamDefaultReader
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_read_e7d0f8a49be01d86 = function (arg0) {
		const ret = getObject(arg0).read()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_cancel_6ee33d4006737aef = function (arg0) {
		const ret = getObject(arg0).cancel()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_value_86d3334f5075b232 = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).value
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_objectStoreNames_588b5924274239fd = function (arg0) {
		const ret = getObject(arg0).objectStoreNames
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_createObjectStore_f494613cd1a00d43 = function () {
		return handleError(function (arg0, arg1, arg2, arg3) {
			const ret = getObject(arg0).createObjectStore(getStringFromWasm0(arg1, arg2), getObject(arg3))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_deleteObjectStore_1732efdd0f8a351d = function () {
		return handleError(function (arg0, arg1, arg2) {
			getObject(arg0).deleteObjectStore(getStringFromWasm0(arg1, arg2))
		}, arguments)
	}
	imports.wbg.__wbg_transaction_b39e2665b40b6324 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).transaction(getObject(arg1), takeObject(arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_instanceof_SharedWorkerGlobalScope_e17844bff359762f = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof SharedWorkerGlobalScope
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_setonconnect_460a085d5209d42d = function (arg0, arg1) {
		getObject(arg0).onconnect = getObject(arg1)
	}
	imports.wbg.__wbg_close_619f6dfef825c784 = function (arg0) {
		getObject(arg0).close()
	}
	imports.wbg.__wbg_instanceof_MessagePort_da56780a9ac2d1be = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof MessagePort
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_setonmessage_93bdba94dcd46c04 = function (arg0, arg1) {
		getObject(arg0).onmessage = getObject(arg1)
	}
	imports.wbg.__wbg_postMessage_fbddfe9314af804e = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).postMessage(getObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_setonmessage_503809e5bb51bd33 = function (arg0, arg1) {
		getObject(arg0).onmessage = getObject(arg1)
	}
	imports.wbg.__wbg_setonerror_1b6b82477becfad4 = function (arg0, arg1) {
		getObject(arg0).onerror = getObject(arg1)
	}
	imports.wbg.__wbg_newwithoptions_fcd48f063d8218d0 = function () {
		return handleError(function (arg0, arg1, arg2) {
			try {
				const ret = new Worker(getStringFromWasm0(arg0, arg1), getObject(arg2))
				ret.onmessage = (e) => {
					console.dir(e.data)
				}
				return addHeapObject(ret)
			} catch (error) {
				console.log(error)
			}
		}, arguments)
	}
	imports.wbg.__wbg_postMessage_7380d10e8b8269df = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).postMessage(getObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_headers_abb199c3be8d817c = function (arg0) {
		const ret = getObject(arg0).headers
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_newwithstrandinit_3fd6fba4083ff2d0 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_userAgent_870e57fc6747540a = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg1).userAgent
			const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
			const len1 = WASM_VECTOR_LEN
			getInt32Memory0()[arg0 / 4 + 1] = len1
			getInt32Memory0()[arg0 / 4 + 0] = ptr1
		}, arguments)
	}
	imports.wbg.__wbg_storage_d466c11d68eca0d4 = function (arg0) {
		const ret = getObject(arg0).storage
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_only_cacf767244bdc280 = function () {
		return handleError(function (arg0) {
			const ret = IDBKeyRange.only(getObject(arg0))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_port_78bcb2ccbdfd2796 = function (arg0) {
		const ret = getObject(arg0).port
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_setonerror_f718f843ce314776 = function (arg0, arg1) {
		getObject(arg0).onerror = getObject(arg1)
	}
	imports.wbg.__wbg_newwithworkeroptions_458449b4f6a767a7 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = new SharedWorker(getStringFromWasm0(arg0, arg1), getObject(arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_queueMicrotask_3cbae2ec6b6cd3d6 = function (arg0) {
		const ret = getObject(arg0).queueMicrotask
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_is_function = function (arg0) {
		const ret = typeof getObject(arg0) === "function"
		return ret
	}
	imports.wbg.__wbg_queueMicrotask_481971b0d87f3dd4 = function (arg0) {
		queueMicrotask(getObject(arg0))
	}
	imports.wbg.__wbg_clearTimeout_76877dbc010e786d = function (arg0) {
		const ret = clearTimeout(takeObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_setTimeout_75cb9b6991a4031d = function () {
		return handleError(function (arg0, arg1) {
			const ret = setTimeout(getObject(arg0), arg1)
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_performance_a1b8bde2ee512264 = function (arg0) {
		const ret = getObject(arg0).performance
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_now_abd80e969af37148 = function (arg0) {
		const ret = getObject(arg0).now()
		return ret
	}
	imports.wbg.__wbg_crypto_1d1f22824a6a080c = function (arg0) {
		const ret = getObject(arg0).crypto
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_process_4a72847cc503995b = function (arg0) {
		const ret = getObject(arg0).process
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_versions_f686565e586dd935 = function (arg0) {
		const ret = getObject(arg0).versions
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_node_104a2ff8d6ea03a2 = function (arg0) {
		const ret = getObject(arg0).node
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_require_cca90b1a94a0255b = function () {
		return handleError(function () {
			const ret = module.require
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_msCrypto_eb05e62b530a1508 = function (arg0) {
		const ret = getObject(arg0).msCrypto
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_randomFillSync_5c9c955aa56b6049 = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).randomFillSync(takeObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_getRandomValues_3aa56aa6edec874c = function () {
		return handleError(function (arg0, arg1) {
			getObject(arg0).getRandomValues(getObject(arg1))
		}, arguments)
	}
	imports.wbg.__wbg_get_bd8e338fbd5f5cc8 = function (arg0, arg1) {
		const ret = getObject(arg0)[arg1 >>> 0]
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_length_cd7af8117672b8b8 = function (arg0) {
		const ret = getObject(arg0).length
		return ret
	}
	imports.wbg.__wbg_new_16b304a2cfa7ff4a = function () {
		const ret = new Array()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_newnoargs_e258087cd0daa0ea = function (arg0, arg1) {
		const ret = new Function(getStringFromWasm0(arg0, arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_new_d9bc3a0147634640 = function () {
		const ret = new Map()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_next_40fc327bfc8770e6 = function (arg0) {
		const ret = getObject(arg0).next
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_next_196c84450b364254 = function () {
		return handleError(function (arg0) {
			const ret = getObject(arg0).next()
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_done_298b57d23c0fc80c = function (arg0) {
		const ret = getObject(arg0).done
		return ret
	}
	imports.wbg.__wbg_value_d93c65011f51a456 = function (arg0) {
		const ret = getObject(arg0).value
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_iterator_2cee6dadfd956dfa = function () {
		const ret = Symbol.iterator
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_get_e3c254076557e348 = function () {
		return handleError(function (arg0, arg1) {
			const ret = Reflect.get(getObject(arg0), getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_call_27c0f87801dedf93 = function () {
		return handleError(function (arg0, arg1) {
			const ret = getObject(arg0).call(getObject(arg1))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_new_72fb9a18b5ae2624 = function () {
		const ret = new Object()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_self_ce0dbfc45cf2f5be = function () {
		return handleError(function () {
			const ret = self.self
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_window_c6fb939a7f436783 = function () {
		return handleError(function () {
			const ret = window.window
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_globalThis_d1e6af4856ba331b = function () {
		return handleError(function () {
			const ret = globalThis.globalThis
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_global_207b558942527489 = function () {
		return handleError(function () {
			const ret = global.global
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_at_c729a14f9fc27c62 = function (arg0, arg1) {
		const ret = getObject(arg0).at(arg1)
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_set_d4638f722068f043 = function (arg0, arg1, arg2) {
		getObject(arg0)[arg1 >>> 0] = takeObject(arg2)
	}
	imports.wbg.__wbg_from_89e3fc3ba5e6fb48 = function (arg0) {
		const ret = Array.from(getObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_isArray_2ab64d95e09ea0ae = function (arg0) {
		const ret = Array.isArray(getObject(arg0))
		return ret
	}
	imports.wbg.__wbg_push_a5b05aedc7234f9f = function (arg0, arg1) {
		const ret = getObject(arg0).push(getObject(arg1))
		return ret
	}
	imports.wbg.__wbg_instanceof_ArrayBuffer_836825be07d4c9d2 = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof ArrayBuffer
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_instanceof_Error_e20bb56fd5591a93 = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof Error
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_new_28c511d9baebfa89 = function (arg0, arg1) {
		const ret = new Error(getStringFromWasm0(arg0, arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_cause_3d9c85ebaf6b1155 = function (arg0) {
		const ret = getObject(arg0).cause
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_setcause_4c36da1f0d535c51 = function (arg0, arg1) {
		getObject(arg0).cause = getObject(arg1)
	}
	imports.wbg.__wbg_message_5bf28016c2b49cfb = function (arg0) {
		const ret = getObject(arg0).message
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_name_e7429f0dda6079e2 = function (arg0) {
		const ret = getObject(arg0).name
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_toString_ffe4c9ea3b3532e9 = function (arg0) {
		const ret = getObject(arg0).toString()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_call_b3ca7c6051f9bec1 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = getObject(arg0).call(getObject(arg1), getObject(arg2))
			return addHeapObject(ret)
		}, arguments)
	}
	imports.wbg.__wbg_instanceof_Map_87917e0a7aaf4012 = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof Map
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_set_8417257aaedc936b = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).set(getObject(arg1), getObject(arg2))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_isSafeInteger_f7b04ef02296c4d2 = function (arg0) {
		const ret = Number.isSafeInteger(getObject(arg0))
		return ret
	}
	imports.wbg.__wbg_getTime_2bc4375165f02d15 = function (arg0) {
		const ret = getObject(arg0).getTime()
		return ret
	}
	imports.wbg.__wbg_new0_7d84e5b2cd9fdc73 = function () {
		const ret = new Date()
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_now_3014639a94423537 = function () {
		const ret = Date.now()
		return ret
	}
	imports.wbg.__wbg_entries_95cc2c823b285a09 = function (arg0) {
		const ret = Object.entries(getObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_new_81740750da40724f = function (arg0, arg1) {
		try {
			var state0 = { a: arg0, b: arg1 }
			var cb0 = (arg0, arg1) => {
				const a = state0.a
				state0.a = 0
				try {
					return __wbg_adapter_490(a, state0.b, arg0, arg1)
				} finally {
					state0.a = a
				}
			}
			const ret = new Promise(cb0)
			return addHeapObject(ret)
		} finally {
			state0.a = state0.b = 0
		}
	}
	imports.wbg.__wbg_resolve_b0083a7967828ec8 = function (arg0) {
		const ret = Promise.resolve(getObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_catch_0260e338d10f79ae = function (arg0, arg1) {
		const ret = getObject(arg0).catch(getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_then_0c86a60e8fcfe9f6 = function (arg0, arg1) {
		const ret = getObject(arg0).then(getObject(arg1))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_then_a73caa9a87991566 = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).then(getObject(arg1), getObject(arg2))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_buffer_12d079cc21e14bdb = function (arg0) {
		const ret = getObject(arg0).buffer
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb = function (arg0, arg1, arg2) {
		const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_new_63b92bc8671ed464 = function (arg0) {
		const ret = new Uint8Array(getObject(arg0))
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_set_a47bac70306a19a7 = function (arg0, arg1, arg2) {
		getObject(arg0).set(getObject(arg1), arg2 >>> 0)
	}
	imports.wbg.__wbg_length_c20a40f15020d68a = function (arg0) {
		const ret = getObject(arg0).length
		return ret
	}
	imports.wbg.__wbg_instanceof_Uint8Array_2b3bbecd033d19f6 = function (arg0) {
		let result
		try {
			result = getObject(arg0) instanceof Uint8Array
		} catch (_) {
			result = false
		}
		const ret = result
		return ret
	}
	imports.wbg.__wbg_newwithlength_e9b4878cebadb3d3 = function (arg0) {
		const ret = new Uint8Array(arg0 >>> 0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_subarray_a1f73cd4b5b42fe1 = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_slice_c6005e679454ad58 = function (arg0, arg1, arg2) {
		const ret = getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0)
		return addHeapObject(ret)
	}
	imports.wbg.__wbg_byteLength_58f7b4fab1919d44 = function (arg0) {
		const ret = getObject(arg0).byteLength
		return ret
	}
	imports.wbg.__wbg_random_26e2d782b541ca6b = typeof Math.random == "function" ? Math.random : notDefined("Math.random")
	imports.wbg.__wbg_set_1f9b04f170055d33 = function () {
		return handleError(function (arg0, arg1, arg2) {
			const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2))
			return ret
		}, arguments)
	}
	imports.wbg.__wbindgen_bigint_get_as_i64 = function (arg0, arg1) {
		const v = getObject(arg1)
		const ret = typeof v === "bigint" ? v : undefined
		getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret
		getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret)
	}
	imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
		const ret = debugString(getObject(arg1))
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len1 = WASM_VECTOR_LEN
		getInt32Memory0()[arg0 / 4 + 1] = len1
		getInt32Memory0()[arg0 / 4 + 0] = ptr1
	}
	imports.wbg.__wbindgen_throw = function (arg0, arg1) {
		throw new Error(getStringFromWasm0(arg0, arg1))
	}
	imports.wbg.__wbindgen_memory = function () {
		const ret = wasm.memory
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper2439 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 694, __wbg_adapter_54)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper2440 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 694, __wbg_adapter_57)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper2441 = function (arg0, arg1, arg2) {
		const ret = makeClosure(arg0, arg1, 694, __wbg_adapter_60)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper4274 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 1415, __wbg_adapter_63)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper4325 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 1426, __wbg_adapter_66)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper5075 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 1738, __wbg_adapter_69)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper5220 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 1814, __wbg_adapter_72)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper5221 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 1814, __wbg_adapter_72)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper5222 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 1814, __wbg_adapter_72)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper7400 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 2450, __wbg_adapter_79)
		return addHeapObject(ret)
	}
	imports.wbg.__wbindgen_closure_wrapper7504 = function (arg0, arg1, arg2) {
		const ret = makeMutClosure(arg0, arg1, 2509, __wbg_adapter_82)
		return addHeapObject(ret)
	}

	return imports
}

function __wbg_init_memory(imports, maybe_memory) {}

function __wbg_finalize_init(instance, module) {
	wasm = instance.exports
	__wbg_init.__wbindgen_wasm_module = module
	cachedBigInt64Memory0 = null
	cachedFloat64Memory0 = null
	cachedInt32Memory0 = null
	cachedUint32Memory0 = null
	cachedUint8Memory0 = null

	wasm.__wbindgen_start()
	return wasm
}

function initSync(module) {
	if (wasm !== undefined) return wasm

	const imports = __wbg_get_imports()

	__wbg_init_memory(imports)

	if (!(module instanceof WebAssembly.Module)) {
		module = new WebAssembly.Module(module)
	}

	const instance = new WebAssembly.Instance(module, imports)

	return __wbg_finalize_init(instance, module)
}

async function __wbg_init(input) {
	if (wasm !== undefined) return wasm

	if (typeof input === "undefined") {
		input = new URL("lumina_node_wasm_bg.wasm", import.meta.url)
	}
	const imports = __wbg_get_imports()
	if (
		typeof input === "string" ||
		(typeof Request === "function" && input instanceof Request) ||
		(typeof URL === "function" && input instanceof URL)
	) {
		input = fetch(input)
	}

	__wbg_init_memory(imports)

	const { instance, module } = await __wbg_load(await input, imports)

	return __wbg_finalize_init(instance, module)
}

export { initSync }
export default __wbg_init
