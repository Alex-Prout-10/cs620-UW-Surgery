export type CommonQuestion = {
  id: string;
  label: string;
  prompt: string;
};

// Draft prompts only. These continue through the normal chat pipeline until
// clinician-reviewed, source-grounded answers are available for caching.
export const DRAFT_COMMON_QUESTIONS: CommonQuestion[] = [
  {
    id: 'needed-tests',
    label: 'What tests might I need?',
    prompt: 'What blood, urine, or imaging tests might I need for an adrenal nodule?'
  },
  {
    id: 'test-preparation',
    label: 'How should I prepare for testing?',
    prompt: 'How should I prepare for adrenal nodule testing?'
  },
  {
    id: 'specialist-care',
    label: 'When would I need to see a specialist?',
    prompt: 'When would I need to see a specialist for an adrenal nodule?'
  }
];
