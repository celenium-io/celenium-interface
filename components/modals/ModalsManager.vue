<script setup>
import AwaitingModal from "./AwaitingModal.vue"
import BlobModal from "./BlobModal.vue"
import CommitmentModal from "./CommitmentModal.vue"
import ConfirmationModal from "./ConfirmationModal.vue"
import ConstantsModal from "./ConstantsModal.vue"
import EditBookmarkAliasModal from "./EditBookmarkAliasModal.vue"
import ImportBookmarksModal from "./ImportBookmarksModal.vue"
import ODSModal from "./ODSModal.vue";
import PayForBlobModal from "./PayForBlobModal.vue"
import ChangeBlobModal from "./ChangeBlobModal.vue"
import QRCodeModal from "./QRCodeModal.vue"
import RawDataModal from "./RawDataModal.vue"
import SendModal from "./SendModal.vue"

/**
 * Store
 */
import { useModalsStore } from "@/store/modals"
const modalsStore = useModalsStore()
</script>

<template>
	<AwaitingModal :show="modalsStore.modals.awaiting" @onClose="modalsStore.close('awaiting')" />
	<BlobModal :show="modalsStore.modals.blob" @onClose="modalsStore.close('blob')" />
	<CommitmentModal :show="modalsStore.modals.commitment" @onClose="modalsStore.close('commitment')" />
	<ConfirmationModal :show="modalsStore.modals.confirmation" @onClose="modalsStore.close('confirmation')" />
	<ConstantsModal :show="modalsStore.modals.constants" @onClose="modalsStore.close('constants')" />
	<EditBookmarkAliasModal :show="modalsStore.modals.edit_alias" @onClose="modalsStore.close('edit_alias')" />
	<ImportBookmarksModal :show="modalsStore.modals.import" @onClose="modalsStore.close('import')" />
	<ODSModal :show="modalsStore.modals.ods" @onClose="modalsStore.close('ods')" />
	<PayForBlobModal :show="modalsStore.modals.pfb" @onClose="modalsStore.close('pfb')" />
	<ChangeBlobModal :show="modalsStore.modals.changeBlob" @onClose="modalsStore.close('changeBlob')" />
	<QRCodeModal :show="modalsStore.modals.qr" @onClose="modalsStore.close('qr')" />
	<RawDataModal :show="modalsStore.modals.rawData" @onClose="modalsStore.close('rawData')" />
	<SendModal :show="modalsStore.modals.send" @onClose="modalsStore.close('send')" />
</template>
