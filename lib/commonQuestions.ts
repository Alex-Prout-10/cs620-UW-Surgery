export type CommonQuestion = {
  id: string;
  label: string;
  prompt: string;
  answer: string;
  sources?: string[];
};

const ESE_ADRENAL_GUIDELINE = 'DOC:European Society of Endocrinology clinical practice.pdf|CHUNK:47e0ff89-e903-436a-9d6f-05eaa6442ed1|P:1-1';
const ESE_HORMONE_TESTING = 'DOC:European Society of Endocrinology clinical practice.pdf|CHUNK:0be67893-6391-4ab1-860e-03dcd8f723f9|P:3-3';
const ESE_SURGERY_RECOMMENDATIONS = 'DOC:European Society of Endocrinology clinical practice.pdf|CHUNK:1a3f0913-ed87-4c95-899d-034b39ed3b45|P:3-3';
const AAES_ADRENALECTOMY_GUIDELINE = 'DOC:JAMA Guidelines for Adrenalectomy.pdf|CHUNK:3f521ea1-e7a8-4f47-823f-2392402e4ef8|P:1-1';
const UW_LAB_TESTING_RESOURCE = 'DOC:FINAL Adrenal Nodual Workflow Flyer copy.pdf|CHUNK:76d97a3f-026f-4c1f-9b5d-df6755076051|P:2-2';
const ADRENAL_ANATOMY_LOCATION = 'DOC:Surgical anatomy of the adrenal glands.pdf|CHUNK:d48db003-958b-449d-bf72-800730d0017c|P:4-4';
const ADRENAL_CORTISOL = 'DOC:Surgical anatomy of the adrenal glands.pdf|CHUNK:dbaadd0e-b04b-4f12-8a40-92752dafefd2|P:1-2';
const ADRENAL_EPINEPHRINE = 'DOC:Surgical anatomy of the adrenal glands.pdf|CHUNK:6353c276-7ba2-4389-a13c-490820338364|P:2-2';

// Topic selection draws on patient-reported adrenal-incidentaloma research and
// clinic experience; these sources guide topic choice, not query frequency.
// The six new answer drafts below need UW clinician review before patient
// release. Exact matches return without an AI call.
// Sources: Ceccato et al., J Endocrinol Invest. 2021;44:2749-2763,
// doi:10.1007/s40618-021-01615-3; Mewes et al., Endocrine Abstracts 2023,
// 94:EA0094P304; Muth et al., Endocrine. 2013;44:228-236,
// doi:10.1007/s12020-012-9856-z.
export const COMMON_QUESTIONS: CommonQuestion[] = [
  {
    id: 'what-is-nodule',
    label: 'What is an adrenal nodule?',
    prompt: 'What is an adrenal nodule?',
    answer: 'An adrenal nodule is a growth on one of your adrenal glands. These glands sit above your kidneys and make important hormones, like cortisol and adrenaline. Most adrenal nodules are found by accident during imaging tests done for other reasons, such as looking at your belly or back. They are often non-cancerous, but your doctor might do more tests to check the hormones and see if the nodule looks suspicious for cancer. Many nodules do not cause symptoms. Whether tests or follow-up are needed depends on the imaging and your health.',
    sources: [
      ESE_ADRENAL_GUIDELINE,
      ADRENAL_ANATOMY_LOCATION,
      ADRENAL_CORTISOL,
      ADRENAL_EPINEPHRINE,
    ]
  },
  {
    id: 'needed-tests',
    label: 'What tests do I need?',
    prompt: 'What tests do I need to get to evaluate my adrenal nodule?',
    answer: 'Your care team may order blood or urine tests to see whether the nodule is making extra hormones. The tests can include cortisol testing, metanephrines, or aldosterone and renin, depending on your health history. If your team ordered the dexamethasone test, follow the preparation instructions on the homepage and any specific directions from your clinic.',
    sources: [UW_LAB_TESTING_RESOURCE, ESE_HORMONE_TESTING]
  },
  {
    id: 'cancer-risk',
    label: 'Could it be cancer?',
    prompt: 'Could my adrenal nodule be cancer?',
    answer: 'An adrenal nodule does not automatically mean cancer. Many nodules found by chance are benign, but the scan appearance and your medical history matter. Your care team may recommend hormone tests or additional imaging to decide what follow-up, if any, is right for you.',
    sources: [ESE_ADRENAL_GUIDELINE]
  },
  {
    id: 'hormone-production',
    label: 'Can it make extra hormones?',
    prompt: 'Can an adrenal nodule make extra hormones?',
    answer: 'Some adrenal nodules make extra hormones, while others do not. Your care team may recommend blood or urine tests for hormones such as cortisol or metanephrines, and aldosterone testing in some situations. The tests that fit your situation depend on your health history and your care team’s evaluation.',
    sources: [ESE_HORMONE_TESTING]
  },
  {
    id: 'need-surgery',
    label: 'Will I need surgery?',
    prompt: 'Will I need surgery for my adrenal nodule?',
    answer: 'Not everyone with an adrenal nodule needs surgery. The care team considers how it looks on imaging, whether it makes extra hormones, your health, and your preferences. If surgery is being considered, ask your adrenal specialist to explain the possible benefits and risks for you.',
    sources: [ESE_SURGERY_RECOMMENDATIONS]
  },
  {
    id: 'when-to-treat',
    label: 'When is treatment needed?',
    prompt: 'When do I need to treat an adrenal nodule?',
    answer: 'Treatment depends on the nodule’s hormone tests and scan features. Some nodules that make too much hormone or look concerning on imaging may need surgery; many benign-appearing nodules do not. Your care team can explain what your results mean and whether follow-up is needed.',
    sources: [ESE_SURGERY_RECOMMENDATIONS]
  },
  {
    id: 'why-tests',
    label: 'Why do I need these tests?',
    prompt: 'Why do I need tests for my adrenal nodule?',
    answer: 'Tests help your care team understand how the nodule looks and whether it is making extra hormones. The results help guide whether you need more evaluation or follow-up. Your care team can explain why each test was ordered for you.',
    sources: [ESE_HORMONE_TESTING]
  },
  {
    id: 'typical-treatment',
    label: 'What is typical treatment?',
    prompt: 'What is the typical treatment for an adrenal nodule?',
    answer: 'There is no single treatment for every adrenal nodule. Many nodules that look benign and do not make extra hormones do not need surgery. If tests or imaging raise concerns, an adrenal specialist can discuss surgery or other next steps with you.',
    sources: [ESE_SURGERY_RECOMMENDATIONS]
  },
  {
    id: 'surgery-recovery',
    label: 'What is surgery recovery like?',
    prompt: 'What is the typical recovery for adrenal surgery?',
    answer: 'Recovery after adrenal surgery varies based on the surgical approach, your health, and the reason for surgery. Minimally invasive surgery may have different recovery and hospital-stay outcomes than open surgery. Your surgeon can give you a timeline for your situation and explain what support you may need afterward.',
    sources: [AAES_ADRENALECTOMY_GUIDELINE]
  },
  {
    id: 'surgery-risks',
    label: 'What are surgery risks?',
    prompt: 'What are the risks of adrenal surgery?',
    answer: 'Adrenal surgery can have risks such as bleeding, infection, or injury to nearby structures. Risks depend on the reason for surgery, the surgical approach, your health, and the experience of the surgical team. Hormone levels may need monitoring or temporary medication afterward. Ask your adrenal surgeon which risks apply to you.',
    sources: [AAES_ADRENALECTOMY_GUIDELINE]
  },
  {
    id: 'who-to-contact',
    label: 'Who can I contact with questions?',
    prompt: 'Who should I contact if I have questions about my adrenal nodule?',
    answer: 'Contact the clinic or clinician who ordered your scan or tests. Their number is usually listed in your visit summary or appointment information. This chatbot cannot see your medical chart or connect you to your care team.'
  }
];

export function getCommonQuestionAnswer(prompt: string): CommonQuestion | undefined {
  const normalizedPrompt = prompt.trim().toLocaleLowerCase();
  return COMMON_QUESTIONS.find(
    (question) => question.prompt.toLocaleLowerCase() === normalizedPrompt,
  );
}
