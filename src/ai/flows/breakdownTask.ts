'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BreakdownTaskInputSchema = z.object({
  taskTitle: z.string().describe('The title of the task.'),
  taskDescription: z.string().optional().describe('The description of the task.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;

const BreakdownTaskOutputSchema = z.object({
  subtasks: z.array(z.string()).describe('An array of 3-5 actionable subtask strings.'),
});
export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;

export async function breakdownTask(input: BreakdownTaskInput): Promise<BreakdownTaskOutput> {
  return breakdownTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakdownTaskPrompt',
  input: {schema: BreakdownTaskInputSchema},
  output: {schema: BreakdownTaskOutputSchema},
  prompt: `You are a helpful assistant that breaks down complex tasks into smaller, actionable subtasks.

Given the following task, please generate a list of 3-5 subtasks. Each subtask should be a clear, concise action item.

Task Title: {{{taskTitle}}}
Task Description: {{{taskDescription}}}

Focus on creating a logical sequence of steps to complete the main task.
`,
});

const breakdownTaskFlow = ai.defineFlow(
  {
    name: 'breakdownTaskFlow',
    inputSchema: BreakdownTaskInputSchema,
    outputSchema: BreakdownTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
