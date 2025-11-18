'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAssigneeInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to suggest an assignee.'),
  teamMembers: z
    .array(z.string())
    .describe('An array of team member names to choose from.'),
  userSkills: z.record(z.array(z.string())).describe('A map of user to skills'),
});
export type SuggestAssigneeInput = z.infer<typeof SuggestAssigneeInputSchema>;

const SuggestAssigneeOutputSchema = z.object({
  suggestedAssignee: z
    .string()
    .describe('The name of the team member suggested for the task.'),
  confidenceScore: z
    .number()
    .describe('A score indicating the confidence level of the suggestion (0-1).'),
  reasoning: z.string().describe('The reasoning behind the assignee suggestion.'),
});
export type SuggestAssigneeOutput = z.infer<typeof SuggestAssigneeOutputSchema>;

export async function suggestAssignee(input: SuggestAssigneeInput): Promise<SuggestAssigneeOutput> {
  return suggestAssigneeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAssigneePrompt',
  input: {schema: SuggestAssigneeInputSchema},
  output: {schema: SuggestAssigneeOutputSchema},
  prompt: `You are an AI assistant helping project managers assign tasks to the most suitable team member.

Given the following task description and a list of team members with their skills, analyze the task requirements and suggest the best assignee.

Task Description: {{{taskDescription}}}

Team Members and Skills:
{{#each teamMembers}}
- {{this}}: {{#each (lookup ../userSkills this)}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Consider the skills and experience of each team member and how well they align with the task requirements. Provide a confidence score (0-1) indicating the certainty of your suggestion, and explain your reasoning.

Output should be JSON with fields suggestedAssignee (name), confidenceScore (number), and reasoning (string).`,
});

const suggestAssigneeFlow = ai.defineFlow(
  {
    name: 'suggestAssigneeFlow',
    inputSchema: SuggestAssigneeInputSchema,
    outputSchema: SuggestAssigneeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
