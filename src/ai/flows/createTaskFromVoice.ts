'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const CreateTaskFromVoiceInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A base64 encoded audio blob, as a data URI."
    ),
  teamMembers: z.array(z.string()).optional(),
  currentDate: z.string(),
});
export type CreateTaskFromVoiceInput = z.infer<typeof CreateTaskFromVoiceInputSchema>;

const CreateTaskFromVoiceOutputSchema = z.object({
  title: z.string().describe('The extracted title of the task.'),
  description: z.string().optional().describe('The extracted description of the task.'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('The extracted priority.'),
  assignedTo: z.string().optional().describe('The name of the person the task is assigned to, if mentioned.'),
  dueDate: z.string().optional().describe('The due date in YYYY-MM-DD format if mentioned.')
});
export type CreateTaskFromVoiceOutput = z.infer<typeof CreateTaskFromVoiceOutputSchema>;


export async function createTaskFromVoice(input: CreateTaskFromVoiceInput): Promise<CreateTaskFromVoiceOutput> {
  return createTaskFromVoiceFlow(input);
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d: Buffer) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}


const prompt = ai.definePrompt({
    name: 'createTaskFromVoicePrompt',
    input: { schema: z.object({ transcription: z.string() }).extend({ teamMembers: z.array(z.string()).optional(), currentDate: z.string() })},
    output: { schema: CreateTaskFromVoiceOutputSchema },
    prompt: `You are a task creation assistant. Analyze the following transcribed text and extract task details.

Transcription: "{{{transcription}}}"

Today's date is: {{{currentDate}}}. Use this to resolve relative dates like "tomorrow" or "next Friday".

{{#if teamMembers}}
Available team members are: {{#each teamMembers}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}. Only use one of these names for the 'assignedTo' field if a name is mentioned.
{{/if}}

Extract the title, description, priority, assignee, and due date. Be concise.
`,
});

const createTaskFromVoiceFlow = ai.defineFlow(
  {
    name: 'createTaskFromVoiceFlow',
    inputSchema: CreateTaskFromVoiceInputSchema,
    outputSchema: CreateTaskFromVoiceOutputSchema,
  },
  async (input) => {
    const audioBuffer = Buffer.from(
      input.audioDataUri.substring(input.audioDataUri.indexOf(',') + 1),
      'base64'
    );

    const wavAudio = await toWav(audioBuffer);

    const { text: transcription } = await ai.generate({
        model: 'googleai/gemini-flash-latest',
        prompt: [{ media: { url: `data:audio/wav;base64,${wavAudio}` } }, { text: "Transcribe this audio."}],
    });
    
    if(!transcription) {
        throw new Error('Failed to transcribe audio.');
    }

    const { output } = await prompt({
        transcription,
        teamMembers: input.teamMembers,
        currentDate: input.currentDate,
    });
    return output!;
  }
);
