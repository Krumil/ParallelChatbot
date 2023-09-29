<template>
	<v-form>
		<v-container>
			<v-row>
				<v-textarea
					variant="filled"
					v-model="message"
					append-icon="mdi-send"
					prepend-icon="mdi-broom"
					label="Message"
					type="text"
					rows="1"
					auto-grow
					max-rows="10"
					maxlength="3000"
					counter
					@keydown.enter.exact.prevent="sendMessage"
					@keydown.shift.enter.exact.prevent="addNewLine"
					@click:append="sendMessage"
					@click:prepend="startNewConversation"
				>
				</v-textarea>
			</v-row>
		</v-container>
	</v-form>
</template>

<script>
export default {
	emits: [
		"messageSent",
		"clear-conversation",
		"message-sent",
		"message-received",
	],
	data() {
		return {
			user: null,
			message: "",
			messageSent: false,
		};
	},
	methods: {
		async sendMessage() {
			const messageText = this.message.trim();

			if (messageText === "") {
				return;
			}

			this.messageSent = true;
			const prompt = messageText;
			this.message = "";

			try {
				this.$emit("message-sent", prompt, "user");
			} catch (error) {
				console.error("Error sending message.");
			}
		},

		addNewLine() {
			this.message += "\n";
		},

		startNewConversation() {
			this.$emit("clear-conversation");
			this.messageSent = false;
		},
	},
};
</script>
