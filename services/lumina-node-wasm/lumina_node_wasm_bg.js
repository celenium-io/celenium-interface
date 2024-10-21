const setInterval = globalThis.setInterval

let wasm
export function __wbg_set_wasm(val) {
	wasm = val
}

const heap = new Array(128).fill(undefined)

heap.push(undefined, null, true, false)

function getObject(idx) {
	return heap[idx]
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

let WASM_VECTOR_LEN = 0

let cachedUint8ArrayMemory0 = null

function getUint8ArrayMemory0() {
	if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
		cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer)
	}
	return cachedUint8ArrayMemory0
}

const lTextEncoder = typeof TextEncoder === "undefined" ? (0, module.require)("util").TextEncoder : TextEncoder

let cachedTextEncoder = new lTextEncoder("utf-8")

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
		getUint8ArrayMemory0()
			.subarray(ptr, ptr + buf.length)
			.set(buf)
		WASM_VECTOR_LEN = buf.length
		return ptr
	}

	let len = arg.length
	let ptr = malloc(len, 1) >>> 0

	const mem = getUint8ArrayMemory0()

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
		const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len)
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

let cachedDataViewMemory0 = null

function getDataViewMemory0() {
	if (
		cachedDataViewMemory0 === null ||
		cachedDataViewMemory0.buffer.detached === true ||
		(cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)
	) {
		cachedDataViewMemory0 = new DataView(wasm.memory.buffer)
	}
	return cachedDataViewMemory0
}

const lTextDecoder = typeof TextDecoder === "undefined" ? (0, module.require)("util").TextDecoder : TextDecoder

let cachedTextDecoder = new lTextDecoder("utf-8", { ignoreBOM: true, fatal: true })

cachedTextDecoder.decode()

function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0
	return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len))
}

function addHeapObject(obj) {
	if (heap_next === heap.length) heap.push(heap.length + 1)
	const idx = heap_next
	heap_next = heap[idx]

	heap[idx] = obj
	return idx
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
function __wbg_adapter_58(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h17e3d468b80cfec8(
		arg0,
		arg1,
		addHeapObject(arg2),
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
function __wbg_adapter_61(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8fba0fbbb2ce56f5(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_64(arg0, arg1) {
	wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h97503251cc26c7d8(
		arg0,
		arg1,
	)
}

function __wbg_adapter_71(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h75c81ac71a33052c(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_74(arg0, arg1) {
	wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h34cf51d8af2eb9c2(
		arg0,
		arg1,
	)
}

function __wbg_adapter_77(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h54e934330e7efee1(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_80(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h1816ecd417a1ddc0(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_87(arg0, arg1, arg2) {
	wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h09752d8f15282203(
		arg0,
		arg1,
		addHeapObject(arg2),
	)
}

function __wbg_adapter_90(arg0, arg1) {
	wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7ea3881f612d7cca(
		arg0,
		arg1,
	)
}

function getArrayJsValueFromWasm0(ptr, len) {
	ptr = ptr >>> 0
	const mem = getDataViewMemory0()
	const result = []
	for (let i = ptr; i < ptr + 4 * len; i += 4) {
		result.push(takeObject(mem.getUint32(i, true)))
	}
	return result
}

function passArrayJsValueToWasm0(array, malloc) {
	const ptr = malloc(array.length * 4, 4) >>> 0
	const mem = getDataViewMemory0()
	for (let i = 0; i < array.length; i++) {
		mem.setUint32(ptr + 4 * i, addHeapObject(array[i]), true)
	}
	WASM_VECTOR_LEN = array.length
	return ptr
}
/**
 * Set up a logging layer that direct logs to the browser's console.
 */
export function setup_logging() {
	wasm.setup_logging()
}

function _assertClass(instance, klass) {
	if (!(instance instanceof klass)) {
		throw new Error(`expected instance of ${klass.name}`)
	}
	return instance.ptr
}

function handleError(f, args) {
	try {
		return f.apply(this, args)
	} catch (e) {
		wasm.__wbindgen_exn_store(addHeapObject(e))
	}
}

function notDefined(what) {
	return () => {
		throw new Error(`${what} is not defined`)
	}
}

function getArrayU8FromWasm0(ptr, len) {
	ptr = ptr >>> 0
	return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len)
}
function __wbg_adapter_552(arg0, arg1, arg2, arg3) {
	wasm.wasm_bindgen__convert__closures__invoke2_mut__h1ca7c5479a4cc604(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3))
}

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

const BlockRangeFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_blockrange_free(ptr >>> 0, 1))
/**
 * A range of blocks between `start` and `end` height, inclusive
 */
export class BlockRange {
	static __wrap(ptr) {
		ptr = ptr >>> 0
		const obj = Object.create(BlockRange.prototype)
		obj.__wbg_ptr = ptr
		BlockRangeFinalization.register(obj, obj.__wbg_ptr, obj)
		return obj
	}

	static __unwrap(jsValue) {
		if (!(jsValue instanceof BlockRange)) {
			return 0
		}
		return jsValue.__destroy_into_raw()
	}

	toJSON() {
		return {
			start: this.start,
			end: this.end,
		}
	}

	toString() {
		return JSON.stringify(this)
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		BlockRangeFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_blockrange_free(ptr, 0)
	}
	/**
	 * First block height in range
	 * @returns {bigint}
	 */
	get start() {
		const ret = wasm.__wbg_get_blockrange_start(this.__wbg_ptr)
		return BigInt.asUintN(64, ret)
	}
	/**
	 * First block height in range
	 * @param {bigint} arg0
	 */
	set start(arg0) {
		wasm.__wbg_set_blockrange_start(this.__wbg_ptr, arg0)
	}
	/**
	 * Last block height in range
	 * @returns {bigint}
	 */
	get end() {
		const ret = wasm.__wbg_get_blockrange_end(this.__wbg_ptr)
		return BigInt.asUintN(64, ret)
	}
	/**
	 * Last block height in range
	 * @param {bigint} arg0
	 */
	set end(arg0) {
		wasm.__wbg_set_blockrange_end(this.__wbg_ptr, arg0)
	}
}

const ConnectionCountersSnapshotFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_connectioncounterssnapshot_free(ptr >>> 0, 1))
/**
 */
export class ConnectionCountersSnapshot {
	static __wrap(ptr) {
		ptr = ptr >>> 0
		const obj = Object.create(ConnectionCountersSnapshot.prototype)
		obj.__wbg_ptr = ptr
		ConnectionCountersSnapshotFinalization.register(obj, obj.__wbg_ptr, obj)
		return obj
	}

	toJSON() {
		return {
			num_connections: this.num_connections,
			num_pending: this.num_pending,
			num_pending_incoming: this.num_pending_incoming,
			num_pending_outgoing: this.num_pending_outgoing,
			num_established: this.num_established,
			num_established_incoming: this.num_established_incoming,
			num_established_outgoing: this.num_established_outgoing,
		}
	}

	toString() {
		return JSON.stringify(this)
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		ConnectionCountersSnapshotFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_connectioncounterssnapshot_free(ptr, 0)
	}
	/**
	 * The total number of connections, both pending and established.
	 * @returns {number}
	 */
	get num_connections() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_connections(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * The total number of connections, both pending and established.
	 * @param {number} arg0
	 */
	set num_connections(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_connections(this.__wbg_ptr, arg0)
	}
	/**
	 * The total number of pending connections, both incoming and outgoing.
	 * @returns {number}
	 */
	get num_pending() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_pending(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * The total number of pending connections, both incoming and outgoing.
	 * @param {number} arg0
	 */
	set num_pending(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_pending(this.__wbg_ptr, arg0)
	}
	/**
	 * The total number of pending connections, both incoming and outgoing.
	 * @returns {number}
	 */
	get num_pending_incoming() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_pending_incoming(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * The total number of pending connections, both incoming and outgoing.
	 * @param {number} arg0
	 */
	set num_pending_incoming(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_pending_incoming(this.__wbg_ptr, arg0)
	}
	/**
	 * The number of outgoing connections being established.
	 * @returns {number}
	 */
	get num_pending_outgoing() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_pending_outgoing(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * The number of outgoing connections being established.
	 * @param {number} arg0
	 */
	set num_pending_outgoing(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_pending_outgoing(this.__wbg_ptr, arg0)
	}
	/**
	 * The number of outgoing connections being established.
	 * @returns {number}
	 */
	get num_established() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_established(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * The number of outgoing connections being established.
	 * @param {number} arg0
	 */
	set num_established(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_established(this.__wbg_ptr, arg0)
	}
	/**
	 * The number of established incoming connections.
	 * @returns {number}
	 */
	get num_established_incoming() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_established_incoming(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * The number of established incoming connections.
	 * @param {number} arg0
	 */
	set num_established_incoming(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_established_incoming(this.__wbg_ptr, arg0)
	}
	/**
	 * The number of established outgoing connections.
	 * @returns {number}
	 */
	get num_established_outgoing() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_established_outgoing(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * The number of established outgoing connections.
	 * @param {number} arg0
	 */
	set num_established_outgoing(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_established_outgoing(this.__wbg_ptr, arg0)
	}
}

const NetworkInfoSnapshotFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_networkinfosnapshot_free(ptr >>> 0, 1))
/**
 * Information about the connections
 */
export class NetworkInfoSnapshot {
	static __wrap(ptr) {
		ptr = ptr >>> 0
		const obj = Object.create(NetworkInfoSnapshot.prototype)
		obj.__wbg_ptr = ptr
		NetworkInfoSnapshotFinalization.register(obj, obj.__wbg_ptr, obj)
		return obj
	}

	toJSON() {
		return {
			num_peers: this.num_peers,
			connection_counters: this.connection_counters,
		}
	}

	toString() {
		return JSON.stringify(this)
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		NetworkInfoSnapshotFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_networkinfosnapshot_free(ptr, 0)
	}
	/**
	 * The number of connected peers, i.e. peers with whom at least one established connection exists.
	 * @returns {number}
	 */
	get num_peers() {
		const ret = wasm.__wbg_get_connectioncounterssnapshot_num_connections(this.__wbg_ptr)
		return ret >>> 0
	}
	/**
	 * The number of connected peers, i.e. peers with whom at least one established connection exists.
	 * @param {number} arg0
	 */
	set num_peers(arg0) {
		wasm.__wbg_set_connectioncounterssnapshot_num_connections(this.__wbg_ptr, arg0)
	}
	/**
	 * Gets counters for ongoing network connections.
	 * @returns {ConnectionCountersSnapshot}
	 */
	get connection_counters() {
		const ret = wasm.__wbg_get_networkinfosnapshot_connection_counters(this.__wbg_ptr)
		return ConnectionCountersSnapshot.__wrap(ret)
	}
	/**
	 * Gets counters for ongoing network connections.
	 * @param {ConnectionCountersSnapshot} arg0
	 */
	set connection_counters(arg0) {
		_assertClass(arg0, ConnectionCountersSnapshot)
		var ptr0 = arg0.__destroy_into_raw()
		wasm.__wbg_set_networkinfosnapshot_connection_counters(this.__wbg_ptr, ptr0)
	}
}

const NodeClientFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_nodeclient_free(ptr >>> 0, 1))
/**
 * `NodeClient` is responsible for steering [`NodeWorker`] by sending it commands and receiving
 * responses over the provided port.
 *
 * [`NodeWorker`]: crate::worker::NodeWorker
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
		wasm.__wbg_nodeclient_free(ptr, 0)
	}
	/**
	 * Create a new connection to a Lumina node running in [`NodeWorker`]. Provided `port` is
	 * expected to have `MessagePort`-like interface for sending and receiving messages.
	 * @param {any} port
	 */
	constructor(port) {
		const ret = wasm.nodeclient_new(addHeapObject(port))
		return takeObject(ret)
	}
	/**
	 * Establish a new connection to the existing worker over provided port
	 * @param {any} port
	 * @returns {Promise<void>}
	 */
	addConnectionToWorker(port) {
		const ret = wasm.nodeclient_addConnectionToWorker(this.__wbg_ptr, addHeapObject(port))
		return takeObject(ret)
	}
	/**
	 * Check whether Lumina is currently running
	 * @returns {Promise<boolean>}
	 */
	isRunning() {
		const ret = wasm.nodeclient_isRunning(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Start a node with the provided config, if it's not running
	 * @param {NodeConfig} config
	 * @returns {Promise<void>}
	 */
	start(config) {
		_assertClass(config, NodeConfig)
		const ret = wasm.nodeclient_start(this.__wbg_ptr, config.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * @returns {Promise<void>}
	 */
	stop() {
		const ret = wasm.nodeclient_stop(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get node's local peer ID.
	 * @returns {Promise<string>}
	 */
	localPeerId() {
		const ret = wasm.nodeclient_localPeerId(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get current [`PeerTracker`] info.
	 * @returns {Promise<PeerTrackerInfoSnapshot>}
	 */
	peerTrackerInfo() {
		const ret = wasm.nodeclient_peerTrackerInfo(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Wait until the node is connected to at least 1 peer.
	 * @returns {Promise<void>}
	 */
	waitConnected() {
		const ret = wasm.nodeclient_waitConnected(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Wait until the node is connected to at least 1 trusted peer.
	 * @returns {Promise<void>}
	 */
	waitConnectedTrusted() {
		const ret = wasm.nodeclient_waitConnectedTrusted(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get current network info.
	 * @returns {Promise<NetworkInfoSnapshot>}
	 */
	networkInfo() {
		const ret = wasm.nodeclient_networkInfo(this.__wbg_ptr)
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
	connectedPeers() {
		const ret = wasm.nodeclient_connectedPeers(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Trust or untrust the peer with a given ID.
	 * @param {string} peer_id
	 * @param {boolean} is_trusted
	 * @returns {Promise<void>}
	 */
	setPeerTrust(peer_id, is_trusted) {
		const ptr0 = passStringToWasm0(peer_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len0 = WASM_VECTOR_LEN
		const ret = wasm.nodeclient_setPeerTrust(this.__wbg_ptr, ptr0, len0, is_trusted)
		return takeObject(ret)
	}
	/**
	 * Request the head header from the network.
	 *
	 * Returns a javascript object with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @returns {Promise<any>}
	 */
	requestHeadHeader() {
		const ret = wasm.nodeclient_requestHeadHeader(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Request a header for the block with a given hash from the network.
	 *
	 * Returns a javascript object with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @param {string} hash
	 * @returns {Promise<any>}
	 */
	requestHeaderByHash(hash) {
		const ptr0 = passStringToWasm0(hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len0 = WASM_VECTOR_LEN
		const ret = wasm.nodeclient_requestHeaderByHash(this.__wbg_ptr, ptr0, len0)
		return takeObject(ret)
	}
	/**
	 * Request a header for the block with a given height from the network.
	 *
	 * Returns a javascript object with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @param {bigint} height
	 * @returns {Promise<any>}
	 */
	requestHeaderByHeight(height) {
		const ret = wasm.nodeclient_requestHeaderByHeight(this.__wbg_ptr, height)
		return takeObject(ret)
	}
	/**
	 * Request headers in range (from, from + amount] from the network.
	 *
	 * The headers will be verified with the `from` header.
	 *
	 * Returns an array of javascript objects with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @param {any} from_header
	 * @param {bigint} amount
	 * @returns {Promise<Array<any>>}
	 */
	requestVerifiedHeaders(from_header, amount) {
		const ret = wasm.nodeclient_requestVerifiedHeaders(this.__wbg_ptr, addHeapObject(from_header), amount)
		return takeObject(ret)
	}
	/**
	 * Get current header syncing info.
	 * @returns {Promise<SyncingInfoSnapshot>}
	 */
	syncerInfo() {
		const ret = wasm.nodeclient_syncerInfo(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get the latest header announced in the network.
	 *
	 * Returns a javascript object with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @returns {Promise<any>}
	 */
	getNetworkHeadHeader() {
		const ret = wasm.nodeclient_getNetworkHeadHeader(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get the latest locally synced header.
	 *
	 * Returns a javascript object with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @returns {Promise<any>}
	 */
	getLocalHeadHeader() {
		const ret = wasm.nodeclient_getLocalHeadHeader(this.__wbg_ptr)
		return takeObject(ret)
	}
	/**
	 * Get a synced header for the block with a given hash.
	 *
	 * Returns a javascript object with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @param {string} hash
	 * @returns {Promise<any>}
	 */
	getHeaderByHash(hash) {
		const ptr0 = passStringToWasm0(hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len0 = WASM_VECTOR_LEN
		const ret = wasm.nodeclient_getHeaderByHash(this.__wbg_ptr, ptr0, len0)
		return takeObject(ret)
	}
	/**
	 * Get a synced header for the block with a given height.
	 *
	 * Returns a javascript object with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @param {bigint} height
	 * @returns {Promise<any>}
	 */
	getHeaderByHeight(height) {
		const ret = wasm.nodeclient_getHeaderByHeight(this.__wbg_ptr, height)
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
	 *
	 * Returns an array of javascript objects with given structure:
	 * https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
	 * @param {bigint | undefined} [start_height]
	 * @param {bigint | undefined} [end_height]
	 * @returns {Promise<Array<any>>}
	 */
	getHeaders(start_height, end_height) {
		const ret = wasm.nodeclient_getHeaders(
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
	 *
	 * Returns a javascript object with given structure:
	 * https://docs.rs/lumina-node/latest/lumina_node/store/struct.SamplingMetadata.html
	 * @param {bigint} height
	 * @returns {Promise<any>}
	 */
	getSamplingMetadata(height) {
		const ret = wasm.nodeclient_getSamplingMetadata(this.__wbg_ptr, height)
		return takeObject(ret)
	}
	/**
	 * Returns a [`BroadcastChannel`] for events generated by [`Node`].
	 * @returns {Promise<BroadcastChannel>}
	 */
	eventsChannel() {
		const ret = wasm.nodeclient_eventsChannel(this.__wbg_ptr)
		return takeObject(ret)
	}
}

const NodeConfigFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_nodeconfig_free(ptr >>> 0, 1))
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

	toJSON() {
		return {
			network: this.network,
			bootnodes: this.bootnodes,
		}
	}

	toString() {
		return JSON.stringify(this)
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		NodeConfigFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_nodeconfig_free(ptr, 0)
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
			var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
			var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
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

const NodeWorkerFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_nodeworker_free(ptr >>> 0, 1))
/**
 */
export class NodeWorker {
	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		NodeWorkerFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_nodeworker_free(ptr, 0)
	}
	/**
	 * @param {any} port_like_object
	 */
	constructor(port_like_object) {
		const ret = wasm.nodeworker_new(addHeapObject(port_like_object))
		this.__wbg_ptr = ret >>> 0
		NodeWorkerFinalization.register(this, this.__wbg_ptr, this)
		return this
	}
	/**
	 * @returns {Promise<void>}
	 */
	run() {
		const ret = wasm.nodeworker_run(this.__wbg_ptr)
		return takeObject(ret)
	}
}

const PeerTrackerInfoSnapshotFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_peertrackerinfosnapshot_free(ptr >>> 0, 1))
/**
 * Statistics of the connected peers
 */
export class PeerTrackerInfoSnapshot {
	static __wrap(ptr) {
		ptr = ptr >>> 0
		const obj = Object.create(PeerTrackerInfoSnapshot.prototype)
		obj.__wbg_ptr = ptr
		PeerTrackerInfoSnapshotFinalization.register(obj, obj.__wbg_ptr, obj)
		return obj
	}

	toJSON() {
		return {
			num_connected_peers: this.num_connected_peers,
			num_connected_trusted_peers: this.num_connected_trusted_peers,
		}
	}

	toString() {
		return JSON.stringify(this)
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		PeerTrackerInfoSnapshotFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_peertrackerinfosnapshot_free(ptr, 0)
	}
	/**
	 * Number of the connected peers.
	 * @returns {bigint}
	 */
	get num_connected_peers() {
		const ret = wasm.__wbg_get_blockrange_start(this.__wbg_ptr)
		return BigInt.asUintN(64, ret)
	}
	/**
	 * Number of the connected peers.
	 * @param {bigint} arg0
	 */
	set num_connected_peers(arg0) {
		wasm.__wbg_set_blockrange_start(this.__wbg_ptr, arg0)
	}
	/**
	 * Number of the connected trusted peers.
	 * @returns {bigint}
	 */
	get num_connected_trusted_peers() {
		const ret = wasm.__wbg_get_blockrange_end(this.__wbg_ptr)
		return BigInt.asUintN(64, ret)
	}
	/**
	 * Number of the connected trusted peers.
	 * @param {bigint} arg0
	 */
	set num_connected_trusted_peers(arg0) {
		wasm.__wbg_set_blockrange_end(this.__wbg_ptr, arg0)
	}
}

const SyncingInfoSnapshotFinalization =
	typeof FinalizationRegistry === "undefined"
		? { register: () => {}, unregister: () => {} }
		: new FinalizationRegistry((ptr) => wasm.__wbg_syncinginfosnapshot_free(ptr >>> 0, 1))
/**
 * Status of the synchronization.
 */
export class SyncingInfoSnapshot {
	static __wrap(ptr) {
		ptr = ptr >>> 0
		const obj = Object.create(SyncingInfoSnapshot.prototype)
		obj.__wbg_ptr = ptr
		SyncingInfoSnapshotFinalization.register(obj, obj.__wbg_ptr, obj)
		return obj
	}

	toJSON() {
		return {
			stored_headers: this.stored_headers,
			subjective_head: this.subjective_head,
		}
	}

	toString() {
		return JSON.stringify(this)
	}

	__destroy_into_raw() {
		const ptr = this.__wbg_ptr
		this.__wbg_ptr = 0
		SyncingInfoSnapshotFinalization.unregister(this)
		return ptr
	}

	free() {
		const ptr = this.__destroy_into_raw()
		wasm.__wbg_syncinginfosnapshot_free(ptr, 0)
	}
	/**
	 * Ranges of headers that are already synchronised
	 * @returns {(BlockRange)[]}
	 */
	get stored_headers() {
		try {
			const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
			wasm.__wbg_get_syncinginfosnapshot_stored_headers(retptr, this.__wbg_ptr)
			var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
			var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
			var v1 = getArrayJsValueFromWasm0(r0, r1).slice()
			wasm.__wbindgen_free(r0, r1 * 4, 4)
			return v1
		} finally {
			wasm.__wbindgen_add_to_stack_pointer(16)
		}
	}
	/**
	 * Ranges of headers that are already synchronised
	 * @param {(BlockRange)[]} arg0
	 */
	set stored_headers(arg0) {
		const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc)
		const len0 = WASM_VECTOR_LEN
		wasm.__wbg_set_syncinginfosnapshot_stored_headers(this.__wbg_ptr, ptr0, len0)
	}
	/**
	 * Syncing target. The latest height seen in the network that was successfully verified.
	 * @returns {bigint}
	 */
	get subjective_head() {
		const ret = wasm.__wbg_get_blockrange_start(this.__wbg_ptr)
		return BigInt.asUintN(64, ret)
	}
	/**
	 * Syncing target. The latest height seen in the network that was successfully verified.
	 * @param {bigint} arg0
	 */
	set subjective_head(arg0) {
		wasm.__wbg_set_blockrange_start(this.__wbg_ptr, arg0)
	}
}

export function __wbindgen_object_drop_ref(arg0) {
	takeObject(arg0)
}

export function __wbindgen_cb_drop(arg0) {
	const obj = takeObject(arg0).original
	if (obj.cnt-- == 1) {
		obj.a = 0
		return true
	}
	const ret = false
	return ret
}

export function __wbindgen_is_array(arg0) {
	const ret = Array.isArray(getObject(arg0))
	return ret
}

export function __wbindgen_is_undefined(arg0) {
	const ret = getObject(arg0) === undefined
	return ret
}

export function __wbindgen_is_object(arg0) {
	const val = getObject(arg0)
	const ret = typeof val === "object" && val !== null
	return ret
}

export function __wbindgen_string_get(arg0, arg1) {
	const obj = getObject(arg1)
	const ret = typeof obj === "string" ? obj : undefined
	var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
	var len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbindgen_error_new(arg0, arg1) {
	const ret = new Error(getStringFromWasm0(arg0, arg1))
	return addHeapObject(ret)
}

export function __wbindgen_string_new(arg0, arg1) {
	const ret = getStringFromWasm0(arg0, arg1)
	return addHeapObject(ret)
}

export function __wbg_blockrange_unwrap(arg0) {
	const ret = BlockRange.__unwrap(takeObject(arg0))
	return ret
}

export function __wbindgen_is_string(arg0) {
	const ret = typeof getObject(arg0) === "string"
	return ret
}

export function __wbindgen_is_function(arg0) {
	const ret = typeof getObject(arg0) === "function"
	return ret
}

export function __wbindgen_as_number(arg0) {
	const ret = +getObject(arg0)
	return ret
}

export function __wbindgen_object_clone_ref(arg0) {
	const ret = getObject(arg0)
	return addHeapObject(ret)
}

export function __wbindgen_typeof(arg0) {
	const ret = typeof getObject(arg0)
	return addHeapObject(ret)
}

export function __wbg_nodeclient_new(arg0) {
	const ret = NodeClient.__wrap(arg0)
	return addHeapObject(ret)
}

export function __wbindgen_number_new(arg0) {
	const ret = arg0
	return addHeapObject(ret)
}

export function __wbg_networkinfosnapshot_new(arg0) {
	const ret = NetworkInfoSnapshot.__wrap(arg0)
	return addHeapObject(ret)
}

export function __wbg_peertrackerinfosnapshot_new(arg0) {
	const ret = PeerTrackerInfoSnapshot.__wrap(arg0)
	return addHeapObject(ret)
}

export function __wbg_blockrange_new(arg0) {
	const ret = BlockRange.__wrap(arg0)
	return addHeapObject(ret)
}

export function __wbg_syncinginfosnapshot_new(arg0) {
	const ret = SyncingInfoSnapshot.__wrap(arg0)
	return addHeapObject(ret)
}

export function __wbindgen_is_falsy(arg0) {
	const ret = !getObject(arg0)
	return ret
}

export function __wbindgen_boolean_get(arg0) {
	const v = getObject(arg0)
	const ret = typeof v === "boolean" ? (v ? 1 : 0) : 2
	return ret
}

export function __wbindgen_number_get(arg0, arg1) {
	const obj = getObject(arg1)
	const ret = typeof obj === "number" ? obj : undefined
	getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true)
}

export function __wbg_fetch_8788b327029c2d48(arg0) {
	const ret = fetch(getObject(arg0))
	return addHeapObject(ret)
}

export function __wbindgen_is_bigint(arg0) {
	const ret = typeof getObject(arg0) === "bigint"
	return ret
}

export function __wbindgen_in(arg0, arg1) {
	const ret = getObject(arg0) in getObject(arg1)
	return ret
}

export function __wbindgen_bigint_from_i64(arg0) {
	const ret = arg0
	return addHeapObject(ret)
}

export function __wbindgen_jsval_eq(arg0, arg1) {
	const ret = getObject(arg0) === getObject(arg1)
	return ret
}

export function __wbindgen_bigint_from_u64(arg0) {
	const ret = BigInt.asUintN(64, arg0)
	return addHeapObject(ret)
}

export function __wbg_postMessage_a0cda594c0cb2fa4() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).postMessage(getObject(arg1))
	}, arguments)
}

export function __wbg_postMessage_98bcdaf481623cda() {
	return handleError(function (arg0, arg1, arg2) {
		getObject(arg0).postMessage(getObject(arg1), getObject(arg2))
	}, arguments)
}

export function __wbg_new_abda76e883ba8a5f() {
	const ret = new Error()
	return addHeapObject(ret)
}

export function __wbg_stack_658279fe44541cf6(arg0, arg1) {
	const ret = getObject(arg1).stack
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_error_f851667af71bcfc6(arg0, arg1) {
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

export const __wbg_clearTimeout_dcd8af0d51e990da = typeof clearTimeout == "function" ? clearTimeout : notDefined("clearTimeout")

export function __wbg_setTimeout_7a10a7e4d1273797(arg0, arg1) {
	const ret = setTimeout(getObject(arg0), arg1 >>> 0)
	return ret
}

export function __wbindgen_is_null(arg0) {
	const ret = getObject(arg0) === null
	return ret
}

export function __wbg_clearTimeout_541ac0980ffcef74(arg0) {
	const ret = clearTimeout(takeObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_clearInterval_7f51e4380e64c6c5(arg0) {
	const ret = clearInterval(takeObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_setTimeout_7d81d052875b0f4f() {
	return handleError(function (arg0, arg1) {
		const ret = setTimeout(getObject(arg0), arg1)
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_setInterval_e227d4d8a9d44d66() {
	return handleError(function (arg0, arg1) {
		const ret = setInterval(getObject(arg0), arg1)
		return addHeapObject(ret)
	}, arguments)
}

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
	const ret = getObject(arg0) == getObject(arg1)
	return ret
}

export function __wbg_String_b9412f8799faab3e(arg0, arg1) {
	const ret = String(getObject(arg1))
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_getwithrefkey_edc2c8960f0f1191(arg0, arg1) {
	const ret = getObject(arg0)[getObject(arg1)]
	return addHeapObject(ret)
}

export function __wbg_set_f975102236d3c502(arg0, arg1, arg2) {
	getObject(arg0)[takeObject(arg1)] = takeObject(arg2)
}

export function __wbg_instanceof_WebTransportBidirectionalStream_70b0a7cc2c4bf751(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof WebTransportBidirectionalStream
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_ready_9ddf4efeab609ba5(arg0) {
	const ret = getObject(arg0).ready
	return addHeapObject(ret)
}

export function __wbg_closed_bab1971a43e2d966(arg0) {
	const ret = getObject(arg0).closed
	return addHeapObject(ret)
}

export function __wbg_incomingBidirectionalStreams_1675813a7f64da3f(arg0) {
	const ret = getObject(arg0).incomingBidirectionalStreams
	return addHeapObject(ret)
}

export function __wbg_new_a769ee7b91c82ffc() {
	return handleError(function (arg0, arg1) {
		const ret = new WebTransport(getStringFromWasm0(arg0, arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_newwithoptions_ebf0d9b96b354471() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = new WebTransport(getStringFromWasm0(arg0, arg1), getObject(arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_close_adf2df3b9682035f(arg0) {
	getObject(arg0).close()
}

export function __wbg_createBidirectionalStream_e604ff9464076683(arg0) {
	const ret = getObject(arg0).createBidirectionalStream()
	return addHeapObject(ret)
}

export function __wbg_readable_7e977276662c88d8(arg0) {
	const ret = getObject(arg0).readable
	return addHeapObject(ret)
}

export function __wbg_writable_bd1bdd26d4e17424(arg0) {
	const ret = getObject(arg0).writable
	return addHeapObject(ret)
}

export function __wbg_WorkerGlobalScope_c44775816e379c0e(arg0) {
	const ret = getObject(arg0).WorkerGlobalScope
	return addHeapObject(ret)
}

export function __wbg_instanceof_Window_5012736c80a01584(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof Window
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_navigator_6210380287bf8581(arg0) {
	const ret = getObject(arg0).navigator
	return addHeapObject(ret)
}

export function __wbg_clearInterval_df3409c32c572e85(arg0, arg1) {
	getObject(arg0).clearInterval(arg1)
}

export function __wbg_setInterval_d4a371ef4db258a7() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		const ret = getObject(arg0).setInterval(getObject(arg1), arg2, ...getObject(arg3))
		return ret
	}, arguments)
}

export function __wbg_navigator_db73b5b11a0c5c93(arg0) {
	const ret = getObject(arg0).navigator
	return addHeapObject(ret)
}

export function __wbg_clearInterval_26e463ce3f550c4b(arg0, arg1) {
	getObject(arg0).clearInterval(arg1)
}

export function __wbg_setInterval_1758524273ba5b22() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		const ret = getObject(arg0).setInterval(getObject(arg1), arg2, ...getObject(arg3))
		return ret
	}, arguments)
}

export function __wbg_new_699704451bc0e988() {
	return handleError(function (arg0, arg1) {
		const ret = new BroadcastChannel(getStringFromWasm0(arg0, arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_postMessage_b33651b7ca54b884() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).postMessage(getObject(arg1))
	}, arguments)
}

export function __wbg_instanceof_DedicatedWorkerGlobalScope_a7feec288dff4a90(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof DedicatedWorkerGlobalScope
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_only_8e9aa7d9138d3f35() {
	return handleError(function (arg0) {
		const ret = IDBKeyRange.only(getObject(arg0))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_instanceof_IdbOpenDbRequest_c0d2e9c902441588(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof IDBOpenDBRequest
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_setonupgradeneeded_8f3f0ac5d7130a6f(arg0, arg1) {
	getObject(arg0).onupgradeneeded = getObject(arg1)
}

export function __wbg_instanceof_ReadableStreamDefaultReader_742c2b00918b6df9(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof ReadableStreamDefaultReader
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_read_e48a676fb81ea800(arg0) {
	const ret = getObject(arg0).read()
	return addHeapObject(ret)
}

export function __wbg_cancel_97a2795574a4f522(arg0) {
	const ret = getObject(arg0).cancel()
	return addHeapObject(ret)
}

export function __wbg_instanceof_ServiceWorkerGlobalScope_a3193d7890354db3(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof ServiceWorkerGlobalScope
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_readyState_7237e2b1adac03a6(arg0) {
	const ret = getObject(arg0).readyState
	return ret
}

export function __wbg_bufferedAmount_77ba515edae4df34(arg0) {
	const ret = getObject(arg0).bufferedAmount
	return ret
}

export function __wbg_setonopen_7e770c87269cae90(arg0, arg1) {
	getObject(arg0).onopen = getObject(arg1)
}

export function __wbg_setonerror_5ec4625df3060159(arg0, arg1) {
	getObject(arg0).onerror = getObject(arg1)
}

export function __wbg_setonclose_40f935717ad6ffcd(arg0, arg1) {
	getObject(arg0).onclose = getObject(arg1)
}

export function __wbg_setonmessage_b670c12ea34acd8b(arg0, arg1) {
	getObject(arg0).onmessage = getObject(arg1)
}

export function __wbg_setbinaryType_d164a0be4c212c9c(arg0, arg1) {
	getObject(arg0).binaryType = ["blob", "arraybuffer"][arg1]
}

export function __wbg_new_0bf4a5b0632517ed() {
	return handleError(function (arg0, arg1) {
		const ret = new WebSocket(getStringFromWasm0(arg0, arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_close_0a0cd79519b11318() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		getObject(arg0).close(arg1, getStringFromWasm0(arg2, arg3))
	}, arguments)
}

export function __wbg_send_1b333b26681a902d() {
	return handleError(function (arg0, arg1, arg2) {
		getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2))
	}, arguments)
}

export function __wbg_debug_5a33c41aeac15ee6(arg0) {
	console.debug(getObject(arg0))
}

export function __wbg_error_09480e4aadca50ad(arg0) {
	console.error(getObject(arg0))
}

export function __wbg_info_c261acb2deacd903(arg0) {
	console.info(getObject(arg0))
}

export function __wbg_warn_2b3adb99ce26c314(arg0) {
	console.warn(getObject(arg0))
}

export function __wbg_indexNames_f6708f233630e491(arg0) {
	const ret = getObject(arg0).indexNames
	return addHeapObject(ret)
}

export function __wbg_add_534cfd1b901a15b4() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).add(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_add_4d2791d6295ba9ec() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).add(getObject(arg1), getObject(arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_clear_324ffb9a7c18a41c() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).clear()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_count_7b9a7e71c616b931() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).count()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_count_89ec71d494623a00() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).count(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_createIndex_6d4c3e20ee0f1066() {
	return handleError(function (arg0, arg1, arg2, arg3, arg4) {
		const ret = getObject(arg0).createIndex(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_delete_34764ece57bdc720() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).delete(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_deleteIndex_86b1a90a771f3fd2() {
	return handleError(function (arg0, arg1, arg2) {
		getObject(arg0).deleteIndex(getStringFromWasm0(arg1, arg2))
	}, arguments)
}

export function __wbg_get_88b5e79e9daccb9f() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).get(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_getAll_754dfd3c399e3aa2() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).getAll()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_getAll_cf97564e37784cbe() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).getAll(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_getAll_a97ae2dbaa2373f9() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).getAll(getObject(arg1), arg2 >>> 0)
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_getAllKeys_404d5487a041555d() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).getAllKeys()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_getAllKeys_0496b6bb8aa48052() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).getAllKeys(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_getAllKeys_f676e7c1f7048fee() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).getAllKeys(getObject(arg1), arg2 >>> 0)
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_index_c90226e82bd94b45() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).index(getStringFromWasm0(arg1, arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_openCursor_728ede41c2e2d7ec() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).openCursor()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_openCursor_8ca06744434102da() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).openCursor(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_openCursor_3193d7a663a8bc61() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).openCursor(getObject(arg1), ["next", "nextunique", "prev", "prevunique"][arg2])
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_put_b697dfdbcfb0598f() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).put(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_put_f83d95662936dee7() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).put(getObject(arg1), getObject(arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_instanceof_IdbDatabase_2c9f91b2db322a72(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof IDBDatabase
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_objectStoreNames_2fc72464aff4baed(arg0) {
	const ret = getObject(arg0).objectStoreNames
	return addHeapObject(ret)
}

export function __wbg_setonversionchange_b1a0928064e9b758(arg0, arg1) {
	getObject(arg0).onversionchange = getObject(arg1)
}

export function __wbg_close_7bef29d1d5feecdb(arg0) {
	getObject(arg0).close()
}

export function __wbg_createObjectStore_cfb780710dbc3ad2() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		const ret = getObject(arg0).createObjectStore(getStringFromWasm0(arg1, arg2), getObject(arg3))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_deleteObjectStore_745da9b507613eca() {
	return handleError(function (arg0, arg1, arg2) {
		getObject(arg0).deleteObjectStore(getStringFromWasm0(arg1, arg2))
	}, arguments)
}

export function __wbg_transaction_66168ca19ab39a78() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).transaction(
			getObject(arg1),
			["readonly", "readwrite", "versionchange", "readwriteflush", "cleanup"][arg2],
		)
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_instanceof_SharedWorkerGlobalScope_78edb7d25b55ea60(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof SharedWorkerGlobalScope
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_instanceof_IdbTransaction_d3f561bdf80cbd35(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof IDBTransaction
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_error_5c7bb46bfc30aee8(arg0) {
	const ret = getObject(arg0).error
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_setonabort_aedc77f0151af20c(arg0, arg1) {
	getObject(arg0).onabort = getObject(arg1)
}

export function __wbg_setoncomplete_a9e0ec1d6568a6d9(arg0, arg1) {
	getObject(arg0).oncomplete = getObject(arg1)
}

export function __wbg_setonerror_00500154a07e987d(arg0, arg1) {
	getObject(arg0).onerror = getObject(arg1)
}

export function __wbg_abort_91c8863e70a93d96() {
	return handleError(function (arg0) {
		getObject(arg0).abort()
	}, arguments)
}

export function __wbg_commit_d40764961dd886fa() {
	return handleError(function (arg0) {
		getObject(arg0).commit()
	}, arguments)
}

export function __wbg_objectStore_80724f9f6d33ab5b() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_now_a69647afb1f66247(arg0) {
	const ret = getObject(arg0).now()
	return ret
}

export function __wbg_getWriter_300edebcd3c2c126() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).getWriter()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_setmethod_dc68a742c2db5c6a(arg0, arg1, arg2) {
	getObject(arg0).method = getStringFromWasm0(arg1, arg2)
}

export function __wbg_setmode_a781aae2bd3df202(arg0, arg1) {
	getObject(arg0).mode = ["same-origin", "no-cors", "cors", "navigate"][arg1]
}

export function __wbg_length_82021578cc4f0d2c(arg0) {
	const ret = getObject(arg0).length
	return ret
}

export function __wbg_get_913f8df8566b2d82(arg0, arg1, arg2) {
	const ret = getObject(arg1)[arg2 >>> 0]
	var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
	var len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbg_key_37c613728ba0b769() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).key
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_request_3c4da92b3538e80a(arg0) {
	const ret = getObject(arg0).request
	return addHeapObject(ret)
}

export function __wbg_advance_0922866a23942467() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).advance(arg1 >>> 0)
	}, arguments)
}

export function __wbg_continue_a92b4c9f17458897() {
	return handleError(function (arg0) {
		getObject(arg0).continue()
	}, arguments)
}

export function __wbg_continue_6672b1997d5c8efb() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).continue(getObject(arg1))
	}, arguments)
}

export function __wbg_persist_449ac4ddd01ee63f() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).persist()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_userAgent_105bbcdb33968848() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg1).userAgent
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}, arguments)
}

export function __wbg_storage_947fc01a38842a90(arg0) {
	const ret = getObject(arg0).storage
	return addHeapObject(ret)
}

export function __wbg_target_b7cb1739bee70928(arg0) {
	const ret = getObject(arg0).target
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_instanceof_Response_e91b7eb7c611a9ae(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof Response
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_json_3555ed3b0ef0dcad() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).json()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_getReader_1997658275516cc3(arg0) {
	const ret = getObject(arg0).getReader()
	return addHeapObject(ret)
}

export function __wbg_instanceof_IdbFactory_9c1359c26643add1(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof IDBFactory
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_open_a89af1720976a433() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_open_e8f45f3526088828() {
	return handleError(function (arg0, arg1, arg2, arg3) {
		const ret = getObject(arg0).open(getStringFromWasm0(arg1, arg2), arg3 >>> 0)
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_headers_7d46f181de2aa1dd(arg0) {
	const ret = getObject(arg0).headers
	return addHeapObject(ret)
}

export function __wbg_newwithstrandinit_a31c69e4cc337183() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_closed_308162adc3f122f3(arg0) {
	const ret = getObject(arg0).closed
	return addHeapObject(ret)
}

export function __wbg_desiredSize_82fd81d4149bca9a() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg1).desiredSize
		getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true)
	}, arguments)
}

export function __wbg_ready_466364612ddb7cc4(arg0) {
	const ret = getObject(arg0).ready
	return addHeapObject(ret)
}

export function __wbg_close_b4499ff2e2550f21(arg0) {
	const ret = getObject(arg0).close()
	return addHeapObject(ret)
}

export function __wbg_write_8c6e3bf306db71f2(arg0, arg1) {
	const ret = getObject(arg0).write(getObject(arg1))
	return addHeapObject(ret)
}

export function __wbg_instanceof_IdbCursorWithValue_2302382a73f62174(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof IDBCursorWithValue
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_value_d4be628e515b251f() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).value
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_userAgent_58dedff4303aeb66() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg1).userAgent
		const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
		const len1 = WASM_VECTOR_LEN
		getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
		getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
	}, arguments)
}

export function __wbg_storage_0016c19400b7c179(arg0) {
	const ret = getObject(arg0).storage
	return addHeapObject(ret)
}

export function __wbg_setmultientry_a4c0f50fb1bb8977(arg0, arg1) {
	getObject(arg0).multiEntry = arg1 !== 0
}

export function __wbg_setunique_6f46c3f803001492(arg0, arg1) {
	getObject(arg0).unique = arg1 !== 0
}

export function __wbg_setautoincrement_56aa89e6d3e15210(arg0, arg1) {
	getObject(arg0).autoIncrement = arg1 !== 0
}

export function __wbg_setkeypath_e6a7c50640d3005a(arg0, arg1) {
	getObject(arg0).keyPath = getObject(arg1)
}

export function __wbg_set_b3c7c6d2e5e783d6() {
	return handleError(function (arg0, arg1, arg2, arg3, arg4) {
		getObject(arg0).set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4))
	}, arguments)
}

export function __wbg_instanceof_IdbRequest_44d99b46adafe829(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof IDBRequest
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_result_fd2dae625828961d() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).result
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_error_1221bc1f1d0b14d3() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).error
		return isLikeNone(ret) ? 0 : addHeapObject(ret)
	}, arguments)
}

export function __wbg_transaction_0549f2d854da77a6(arg0) {
	const ret = getObject(arg0).transaction
	return isLikeNone(ret) ? 0 : addHeapObject(ret)
}

export function __wbg_setonsuccess_962c293b6e38a5d5(arg0, arg1) {
	getObject(arg0).onsuccess = getObject(arg1)
}

export function __wbg_setonerror_bd61d0a61808ca40(arg0, arg1) {
	getObject(arg0).onerror = getObject(arg1)
}

export function __wbg_data_5c47a6985fefc490(arg0) {
	const ret = getObject(arg0).data
	return addHeapObject(ret)
}

export function __wbg_ports_6e856b8ee68d6242(arg0) {
	const ret = getObject(arg0).ports
	return addHeapObject(ret)
}

export function __wbg_keyPath_99296ea462206d00() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).keyPath
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_multiEntry_986f6867169805dd(arg0) {
	const ret = getObject(arg0).multiEntry
	return ret
}

export function __wbg_unique_3abe1f8c203c19fd(arg0) {
	const ret = getObject(arg0).unique
	return ret
}

export function __wbg_count_bb99b5211d93738d() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).count()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_count_aa9c1d027bfed24b() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).count(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_get_b51eae1c0542125a() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).get(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_queueMicrotask_48421b3cc9052b68(arg0) {
	const ret = getObject(arg0).queueMicrotask
	return addHeapObject(ret)
}

export function __wbg_queueMicrotask_12a30234db4045d3(arg0) {
	queueMicrotask(getObject(arg0))
}

export function __wbg_clearTimeout_76877dbc010e786d(arg0) {
	const ret = clearTimeout(takeObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_setTimeout_75cb9b6991a4031d() {
	return handleError(function (arg0, arg1) {
		const ret = setTimeout(getObject(arg0), arg1)
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_performance_a1b8bde2ee512264(arg0) {
	const ret = getObject(arg0).performance
	return addHeapObject(ret)
}

export function __wbg_now_abd80e969af37148(arg0) {
	const ret = getObject(arg0).now()
	return ret
}

export function __wbg_crypto_1d1f22824a6a080c(arg0) {
	const ret = getObject(arg0).crypto
	return addHeapObject(ret)
}

export function __wbg_process_4a72847cc503995b(arg0) {
	const ret = getObject(arg0).process
	return addHeapObject(ret)
}

export function __wbg_versions_f686565e586dd935(arg0) {
	const ret = getObject(arg0).versions
	return addHeapObject(ret)
}

export function __wbg_node_104a2ff8d6ea03a2(arg0) {
	const ret = getObject(arg0).node
	return addHeapObject(ret)
}

export function __wbg_require_cca90b1a94a0255b() {
	return handleError(function () {
		const ret = module.require
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_msCrypto_eb05e62b530a1508(arg0) {
	const ret = getObject(arg0).msCrypto
	return addHeapObject(ret)
}

export function __wbg_randomFillSync_5c9c955aa56b6049() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).randomFillSync(takeObject(arg1))
	}, arguments)
}

export function __wbg_getRandomValues_3aa56aa6edec874c() {
	return handleError(function (arg0, arg1) {
		getObject(arg0).getRandomValues(getObject(arg1))
	}, arguments)
}

export function __wbg_get_3baa728f9d58d3f6(arg0, arg1) {
	const ret = getObject(arg0)[arg1 >>> 0]
	return addHeapObject(ret)
}

export function __wbg_length_ae22078168b726f5(arg0) {
	const ret = getObject(arg0).length
	return ret
}

export function __wbg_new_a220cf903aa02ca2() {
	const ret = new Array()
	return addHeapObject(ret)
}

export function __wbg_newnoargs_76313bd6ff35d0f2(arg0, arg1) {
	const ret = new Function(getStringFromWasm0(arg0, arg1))
	return addHeapObject(ret)
}

export function __wbg_new_8608a2b51a5f6737() {
	const ret = new Map()
	return addHeapObject(ret)
}

export function __wbg_next_de3e9db4440638b2(arg0) {
	const ret = getObject(arg0).next
	return addHeapObject(ret)
}

export function __wbg_next_f9cb570345655b9a() {
	return handleError(function (arg0) {
		const ret = getObject(arg0).next()
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_done_bfda7aa8f252b39f(arg0) {
	const ret = getObject(arg0).done
	return ret
}

export function __wbg_value_6d39332ab4788d86(arg0) {
	const ret = getObject(arg0).value
	return addHeapObject(ret)
}

export function __wbg_iterator_888179a48810a9fe() {
	const ret = Symbol.iterator
	return addHeapObject(ret)
}

export function __wbg_get_224d16597dbbfd96() {
	return handleError(function (arg0, arg1) {
		const ret = Reflect.get(getObject(arg0), getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_call_1084a111329e68ce() {
	return handleError(function (arg0, arg1) {
		const ret = getObject(arg0).call(getObject(arg1))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_new_525245e2b9901204() {
	const ret = new Object()
	return addHeapObject(ret)
}

export function __wbg_self_3093d5d1f7bcb682() {
	return handleError(function () {
		const ret = self.self
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_window_3bcfc4d31bc012f8() {
	return handleError(function () {
		const ret = window.window
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_globalThis_86b222e13bdf32ed() {
	return handleError(function () {
		const ret = globalThis.globalThis
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_global_e5a3fe56f8be9485() {
	return handleError(function () {
		const ret = global.global
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_set_673dda6c73d19609(arg0, arg1, arg2) {
	getObject(arg0)[arg1 >>> 0] = takeObject(arg2)
}

export function __wbg_from_0791d740a9d37830(arg0) {
	const ret = Array.from(getObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_isArray_8364a5371e9737d8(arg0) {
	const ret = Array.isArray(getObject(arg0))
	return ret
}

export function __wbg_of_4a1c869ef05b4b73(arg0) {
	const ret = Array.of(getObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_push_37c89022f34c01ca(arg0, arg1) {
	const ret = getObject(arg0).push(getObject(arg1))
	return ret
}

export function __wbg_instanceof_ArrayBuffer_61dfc3198373c902(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof ArrayBuffer
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_instanceof_Error_69bde193b0cc95e3(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof Error
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_new_796382978dfd4fb0(arg0, arg1) {
	const ret = new Error(getStringFromWasm0(arg0, arg1))
	return addHeapObject(ret)
}

export function __wbg_cause_a84a2d408263556b(arg0) {
	const ret = getObject(arg0).cause
	return addHeapObject(ret)
}

export function __wbg_setcause_95acfe0bd827ffdb(arg0, arg1) {
	getObject(arg0).cause = getObject(arg1)
}

export function __wbg_message_e18bae0a0e2c097a(arg0) {
	const ret = getObject(arg0).message
	return addHeapObject(ret)
}

export function __wbg_name_ac78212e803c7941(arg0) {
	const ret = getObject(arg0).name
	return addHeapObject(ret)
}

export function __wbg_toString_9d18e102ca933e68(arg0) {
	const ret = getObject(arg0).toString()
	return addHeapObject(ret)
}

export function __wbg_call_89af060b4e1523f2() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = getObject(arg0).call(getObject(arg1), getObject(arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_instanceof_Map_763ce0e95960d55e(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof Map
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_set_49185437f0ab06f8(arg0, arg1, arg2) {
	const ret = getObject(arg0).set(getObject(arg1), getObject(arg2))
	return addHeapObject(ret)
}

export function __wbg_isSafeInteger_7f1ed56200d90674(arg0) {
	const ret = Number.isSafeInteger(getObject(arg0))
	return ret
}

export function __wbg_getTime_91058879093a1589(arg0) {
	const ret = getObject(arg0).getTime()
	return ret
}

export function __wbg_new0_65387337a95cf44d() {
	const ret = new Date()
	return addHeapObject(ret)
}

export function __wbg_now_b7a162010a9e75b4() {
	const ret = Date.now()
	return ret
}

export function __wbg_entries_7a0e06255456ebcd(arg0) {
	const ret = Object.entries(getObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_new_b85e72ed1bfd57f9(arg0, arg1) {
	try {
		var state0 = { a: arg0, b: arg1 }
		var cb0 = (arg0, arg1) => {
			const a = state0.a
			state0.a = 0
			try {
				return __wbg_adapter_552(a, state0.b, arg0, arg1)
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

export function __wbg_resolve_570458cb99d56a43(arg0) {
	const ret = Promise.resolve(getObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_catch_a279b1da46d132d8(arg0, arg1) {
	const ret = getObject(arg0).catch(getObject(arg1))
	return addHeapObject(ret)
}

export function __wbg_then_95e6edc0f89b73b1(arg0, arg1) {
	const ret = getObject(arg0).then(getObject(arg1))
	return addHeapObject(ret)
}

export function __wbg_then_876bb3c633745cc6(arg0, arg1, arg2) {
	const ret = getObject(arg0).then(getObject(arg1), getObject(arg2))
	return addHeapObject(ret)
}

export function __wbg_buffer_b7b08af79b0b0974(arg0) {
	const ret = getObject(arg0).buffer
	return addHeapObject(ret)
}

export function __wbg_newwithbyteoffsetandlength_8a2cb9ca96b27ec9(arg0, arg1, arg2) {
	const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0)
	return addHeapObject(ret)
}

export function __wbg_new_ea1883e1e5e86686(arg0) {
	const ret = new Uint8Array(getObject(arg0))
	return addHeapObject(ret)
}

export function __wbg_set_d1e79e2388520f18(arg0, arg1, arg2) {
	getObject(arg0).set(getObject(arg1), arg2 >>> 0)
}

export function __wbg_length_8339fcf5d8ecd12e(arg0) {
	const ret = getObject(arg0).length
	return ret
}

export function __wbg_instanceof_Uint8Array_247a91427532499e(arg0) {
	let result
	try {
		result = getObject(arg0) instanceof Uint8Array
	} catch (_) {
		result = false
	}
	const ret = result
	return ret
}

export function __wbg_newwithlength_ec548f448387c968(arg0) {
	const ret = new Uint8Array(arg0 >>> 0)
	return addHeapObject(ret)
}

export function __wbg_subarray_7c2e3576afe181d1(arg0, arg1, arg2) {
	const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0)
	return addHeapObject(ret)
}

export function __wbg_slice_b698b331b2ab7d72(arg0, arg1, arg2) {
	const ret = getObject(arg0).slice(arg1 >>> 0, arg2 >>> 0)
	return addHeapObject(ret)
}

export function __wbg_byteLength_850664ef28f3e42f(arg0) {
	const ret = getObject(arg0).byteLength
	return ret
}

export const __wbg_random_4a6f48b07d1eab14 = typeof Math.random == "function" ? Math.random : notDefined("Math.random")

export function __wbg_apply_64f7fdc797dfb4f3() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = Reflect.apply(getObject(arg0), getObject(arg1), getObject(arg2))
		return addHeapObject(ret)
	}, arguments)
}

export function __wbg_has_4bfbc01db38743f7() {
	return handleError(function (arg0, arg1) {
		const ret = Reflect.has(getObject(arg0), getObject(arg1))
		return ret
	}, arguments)
}

export function __wbg_set_eacc7d73fefaafdf() {
	return handleError(function (arg0, arg1, arg2) {
		const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2))
		return ret
	}, arguments)
}

export function __wbindgen_bigint_get_as_i64(arg0, arg1) {
	const v = getObject(arg1)
	const ret = typeof v === "bigint" ? v : undefined
	getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true)
}

export function __wbindgen_debug_string(arg0, arg1) {
	const ret = debugString(getObject(arg1))
	const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
	const len1 = WASM_VECTOR_LEN
	getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
	getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
}

export function __wbindgen_throw(arg0, arg1) {
	throw new Error(getStringFromWasm0(arg0, arg1))
}

export function __wbindgen_memory() {
	const ret = wasm.memory
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper1002(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 222, __wbg_adapter_58)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper1003(arg0, arg1, arg2) {
	const ret = makeClosure(arg0, arg1, 222, __wbg_adapter_61)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper1004(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 222, __wbg_adapter_64)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper1007(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 222, __wbg_adapter_58)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper1010(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 222, __wbg_adapter_58)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper4552(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 1478, __wbg_adapter_71)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper4611(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 1483, __wbg_adapter_74)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper5468(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 1844, __wbg_adapter_77)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper5500(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 1870, __wbg_adapter_80)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper5501(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 1870, __wbg_adapter_80)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper5502(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 1870, __wbg_adapter_80)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper7750(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 2512, __wbg_adapter_87)
	return addHeapObject(ret)
}

export function __wbindgen_closure_wrapper7858(arg0, arg1, arg2) {
	const ret = makeMutClosure(arg0, arg1, 2572, __wbg_adapter_90)
	return addHeapObject(ret)
}
