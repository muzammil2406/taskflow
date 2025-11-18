'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoryInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().optional().describe('The description of the task.'),
  existingCategories: z.array(z.string()).describe('A list of existing categories to choose from.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  suggestedCategory: z.string().describe('The suggested category for the task from the provided list.'),
  confidence: z.number().min(0).max(1).describe('The confidence score of the suggestion (0-1).'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: {schema: SuggestCategoryInputSchema},
  output: {schema: SuggestCategoryOutputSchema},
  prompt: `You are an expert project manager that is brilliant at categorizing tasks. 
  
Analyze the following task and suggest the most relevant category from the list provided.

Task Title: {{{taskTitle}}}
Task Description: {{{taskDescription}}}

Existing Categories:
{{#each existingCategories}}
- {{this}}
{{/each}}

Respond with the most appropriate category and a confidence score. If no category seems to fit well, you can suggest "General".
`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
