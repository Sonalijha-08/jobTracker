import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Application from '../models/Application';

export const getApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ user: req.user });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const application = new Application({ ...req.body, user: req.user });
    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(400).json({ message: 'Invalid application data' });
  }
};

export const updateApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }
    if (application.user.toString() !== (req.user as any)) {
      res.status(401).json({ message: 'User not authorized' });
      return;
    }
    const updatedApplication = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedApplication);
  } catch (error) {
    res.status(400).json({ message: 'Invalid application data' });
  }
};

export const deleteApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }
    if (application.user.toString() !== (req.user as any)) {
      res.status(401).json({ message: 'User not authorized' });
      return;
    }
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
