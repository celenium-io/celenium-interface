import { getSplitPoint } from "./encode"

export class Tree {
	constructor(hashFn) {
		this.hashFn = hashFn
		this.leavesHashes = []
	}

	push(data) {
		this.leavesHashes.push(this.hashLeaf(data))
	}

	hashLeaf(data) {
		const nData = []
		nData.push(0)
		nData.push(...data)

		const nId = data.slice(0, 29)
		const hl = []
		hl.push(...nId)
		hl.push(...nId)
		const h = this.hashFn(nData)
		hl.push(...h)
		return hl
	}

	hashNode(left, right) {
		const nId = left.slice(0, 29)
		const nData = []
		nData.push(1)
		nData.push(...left)
		nData.push(...right)

		const hn = []
		hn.push(...nId)
		hn.push(...nId)
		const h = this.hashFn(nData)
		hn.push(...h)
		return hn
	}

	getRoot() {
		return this._computeRoot(0, this.leavesHashes.length)
	}

	_computeRoot(start, end) {
		const l = end - start
		if (l === 0) {
			return this.emptyRoot()
		}
		if (l === 1) {
			return this.leavesHashes[0]
		}

		const sp = getSplitPoint(l)
		const left = this._computeRoot(start, start + sp)
		const right = this._computeRoot(start + sp, end)
		return this.hashNode(left, right)
	}

	emptyRoot() {
		const root = []
		for (let i = 0; i < 29; i++) {
			root.push(0)
		}
		for (let i = 0; i < 29; i++) {
			root.push(0)
		}
		for (let i = 0; i < 32; i++) {
			root.push(0)
		}
		return root
	}
}
