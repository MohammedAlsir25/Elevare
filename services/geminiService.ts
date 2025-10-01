import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types.ts";

let chat: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!chat) {
        // FIX: Removed explicit API_KEY check to align with guideline of assuming it's pre-configured.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are a helpful and friendly financial assistant for an application called Elevare. 
                Elevare merges personal finance tracking with business ERP features. 
                Your role is to answer user questions about their finances, provide insights, explain financial concepts, and help them navigate the app's features. 
                Keep your answers concise, clear, and encouraging. Use a professional yet approachable tone.
                Do not ask for personal financial data. Base your answers on general financial knowledge.`,
            },
        });
    }
    return chat;
};

export const sendMessageToAI = async (message: string, isUserMessage: boolean = false): Promise<ChatMessage> => {
    if (isUserMessage) {
        return {
            id: `user-${Date.now()}`,
            role: 'user',
            text: message,
        };
    }

    try {
        const chatInstance = getChatInstance();
        const response: GenerateContentResponse = await chatInstance.sendMessage({ message });
        return {
            id: `model-${Date.now()}`,
            role: 'model',
            text: response.text,
        };
    } catch (error) {
        console.error("Gemini API error:", error);
        // Reset chat instance in case of a session error
        chat = null;
        // FIX: Updated error message to not mention API key, as per guidelines.
        return {
             id: `err-${Date.now()}`,
             role: 'model',
             text: "I'm sorry, but I'm having trouble connecting to my knowledge base. Please try again later."
        };
    }
};