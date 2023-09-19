<template>
	<v-container fluid class="d-flex flex-column chat-container">
		<v-card v-if="!messages.length">
			<WelcomeMessage @prompt-selected="sendMessage" />
		</v-card>
		<div class="message-container flex-grow-1 overflow-y-auto">
			<v-list>
				<v-list-item v-for="(message, index) in messages" :key="index">
					<v-row
						no-gutters
						:class="{ 'align-right': message.sender === 'ai' }"
					>
						<v-col cols="12" sm="auto">
							<img
								v-if="message.sender === 'ai'"
								src="@/assets/favicon.ico"
								class="parallel-icon"
							/>
							<v-icon v-else left>mdi-account</v-icon>
						</v-col>
						<v-col cols="12" sm="auto">
							<div class="icon-spacer" style="width: 10px"></div>
						</v-col>
						<v-col cols="12" sm>
							<div
								:class="
									message.sender === 'user'
										? 'user-message'
										: 'ai-message'
								"
							>
								<template
									v-if="
										isLoading &&
										index === messages.length - 1 &&
										message.sender === 'ai'
									"
								>
								</template>
								<template v-else>
									<v-list-item-title
										:style="{ 'white-space': 'pre-wrap' }"
										>{{ message.text }}</v-list-item-title
									>
								</template>
							</div>
						</v-col>
					</v-row>
					<v-divider
						:key="'divider' + index"
						style="margin: 1.5rem"
					/>
				</v-list-item>

				<template v-if="isLoading">
					<v-list-item>
						<v-row no-gutters>
							<v-col cols="12" sm="auto">
								<img
									src="@/assets/favicon.ico"
									class="parallel-icon"
								/>
							</v-col>
							<v-col cols="12" sm="auto">
								<div style="width: 10px"></div>
							</v-col>
							<v-col cols="12" sm>
								<div class="ai-message">
									<v-progress-circular
										indeterminate
										size="20"
									></v-progress-circular>
								</div>
							</v-col>
						</v-row>
						<v-divider
							:key="'divider' + index"
							style="margin: 1.5rem"
						/>
					</v-list-item>
				</template>
			</v-list>
		</div>

		<div class="input-container">
			<Input
				@message-sent="sendMessage"
				@clear-conversation="clearConversation"
			/>
		</div>
		<p class="text-center text-caption">
			<strong>Krumil - </strong>
			<span>AI-powered chatbot - </span>
			<a v-bind:href="'https://github.com/Krumil'" target="_blank"
				>Krumil</a
			>
		</p>
		<AuthDialog
			:show="showAuthDialog"
			@auth-changed="onAuthChanged"
			@dialog-closed="showAuthDialog = false"
		/>
	</v-container>
</template>

<script>
import Input from "./Input.vue";
import WelcomeMessage from "./WelcomeMessage.vue";
import AuthDialog from "./AuthDialog.vue";
import { db, auth } from "@/plugins/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { sendPrompt } from "@/api/ai";

export default {
	components: {
		Input,
		WelcomeMessage,
		AuthDialog,
	},

	props: {
		conversation: {
			type: Object,
			default: () => ({}),
		},
	},

	data() {
		return {
			messages: [],
			conversationRef: null,
			isLoading: false,
			title: "",
			index: null,
			conversationId: null,
			user: {
				uid: "123",
			},
			showAuthDialog: false,
		};
	},

	created() {
		this.$nextTick(() => {
			this.scrollToBottom();
		});
	},

	watch: {
		conversation(newConversation) {
			if (newConversation.messages && newConversation.messages.length) {
				this.messages = newConversation.messages;
				this.conversationId = newConversation.id;
				this.conversationRef = doc(
					db,
					"conversations",
					this.conversationId
				);
			}
		},
	},

	methods: {
		async sendMessage(message) {
			// if (!this.user) {
			// 	this.showAuthDialog = true;
			// 	return;
			// }
			this.scrollToBottom();
			this.isLoading = true;

			if (!this.title) {
				const words = message.trim().split(" ");
				this.title = words.slice(0, 5).join(" ");
			}

			this.messages.push({ text: message, sender: "user" });
			this.isLoading = true;

			try {
				const aiResponse = await sendPrompt(message, this.messages);
				this.messages.push({ text: aiResponse, sender: "ai" });

				// await this.updateConversation();
				this.isLoading = false;
			} catch (error) {
				console.error("Error sending message:", error);
				this.isLoading = false;
			}
		},
		async updateConversation() {
			if (!this.conversationId) {
				this.conversationId = `123_${Date.now()}`;
				// this.conversationId = `${this.user.uid}_${Date.now()}`;
				this.conversationRef = doc(
					db,
					"conversations",
					this.conversationId
				);

				const existingConversation = await getDoc(this.conversationRef);
				if (!existingConversation.exists()) {
					await setDoc(this.conversationRef, {
						userId: this.user.uid,
						conversationId: this.conversationId,
						messages: this.messages,
						title: this.title,
					});
				}
			} else {
				const existingConversation = await getDoc(this.conversationRef);
				if (
					existingConversation.exists() &&
					existingConversation.data().title
				) {
					this.title = existingConversation.data().title;
				}

				await setDoc(this.conversationRef, {
					userId: this.user.uid,
					conversationId: this.conversationId,
					messages: this.messages,
					title: this.title,
				});
			}
		},

		scrollToBottom() {
			this.$nextTick(() => {
				const container = this.$el.querySelector(".message-container");
				container.scrollTop = container.scrollHeight;
			});
		},

		clearConversation() {
			this.messages = [];
		},

		onAuthChanged(user) {
			// this.user = user;
			this.user = {
				uid: "123",
			};
		},
	},
};
</script>

<style scoped>
.chat-container {
	height: calc(100vh - 100px);
	display: flex;
	flex-direction: column;
	padding: 1rem;
}

.message-container {
	flex-grow: 1;
	overflow-y: auto;
	margin-bottom: 1rem;
}

.message-container::-webkit-scrollbar {
	width: 8px;
}

.message-container::-webkit-scrollbar-thumb {
	background-color: lightgray;
	border-radius: 6px;
}

.message-container::-webkit-scrollbar-thumb:hover {
	background-color: darkgray;
}

.input-container {
	position: sticky;
	bottom: 0;
}

.parallel-icon {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	object-fit: cover;
}

@media (max-width: 600px) {
	.chat-container {
		height: calc(100vh - 100px);
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
	}

	.message-container {
		margin-bottom: 0.5rem;
	}

	.input-container {
		position: relative;
		margin-left: 0;
	}
}

@media (min-width: 1200px) {
	.chat-container {
		max-width: 900px;
		margin: 0 auto;
	}
}
</style>
