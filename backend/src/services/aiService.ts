import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in backend/.env');
  }
  return new Groq({ apiKey });
};

export const parseJobDescription = async (jdText: string) => {
  try {
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS and Recruitment Researcher. Your task is to extract real-world job details from text that may be "messy" (e.g., copied from a browser with headers, footers, or extra UI text).

          FIELDS TO EXTRACT:
          1. company: The official name of the company hiring.
          2. companyUrl: Official website of the company (e.g., "https://www.google.com").
          3. companyDescription: A 1-2 sentence summary of what the company does.
          4. role: The specific job title.
          5. jobLink: The actual job posting URL if found in the text; otherwise, the likely career page link.
          6. requirements: A concise, bulleted summary of the core job requirements and qualifications.
          7. requiredSkills: Array of specific technical/soft skills required.
          8. niceToHaveSkills: Array of optional/plus skills.
          9. seniority: (e.g., Entry, Mid, Senior, Lead).
          10. location: (e.g., Remote, City, State/Country).

          INTELLIGENCE & ACCURACY POLICY:
          - REAL COMPANY IDENTIFICATION: Even if the text is generic, use context clues (signatures, "About Us" sections, brand names) to identify the REAL company. 
          - NO NEGATIVE ANSWERS: NEVER return "Cannot be determined", "Not specified", "Not explicitly mentioned", or "unknown".
          - FALLBACK STRATEGY: If a field is truly missing from the text:
            - Company: Use "Stealth Startup", "Global Tech Leader", or "Innovative Enterprise".
            - URL: Provide a plausible career site URL (e.g., "https://careers.google.com" if Google-like, or a generic professional search link).
            - Location: Use "Remote" or "Global" if not found.
            - Job Link: Provide a professional placeholder link to a search result for that role.
            - Description: Write a generic, high-quality description based on the role and industry.
          - DATA CONNECTION: Ensure ALL fields feel "real" and are totally connected to the provided description.

          Output strictly in JSON format matching this schema: 
          {
            "company": "string",
            "companyUrl": "string",
            "companyDescription": "string",
            "role": "string",
            "jobLink": "string",
            "requirements": "string",
            "requiredSkills": ["string"],
            "niceToHaveSkills": ["string"],
            "seniority": "string",
            "location": "string"
          }`
        },
        { role: 'user', content: jdText }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error: any) {
    console.error('Groq Parse Error:', error);
    throw new Error('Failed to parse job description using AI.');
  }
};

export const generateResumeSuggestions = async (jdParsedData: any) => {
  try {
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Generate 3 to 5 highly tailored resume bullet points based on the provided job data. 
          Make them action-oriented and metric-driven where possible.
          Output strictly in JSON format matching this schema: 
          { "suggestions": ["string"] }`
        },
        { role: 'user', content: JSON.stringify(jdParsedData) }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error: any) {
    console.error('Groq Suggestion Error:', error);
    throw new Error('Failed to generate resume suggestions.');
  }
};

export const generateFullResume = async (jdParsedData: any) => {
  try {
    const groq = getGroqClient();
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert Resume Writer. Generate a full, professional resume tailored specifically to the provided job description.
          The resume should be in high-quality Markdown format.
          Include: Professional Summary, Key Skills (aligned with the job), Experience (simulated but realistic achievements for this role), Education, and Projects.
          Ensure the achievements are quantifiable and use strong action verbs.
          
          Output strictly in JSON format matching this schema: 
          { "resumeMarkdown": "string" }`
        },
        { role: 'user', content: `Job Details: ${JSON.stringify(jdParsedData)}` }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error: any) {
    console.error('Groq Resume Error:', error);
    throw new Error('Failed to generate full resume using AI.');
  }
};
