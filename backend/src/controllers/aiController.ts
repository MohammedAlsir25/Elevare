
import { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { AuthRequest } from '../middleware/authMiddleware';
import db from '../db';

export const processQuery = async (req: AuthRequest, res: Response) => {
    const { prompt } = req.body;
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required.' });
    }
    
    const companyId = req.user.companyId;

    try {
        // 1. Fetch relevant data from the database for context
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const transactionsQuery = `
            SELECT t.description, t.amount, t.date, c.name as category 
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.company_id = $1 AND t.date >= $2
            ORDER BY t.date DESC
            LIMIT 50;
        `;
        const invoicesQuery = `SELECT invoice_number, total_amount, status, due_date FROM invoices WHERE company_id = $1 ORDER BY issue_date DESC LIMIT 20;`;
        const walletsQuery = `SELECT name, balance FROM wallets WHERE company_id = $1;`;

        const [transactionsResult, invoicesResult, walletsResult] = await Promise.all([
            db.query(transactionsQuery, [companyId, thirtyDaysAgo.toISOString().split('T')[0]]),
            db.query(invoicesQuery, [companyId]),
            db.query(walletsQuery, [companyId]),
        ]);
        
        const contextData = {
            today: new Date().toISOString().split('T')[0],
            wallets: walletsResult.rows,
            recent_transactions: transactionsResult.rows,
            recent_invoices: invoicesResult.rows,
        };
        
        // 2. Call Gemini API with context
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const systemInstruction = `You are a helpful financial assistant for an application called Elevare. 
        Your role is to answer user questions about their financial data.
        You will be provided with a user's question and a JSON object containing their financial data for context.
        BASE YOUR ANSWERS STRICTLY ON THE DATA PROVIDED. DO NOT MAKE UP INFORMATION OR HALLUCINATE.
        If the data provided is not sufficient to answer the question, clearly state that you do not have enough information.
        Keep your answers concise, clear, and directly address the user's question.
        Perform calculations if necessary (e.g., summing up expenses).
        When referencing data, use friendly terms (e.g., "your recent transactions show...").
        Today's date is ${contextData.today}.`;
        
        const fullPrompt = `
            Context Data (JSON):
            ${JSON.stringify(contextData, null, 2)}

            User Question:
            "${prompt}"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        res.json({ answer: response.text });

    } catch (error) {
        console.error('AI query processing error:', error);
        res.status(500).json({ message: 'Failed to process AI query.' });
    }
};
