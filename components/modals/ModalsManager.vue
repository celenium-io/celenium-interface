<script setup>
import AwaitingModal from "./AwaitingModal.vue"
import BlobModal from "./BlobModal.vue"
import ChartModal from "./ChartModal.vue"
import CommitmentModal from "./CommitmentModal.vue"
import ConfirmationModal from "./ConfirmationModal.vue"
import EditBookmarkAliasModal from "./EditBookmarkAliasModal.vue"
import ImportBookmarksModal from "./ImportBookmarksModal.vue"
import ODSModal from "./ODSModal.vue"
import PayForBlobModal from "./PayForBlobModal.vue"
import ChangeBlobModal from "./ChangeBlobModal.vue"
import QRCodeModal from "./QRCodeModal.vue"
import RawDataModal from "./RawDataModal.vue"
import SendModal from "./SendModal.vue"
import StakingModal from "./StakingModal.vue"
import VestingDetailsModal from "./VestingDetailsModal.vue"
import HexSettingsModal from "./HexSettingsModal.vue"
import APIModal from "./APIModal.vue"
import LightNodeModal from "./LightNodeModal.vue"
import LightNodeSettingsModal from "./LightNodeSettingsModal.vue"
import ConnectModal from "./ConnectModal.vue"
import RollupRankModal from "./RollupRankModal.vue"

/** Store */
import { useModalsStore } from "@/store/modals.store"
const modalsStore = useModalsStore()
</script>

<template>
	<AwaitingModal :show="modalsStore.modals.awaiting" @onClose="modalsStore.close('awaiting')" />
	<BlobModal :show="modalsStore.modals.blob" @onClose="modalsStore.close('blob')" />
	<CommitmentModal :show="modalsStore.modals.commitment" @onClose="modalsStore.close('commitment')" />
	<ConfirmationModal :show="modalsStore.modals.confirmation" @onClose="modalsStore.close('confirmation')" />
	<EditBookmarkAliasModal :show="modalsStore.modals.edit_alias" @onClose="modalsStore.close('edit_alias')" />
	<ImportBookmarksModal :show="modalsStore.modals.import" @onClose="modalsStore.close('import')" />
	<ODSModal :show="modalsStore.modals.ods" @onClose="modalsStore.close('ods')" />
	<PayForBlobModal :show="modalsStore.modals.pfb" @onClose="modalsStore.close('pfb')" />
	<ChangeBlobModal :show="modalsStore.modals.changeBlob" @onClose="modalsStore.close('changeBlob')" />
	<QRCodeModal :show="modalsStore.modals.qr" @onClose="modalsStore.close('qr')" />
	<RawDataModal :show="modalsStore.modals.rawData" @onClose="modalsStore.close('rawData')" />
	<SendModal :show="modalsStore.modals.send" @onClose="modalsStore.close('send')" />
	<VestingDetailsModal :show="modalsStore.modals.vestingDetails" @onClose="modalsStore.close('vestingDetails')" />
	<StakingModal :show="modalsStore.modals.staking" @onClose="modalsStore.close('staking')" />
	<HexSettingsModal :show="modalsStore.modals.hexSettings" @onClose="modalsStore.close('hexSettings')" />
	<APIModal :show="modalsStore.modals.api" @onClose="modalsStore.close('api')" />
	<LightNodeModal :show="modalsStore.modals.lightNode" @onClose="modalsStore.close('lightNode')" />
	<LightNodeSettingsModal :show="modalsStore.modals.lightNodeSettings" @onClose="modalsStore.close('lightNodeSettings')" />
	<ConnectModal :show="modalsStore.modals.connect" @onClose="modalsStore.close('connect')" />
	<ChartModal :show="modalsStore.modals.chart" @onClose="modalsStore.close('chart')" />
	<RollupRankModal :show="modalsStore.modals.rollupRank" @onClose="modalsStore.close('rollupRank')" />
</template>
