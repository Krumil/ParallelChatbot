import axios from "axios";

export async function sendPrompt(message) {
	try {
		const response = await axios.get(
			import.meta.env.VITE_API_URL + "/query_bot",
			{
				prompt: message,
			}
		);
		return response.data.message;
	} catch (error) {
		if (error.response && error.response.status === 500) {
			return "I'm sorry, but I cannot answer that.";
		}
	}
}
