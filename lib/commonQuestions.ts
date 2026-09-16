export type CommonQuestion = {
  id: string;
  label: string;
  prompt: string;
  answer: string;
};

// These answers are clinician-provided, approved patient education. Exact
// matches are returned without an AI call so the wording stays consistent.
export const COMMON_QUESTIONS: CommonQuestion[] = [
  {
    id: 'needed-tests',
    label: 'What tests do I need?',
    prompt: 'What tests do I need to get to evaluate my adrenal nodule?',
    answer: 'We recommend starting with blood tests to check whether your adrenal nodule is making hormones. Your blood draw needs to be done at 8am, and you need to take a medication at 11pm the night before. Depending on your history, we may check common adrenal hormones, including aldosterone, metanephrines, and cortisol. Please refer to the homepage for specific lab-testing instructions.'
  },
  {
    id: 'when-to-treat',
    label: 'When is treatment needed?',
    prompt: 'When do I need to treat an adrenal nodule?',
    answer: 'Treatment for an adrenal nodule depends on its size, growth, and hormone production. Nodules over 4 cm or with suspicious features might need surgery. Nodules that make too much adrenal hormone are also recommended for treatment. Hormone tests are usually done first to check for hormone excess.'
  },
  {
    id: 'typical-treatment',
    label: 'What is typical treatment?',
    prompt: 'What is the typical treatment for an adrenal nodule?',
    answer: 'The most common and effective treatment is surgery, although there may be other options. If your adrenal nodule is large or makes too much hormone, the next step is to talk with an endocrine specialist about which treatment options are right for you.'
  },
  {
    id: 'surgery-recovery',
    label: 'What is surgery recovery like?',
    prompt: 'What is the typical recovery for adrenal surgery?',
    answer: 'Recovery after adrenal surgery varies based on the surgical approach and your health. Laparoscopic or robotic surgery generally allows a faster recovery, with a one-night hospital stay being most typical. Patients usually return to normal activities in 1 to 2 weeks. Open surgery might require a longer recovery.'
  },
  {
    id: 'surgery-risks',
    label: 'What are surgery risks?',
    prompt: 'What are the risks of adrenal surgery?',
    answer: 'Adrenal surgery can have risks such as bleeding, infection, and injury to nearby organs. These risks are low, and complication rates are under 5%. Hormone imbalances may occur after surgery and may require medication for a short time. Risks depend on a person’s medical history, so discuss them with your doctor for information specific to your health.'
  }
];

export function getCommonQuestionAnswer(prompt: string): CommonQuestion | undefined {
  const normalizedPrompt = prompt.trim().toLocaleLowerCase();
  return COMMON_QUESTIONS.find(
    (question) => question.prompt.toLocaleLowerCase() === normalizedPrompt,
  );
}
