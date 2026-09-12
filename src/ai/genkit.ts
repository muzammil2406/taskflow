import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // gemini-flash-latest is the stable alias for the current Flash model.
  model: 'googleai/gemini-flash-latest',
});
