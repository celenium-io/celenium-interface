<script setup>
import BlobModal from "./BlobModal.vue"
import ConfirmationModal from "./ConfirmationModal.vue"
import RawDataModal from "./RawDataModal.vue"

/**
 * Store
 */
import { useModalsStore } from "@/store/modals"
const modalsStore = useModalsStore()
</script>

<template>
	<BlobModal :show="modalsStore.modals.blob" @onClose="modalsStore.close('blob')" />
	<ConfirmationModal :show="modalsStore.modals.confirmation" @onClose="modalsStore.close('confirmation')" />
	<RawDataModal :show="modalsStore.modals.rawData" @onClose="modalsStore.close('rawData')" />
</template>
