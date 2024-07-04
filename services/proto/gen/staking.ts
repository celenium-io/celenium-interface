/* eslint-disable */
import _m0 from "protobufjs/minimal"
import { Coin } from "./coin"

export const protobufPackage = "cosmos.bank.v1beta1"


/**
 * MsgDelegate defines a SDK message for performing a delegation of coins
 * from a delegator to a validator.
 */
export interface MsgDelegate {
	delegatorAddress: string;
	validatorAddress: string;
	amount: Coin | undefined;
}

/** MsgDelegateResponse defines the Msg/Delegate response type. */
export interface MsgDelegateResponse {
}


export const MsgDelegate = {
	encode(message: MsgDelegate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		if (message.delegatorAddress !== "") {
			writer.uint32(10).string(message.delegatorAddress);
		}
		if (message.validatorAddress !== "") {
			writer.uint32(18).string(message.validatorAddress);
		}
		if (message.amount !== undefined) {
			Coin.encode(message.amount, writer.uint32(26).fork()).ldelim();
		}

		return writer;
	},
  
	decode(input: _m0.Reader | Uint8Array, length?: number): MsgDelegate {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseMsgDelegate();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1:
					if (tag !== 10) {
						break;
					}

					message.delegatorAddress = reader.string();
					continue;
				case 2:
					if (tag !== 18) {
						break;
					}

					message.validatorAddress = reader.string();
					continue;
				case 3:
					if (tag !== 26) {
						break;
					}

					message.amount = Coin.decode(reader, reader.uint32());
					continue;
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}

		return message;
	},
  
	fromJSON(object: any): MsgDelegate {
		return {
			delegatorAddress: isSet(object.delegatorAddress) ? String(object.delegatorAddress) : "",
			validatorAddress: isSet(object.validatorAddress) ? String(object.validatorAddress) : "",
			amount: isSet(object.amount) ? Coin.fromJSON(object.amount) : undefined,
		};
	},
  
	toJSON(message: MsgDelegate): unknown {
		const obj: any = {};
		if (message.delegatorAddress !== "") {
			obj.delegatorAddress = message.delegatorAddress;
		}
		if (message.validatorAddress !== "") {
			obj.validatorAddress = message.validatorAddress;
		}
		if (message.amount !== undefined) {
			obj.amount = Coin.toJSON(message.amount);
		}

		return obj;
	},
  
	create<I extends Exact<DeepPartial<MsgDelegate>, I>>(base?: I): MsgDelegate {
		return MsgDelegate.fromPartial(base ?? ({} as any));
	},

	fromPartial<I extends Exact<DeepPartial<MsgDelegate>, I>>(object: I): MsgDelegate {
		const message = createBaseMsgDelegate();
		message.delegatorAddress = object.delegatorAddress ?? "";
		message.validatorAddress = object.validatorAddress ?? "";
		message.amount = (object.amount !== undefined && object.amount !== null)
			? Coin.fromPartial(object.amount)
			: undefined;
		
		return message;
	},
};


function createBaseMsgDelegateResponse(): MsgDelegateResponse {
	return {};
}
  
export const MsgDelegateResponse = {
	encode(_: MsgDelegateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
		return writer;
	},

	decode(input: _m0.Reader | Uint8Array, length?: number): MsgDelegateResponse {
		const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseMsgDelegateResponse();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skipType(tag & 7);
		}
		return message;
	},

	fromJSON(_: any): MsgDelegateResponse {
		return {};
	},

	toJSON(_: MsgDelegateResponse): unknown {
		const obj: any = {};
		return obj;
	},

	create<I extends Exact<DeepPartial<MsgDelegateResponse>, I>>(base?: I): MsgDelegateResponse {
		return MsgDelegateResponse.fromPartial(base ?? ({} as any));
	},

	fromPartial<I extends Exact<DeepPartial<MsgDelegateResponse>, I>>(_: I): MsgDelegateResponse {
		const message = createBaseMsgDelegateResponse();
		return message;
	},
};

  /** Msg defines the staking Msg service. */
export interface Msg {
	/**
	 * Delegate defines a method for performing a delegation of coins
	 * from a delegator to a validator.
	 */
	Delegate(request: MsgDelegate): Promise<MsgDelegateResponse>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
	: T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
	: T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
	: Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
	: P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };
  
function createBaseMsgDelegate(): MsgDelegate {
	return { delegatorAddress: "", validatorAddress: "", amount: undefined };
}

function isSet(value: any): boolean {
	return value !== null && value !== undefined;
}

