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
          content: `You are an expert ATS and Recruitment Researcher. Extract the following from the job description: 
          company name, company website (official URL), brief company description, role (title), required skills (array of strings), nice-to-have skills (array of strings), seniority, and location.

          REAL ANSWERS POLICY:
          1. COMPANY NAME: If not explicitly stated, look for recruitment signatures, footers, or context clues. If it's a generic description, identify it as "Standard [Industry] Role".
          2. COMPANY URL: If you identify the company, you MUST provide their official website URL based on your knowledge (e.g., if company is "Google", URL is "https://www.google.com"). Do NOT leave this blank or return "Not specified" if the company is known.
          3. ACCURACY: Do not return "unknown" or "Not specified" for company if clues exist.

          Output strictly in JSON format matching this schema: 
          {
            "company": "string",
            "companyUrl": "string",
            "companyDescription": "string",
            "role": "string",
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
