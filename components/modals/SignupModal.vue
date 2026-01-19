<script setup>
/** Vendor */
import * as z from "zod"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Input from "@/components/ui/Input.vue"
import Button from "~/components/ui/Button.vue"

/** Store */
import { useModalsStore } from "@/store/modals.store.js"

const modalsStore = useModalsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const username = ref()
const usernameValidation = z
	.string()
	.min(3, "Minimum 3 characters long")
	.max(150, "Maximum 150 characters long")
	.trim()
const usernameError = ref()

const email = ref()
const emailValidation = z.email()
const emailError = ref()

const password = ref()
const passwordValidation = z.string().min(8, "Minimum 8 characters long")
const passwordError = ref()

const repeatPassword = ref()
const repeatPasswordError = ref()

const handleCreateAccount = () => {
	if (!username.value) {
		usernameError.value = "Username is required"
		return
	}
	const { error: usernameErr } = usernameValidation.safeParse(username.value)
	if (usernameErr) {
		const issue = JSON.parse(usernameErr)[0]
		usernameError.value = issue.message
		return
	}

	if (!email.value) {
		emailError.value = "Email is required"
		return
	}
	const { error: emailErr } = (emailValidation.safeParse(email.value))
	if (emailErr) {
		const issue = JSON.parse(emailErr)[0]
		emailError.value = issue.message
		return
	}

	if (!password.value) {
		passwordError.value = "Password is required"
		return
	}
	const { error: passwordErr } = (passwordValidation.safeParse(password.value))
	if (passwordErr) {
		const issue = JSON.parse(passwordErr)[0]
		passwordError.value = issue.message
		return
	}

	if (!repeatPassword.value) {
		passwordError.value = "Repeated password is required"
		return
	}
	const { error: repeatPasswordErr } = (passwordValidation.safeParse(repeatPassword.value))
	if (repeatPasswordErr) {
		const issue = JSON.parse(repeatPasswordErr)[0]
		repeatPasswordError.value = issue.message
		return
	}

	if (password.value !== repeatPassword.value) {
		repeatPasswordError.value = "Wrong repeated password"
		return
	}

	try {
		const data = $fetch("https://auth.celenium.io/accounts/register")
		console.log(data)
	} catch (e) {
		console.log(e)
	}
}

const handleLogin = () => {
	modalsStore.closeAll()
	modalsStore.open("login")
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="400" disable-trap>
		<Flex align="center" direction="column" gap="20">
			<Flex wide justify="start">
				<Text size="14" weight="600" color="primary">Celenium Signup</Text>
			</Flex>

			<Flex wide direction="column" gap="8">
				<Input v-model="username" @click="usernameError = null" label="Username" placeholder="" wide>
					<template v-if="usernameError" #rightText>
						<Text size="12" weight="600" color="red">
							{{ usernameError }}
						</Text>
					</template>
				</Input>
				<Text size="12" weight="500" color="tertiary">
					150 characters or fewer. Letters, digits and @/./+/-/_ only.
				</Text>
			</Flex>

			<Flex wide direction="column" gap="8">
				<Input v-model="email" @click="emailError = null" label="Email" placeholder="" wide>
					<template v-if="emailError" #rightText>
						<Text size="12" weight="600" color="red">
							{{ emailError }}
						</Text>
					</template>
				</Input>
				<Text size="12" weight="500" color="tertiary">
					Enter a valid email address.
				</Text>
			</Flex>

			<Flex wide direction="column" gap="8">
				<Input v-model="password" @click="passwordError = null" type="password" label="Password"
					   placeholder="Your password" wide>
					<template v-if="passwordError" #rightText>
						<Text size="12" weight="600" color="red">
							{{ passwordError }}
						</Text>
					</template>
				</Input>
				<Text size="12" weight="500" height="150" color="tertiary">

					- Your password can’t be too similar to your other personal information.<br />
					- Your password must contain at least 8 characters. <br />
					- Your password can’t be a commonly used password. <br />
					- Your password can’t be entirely numeric.
				</Text>
			</Flex>

			<Flex wide direction="column" gap="8">
				<Input v-model="repeatPassword" @click="repeatPasswordError = null" type="password"
					   label="Confirm Password"
					   placeholder="Repeat password">
					<template v-if="repeatPasswordError" #rightText>
						<Text size="12" weight="600" color="red">
							{{ repeatPasswordError }}
						</Text>
					</template>
				</Input>
				<Text size="12" weight="500" color="tertiary">
					Enter the same password as before, for verification.
				</Text>
			</Flex>

			<Button @click="handleCreateAccount" type="white" size="small" wide>Create Account</Button>

			<Flex wide align="center" justify="center" gap="4">
				<Text size="12" weight="600" color="tertiary">Already have an account?</Text>
				<Text @click="handleLogin" size="12" weight="600" color="blue" align="center"
					  class="clickable">
					Login
				</Text>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.tab {
	border-radius: 6px;
	background: var(--op-5);
	cursor: pointer;
	user-select: none;

	padding: 6px 8px;

	transition: all .2s ease;

	&.selected {
		background: var(--op-10);
	}

	&:hover {
		background: var(--op-10);
	}
}
</style>
