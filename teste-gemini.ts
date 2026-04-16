// teste-gemini.ts
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testar() {
  console.log('Chave:', process.env.GEMINI_API_KEY);

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const result = await model.generateContent('Diga apenas: funcionou');
  console.log('Resposta:', result.response.text());
}

testar().catch(console.error);