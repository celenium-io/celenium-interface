/* tslint:disable */
/* eslint-disable */
/**
* Set up a logging layer that direct logs to the browser's console.
*/
export function setup_logging(): void;
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
* A range of blocks between `start` and `end` height, inclusive
*/
export class BlockRange {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Last block height in range
*/
  end: bigint;
/**
* First block height in range
*/
  start: bigint;
}
/**
*/
export class ConnectionCountersSnapshot {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* The total number of connections, both pending and established.
*/
  num_connections: number;
/**
* The number of outgoing connections being established.
*/
  num_established: number;
/**
* The number of established incoming connections.
*/
  num_established_incoming: number;
/**
* The number of established outgoing connections.
*/
  num_established_outgoing: number;
/**
* The total number of pending connections, both incoming and outgoing.
*/
  num_pending: number;
/**
* The total number of pending connections, both incoming and outgoing.
*/
  num_pending_incoming: number;
/**
* The number of outgoing connections being established.
*/
  num_pending_outgoing: number;
}
/**
* Information about the connections
*/
export class NetworkInfoSnapshot {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Gets counters for ongoing network connections.
*/
  connection_counters: ConnectionCountersSnapshot;
/**
* The number of connected peers, i.e. peers with whom at least one established connection exists.
*/
  num_peers: number;
}
/**
* `NodeClient` is responsible for steering [`NodeWorker`] by sending it commands and receiving
* responses over the provided port.
*
* [`NodeWorker`]: crate::worker::NodeWorker
*/
export class NodeClient {
  free(): void;
/**
* Create a new connection to a Lumina node running in [`NodeWorker`]. Provided `port` is
* expected to have `MessagePort`-like interface for sending and receiving messages.
* @param {any} port
*/
  constructor(port: any);
/**
* Establish a new connection to the existing worker over provided port
* @param {any} port
* @returns {Promise<void>}
*/
  addConnectionToWorker(port: any): Promise<void>;
/**
* Check whether Lumina is currently running
* @returns {Promise<boolean>}
*/
  isRunning(): Promise<boolean>;
/**
* Start a node with the provided config, if it's not running
* @param {NodeConfig} config
* @returns {Promise<void>}
*/
  start(config: NodeConfig): Promise<void>;
/**
* @returns {Promise<void>}
*/
  stop(): Promise<void>;
/**
* Get node's local peer ID.
* @returns {Promise<string>}
*/
  localPeerId(): Promise<string>;
/**
* Get current [`PeerTracker`] info.
* @returns {Promise<PeerTrackerInfoSnapshot>}
*/
  peerTrackerInfo(): Promise<PeerTrackerInfoSnapshot>;
/**
* Wait until the node is connected to at least 1 peer.
* @returns {Promise<void>}
*/
  waitConnected(): Promise<void>;
/**
* Wait until the node is connected to at least 1 trusted peer.
* @returns {Promise<void>}
*/
  waitConnectedTrusted(): Promise<void>;
/**
* Get current network info.
* @returns {Promise<NetworkInfoSnapshot>}
*/
  networkInfo(): Promise<NetworkInfoSnapshot>;
/**
* Get all the multiaddresses on which the node listens.
* @returns {Promise<Array<any>>}
*/
  listeners(): Promise<Array<any>>;
/**
* Get all the peers that node is connected to.
* @returns {Promise<Array<any>>}
*/
  connectedPeers(): Promise<Array<any>>;
/**
* Trust or untrust the peer with a given ID.
* @param {string} peer_id
* @param {boolean} is_trusted
* @returns {Promise<void>}
*/
  setPeerTrust(peer_id: string, is_trusted: boolean): Promise<void>;
/**
* Request the head header from the network.
*
* Returns a javascript object with given structure:
* https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
* @returns {Promise<any>}
*/
  requestHeadHeader(): Promise<any>;
/**
* Request a header for the block with a given hash from the network.
*
* Returns a javascript object with given structure:
* https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
* @param {string} hash
* @returns {Promise<any>}
*/
  requestHeaderByHash(hash: string): Promise<any>;
/**
* Request a header for the block with a given height from the network.
*
* Returns a javascript object with given structure:
* https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
* @param {bigint} height
* @returns {Promise<any>}
*/
  requestHeaderByHeight(height: bigint): Promise<any>;
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
  requestVerifiedHeaders(from_header: any, amount: bigint): Promise<Array<any>>;
/**
* Get current header syncing info.
* @returns {Promise<SyncingInfoSnapshot>}
*/
  syncerInfo(): Promise<SyncingInfoSnapshot>;
/**
* Get the latest header announced in the network.
*
* Returns a javascript object with given structure:
* https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
* @returns {Promise<any>}
*/
  getNetworkHeadHeader(): Promise<any>;
/**
* Get the latest locally synced header.
*
* Returns a javascript object with given structure:
* https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
* @returns {Promise<any>}
*/
  getLocalHeadHeader(): Promise<any>;
/**
* Get a synced header for the block with a given hash.
*
* Returns a javascript object with given structure:
* https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
* @param {string} hash
* @returns {Promise<any>}
*/
  getHeaderByHash(hash: string): Promise<any>;
/**
* Get a synced header for the block with a given height.
*
* Returns a javascript object with given structure:
* https://docs.rs/celestia-types/latest/celestia_types/struct.ExtendedHeader.html
* @param {bigint} height
* @returns {Promise<any>}
*/
  getHeaderByHeight(height: bigint): Promise<any>;
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
  getHeaders(start_height?: bigint, end_height?: bigint): Promise<Array<any>>;
/**
* Get data sampling metadata of an already sampled height.
*
* Returns a javascript object with given structure:
* https://docs.rs/lumina-node/latest/lumina_node/store/struct.SamplingMetadata.html
* @param {bigint} height
* @returns {Promise<any>}
*/
  getSamplingMetadata(height: bigint): Promise<any>;
/**
* Returns a [`BroadcastChannel`] for events generated by [`Node`].
* @returns {Promise<BroadcastChannel>}
*/
  eventsChannel(): Promise<BroadcastChannel>;
}
/**
* Config for the lumina wasm node.
*/
export class NodeConfig {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
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
/**
*/
export class NodeWorker {
  free(): void;
/**
* @param {any} port_like_object
*/
  constructor(port_like_object: any);
/**
* @returns {Promise<void>}
*/
  run(): Promise<void>;
}
/**
* Statistics of the connected peers
*/
export class PeerTrackerInfoSnapshot {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Number of the connected peers.
*/
  num_connected_peers: bigint;
/**
* Number of the connected trusted peers.
*/
  num_connected_trusted_peers: bigint;
}
/**
* Status of the synchronization.
*/
export class SyncingInfoSnapshot {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Ranges of headers that are already synchronised
*/
  stored_headers: (BlockRange)[];
/**
* Syncing target. The latest height seen in the network that was successfully verified.
*/
  subjective_head: bigint;
}
