'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I create a new task?',
    answer: 'You can create a new task by clicking the "New Task" button in the navigation bar. This will open a modal where you can fill in the task details such as title, description, priority, and due date.',
  },
  {
    question: 'How can I change the status of a task?',
    answer: 'You can change the status of a task by dragging and dropping it between the "To Do", "In Progress", and "Done" columns on the task board.',
  },
  {
    question: 'Where can I see task details?',
    answer: 'Click on any task card on the board to open the task detail view. Here you can see the full description, edit the task, and view or add comments.',
  },
  {
    question: 'How do I assign a task to someone?',
    answer: 'In the task detail view, you can use the "Assign To" dropdown to select a team member for the task. You can also use the AI suggestion feature to get help choosing the best person for the job.',
  },
];

export default function SupportPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">Support</h1>
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about using TaskZen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
