'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoPrioritizeInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().describe('The description of the task.'),
  dueDate: z.string().optional().describe('The due date of the task in ISO format.'),
});
export type AutoPrioritizeInput = z.infer<typeof AutoPrioritizeInputSchema>;

const AutoPrioritizeOutputSchema = z.object({
  suggestedPriority: z.enum(['low', 'medium', 'high']).describe('The suggested priority for the task.'),
  reasoning: z.string().describe('The reasoning for the suggested priority.'),
});
export type AutoPrioritizeOutput = z.infer<typeof AutoPrioritizeOutputSchema>;

export async function autoPrioritizeTask(input: AutoPrioritizeInput): Promise<AutoPrioritizeOutput> {
  return autoPrioritizeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoPrioritizePrompt',
  input: {schema: AutoPrioritizeInputSchema.extend({ currentDate: z.string() })},
  output: {schema: AutoPrioritizeOutputSchema},
  prompt: `You are an expert project manager. Analyze the following task and suggest a priority for it (low, medium, or high).

Task Title: {{{taskTitle}}}
Task Description: {{{taskDescription}}}
{{#if dueDate}}
Due Date: {{{dueDate}}}
{{/if}}

Consider the urgency based on the due date (if provided), and the potential complexity or importance implied by the title and description. Words like "urgent", "blocker", "critical" suggest high priority. Words like "refactor", "clean up", "later" suggest low priority.

Provide your reasoning. For example, if a due date is close, mention it. If the description contains keywords, point them out.

Today's date is {{{currentDate}}}.
`,
});

const autoPrioritizeFlow = ai.defineFlow(
  {
    name: 'autoPrioritizeFlow',
    inputSchema: AutoPrioritizeInputSchema,
    outputSchema: AutoPrioritizeOutputSchema,
  },
  async input => {
    const {output} = await prompt({
      ...input,
      currentDate: new Date().toISOString(),
    });
    return output!;
  }
);
