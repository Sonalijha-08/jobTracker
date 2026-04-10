import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { parseJobDescription, generateResumeSuggestions, generateFullResume } from '../services/aiService';

export const parseJd = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jdText } = req.body;
    if (!jdText) {
      res.status(400).json({ message: 'No job description provided' });
      return;
    }

    const parsedData = await parseJobDescription(jdText);
    res.json(parsedData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing job description' });
  }
};

export const getResumeSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { parsedData } = req.body;
    if (!parsedData) {
      res.status(400).json({ message: 'No parsed data provided' });
      return;
    }

    const suggestionsData = await generateResumeSuggestions(parsedData);
    res.json(suggestionsData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating suggestions' });
  }
};

export const generateResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { parsedData } = req.body;
    if (!parsedData) {
      res.status(400).json({ message: 'No parsed data provided' });
      return;
    }

    const { generateFullResume } = require('../services/aiService');
    const resumeData = await generateFullResume(parsedData);
    res.json(resumeData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error generating resume' });
  }
};
