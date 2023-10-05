<template>
	<v-dialog v-model="showDisclaimer" persistent max-width="600px">
		<v-card>
			<v-card-title>
				<span class="text-h5">Disclaimer</span>
			</v-card-title>
			<v-card-text>
				<p>
					Please be aware that the AI chatbot is designed to provide
					general information about Parallel and may not always be
					accurate.
				</p>
				<p>
					Do not rely on the AI chatbot for critical decisions,
					especially financial ones. This application is not intended
					to provide financial advice.
				</p>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="primary" @click="closeDisclaimer"
					>Understood</v-btn
				>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
export default {
	data() {
		return {
			// showDisclaimer: !localStorage.getItem("disclaimerAcknowledged"),
			showDisclaimer: true,
		};
	},
	methods: {
		closeDisclaimer() {
			this.showDisclaimer = false;
			localStorage.setItem("disclaimerAcknowledged", "true");
		},
	},
};
</script>

<style scoped>
p {
	margin: 10px 0;
}
</style>
