import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // gemini-flash-lite-latest is the stable, low-contention alias for current Flash-Lite.
  model: 'googleai/gemini-flash-lite-latest',
});
