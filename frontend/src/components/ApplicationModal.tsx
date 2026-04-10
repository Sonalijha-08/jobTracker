import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { X, Loader2, Sparkles, Copy, Check, Building2, MapPin, Link2, FileText, Briefcase, Wand2 } from 'lucide-react';

interface ApplicationModalProps {
  onClose: () => void;
}

export default function ApplicationModal({ onClose }: ApplicationModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    companyUrl: '',
    companyDescription: '',
    jdLink: '',
    notes: '',
  });

  const [jdText, setJdText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [generatedResume, setGeneratedResume] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [resumeCopied, setResumeCopied] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'parse' | 'suggest' | 'resume'>('parse');
  const [aiError, setAiError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/applications', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      onClose();
    }
  });

  const handleParse = async () => {
    if (!jdText.trim()) return;
    setIsParsing(true);
    setAiError(null);
    try {
      const res = await api.post('/ai/parse-jd', { jdText });
      const data = res.data;
      setFormData(prev => ({
        ...prev,
        company: data.company || prev.company,
        role: data.role || prev.role,
        location: data.location || prev.location,
        companyUrl: data.companyUrl || prev.companyUrl,
        companyDescription: data.companyDescription || prev.companyDescription,
        notes: data.requiredSkills
          ? `Required Skills: ${data.requiredSkills.join(', ')}\n${prev.notes}`
          : prev.notes,
      }));
    } catch (error: any) {
      console.error('Failed to parse JD', error);
      setAiError(error.response?.data?.message || 'Failed to parse job description.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    setAiError(null);
    try {
      const res = await api.post('/ai/resume-suggestions', { parsedData: { ...formData, rawText: jdText } });
      if (res.data.suggestions) setSuggestions(res.data.suggestions);
    } catch (error: any) {
      console.error('Failed to generate suggestions', error);
      setAiError(error.response?.data?.message || 'Failed to generate suggestions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerateResume = async () => {
    if (!jdText.trim() && !formData.role) return;
    setIsGeneratingResume(true);
    setAiError(null);
    try {
      const res = await api.post('/ai/generate-resume', { parsedData: { ...formData, rawText: jdText } });
      if (res.data.resumeMarkdown) setGeneratedResume(res.data.resumeMarkdown);
    } catch (error: any) {
      console.error('Failed to generate resume', error);
      setAiError(error.response?.data?.message || 'Failed to generate tailored resume.');
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const copyResume = () => {
    navigator.clipboard.writeText(generatedResume);
    setResumeCopied(true);
    setTimeout(() => setResumeCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const fields = [
    { key: 'company', label: 'Company', type: 'text', icon: Building2, placeholder: 'Acme Corp', required: true },
    { key: 'companyUrl', label: 'Company URL', type: 'url', icon: Link2, placeholder: 'https://...', required: false },
    { key: 'role', label: 'Role', type: 'text', icon: Briefcase, placeholder: 'Senior Engineer', required: true },
    { key: 'location', label: 'Location', type: 'text', icon: MapPin, placeholder: 'Remote / New York', required: false },
    { key: 'jdLink', label: 'Job Link', type: 'url', icon: Link2, placeholder: 'https://...', required: false },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal-panel">

          {/* ── Left: AI Panel ── */}
          <div className="ai-panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className="ai-icon"><Sparkles size={15} /></div>
                <span>AI Assistant</span>
              </div>
              <button className="close-btn md-hide" onClick={onClose}><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div className="ai-tabs">
              <button
                className={`ai-tab ${activeTab === 'parse' ? 'active' : ''}`}
                onClick={() => { setActiveTab('parse'); setAiError(null); }}
              >
                <Wand2 size={13} /> Auto-Fill
              </button>
              <button
                className={`ai-tab ${activeTab === 'suggest' ? 'active' : ''}`}
                onClick={() => { setActiveTab('suggest'); setAiError(null); }}
              >
                <Sparkles size={13} /> Resume Tips
              </button>
              <button
                className={`ai-tab ${activeTab === 'resume' ? 'active' : ''}`}
                onClick={() => { setActiveTab('resume'); setAiError(null); }}
              >
                <FileText size={13} /> Full Resume
              </button>
            </div>

            {aiError && (
              <div className="ai-error-banner">
                <p>{aiError}</p>
              </div>
            )}

            {activeTab === 'parse' && (
              <div className="tab-content">
                <p className="ai-hint">Paste the full job description. AI will extract the company, role, and location for you.</p>
                <div className="jd-wrap">
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="jd-textarea"
                    placeholder="Paste job description here…"
                  />
                </div>
                <button
                  onClick={handleParse}
                  disabled={isParsing || !jdText.trim()}
                  className="ai-action-btn parse-btn"
                >
                  {isParsing
                    ? <><Loader2 size={15} className="spin" /> Parsing…</>
                    : <><Wand2 size={15} /> Auto-Fill Details</>
                  }
                </button>
              </div>
            )}

            {activeTab === 'suggest' && (
              <div className="tab-content">
                <p className="ai-hint">Generate tailored resume bullet points based on the role and job description.</p>
                <button
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating || (!formData.role && !jdText.trim())}
                  className="ai-action-btn suggest-btn"
                >
                  {isGenerating
                    ? <><Loader2 size={15} className="spin" /> Generating…</>
                    : <><Sparkles size={15} /> Generate Points</>
                  }
                </button>

                {suggestions.length > 0 && (
                  <div className="suggestions-list">
                    <p className="suggestions-title">Tailored bullet points</p>
                    {suggestions.map((s, i) => (
                      <div key={i} className="suggestion-card">
                        <p className="suggestion-text">{s}</p>
                        <button
                          className={`copy-btn ${copiedIndex === i ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(s, i)}
                          title="Copy"
                        >
                          {copiedIndex === i
                            ? <Check size={12} />
                            : <Copy size={12} />
                          }
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {suggestions.length === 0 && !isGenerating && (
                  <div className="suggestions-empty">
                    <Sparkles size={28} className="empty-sparkle" />
                    <p>Points will appear here</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="tab-content">
                <p className="ai-hint">Generate a complete, professional, and tailored resume based on the job requirements.</p>
                <button
                  onClick={handleGenerateResume}
                  disabled={isGeneratingResume || (!formData.role && !jdText.trim())}
                  className="ai-action-btn resume-btn"
                >
                  {isGeneratingResume
                    ? <><Loader2 size={15} className="spin" /> Generating Resume…</>
                    : <><FileText size={15} /> Generate Full Resume</>
                  }
                </button>

                {generatedResume && (
                  <div className="resume-preview-wrap">
                    <div className="resume-header">
                      <span>Tailored Resume</span>
                      <button className={`copy-resume-btn ${resumeCopied ? 'copied' : ''}`} onClick={copyResume}>
                        {resumeCopied ? < Check size={13} /> : <Copy size={13} />}
                        {resumeCopied ? 'Copied' : 'Copy MD'}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      className="resume-textarea"
                      value={generatedResume}
                    />
                  </div>
                )}

                {!generatedResume && !isGeneratingResume && (
                  <div className="suggestions-empty">
                    <FileText size={28} className="empty-sparkle" />
                    <p>Your tailored resume will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Form Panel ── */}
          <div className="form-panel">
            <div className="panel-header">
              <div className="panel-title">
                <span>Application Details</span>
              </div>
              <button className="close-btn" onClick={onClose}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="app-form">
              <div className="form-fields">
                {fields.map(({ key, label, type, icon: Icon, placeholder, required }) => (
                  <div
                    key={key}
                    className={`form-field ${focusedField === key ? 'focused' : ''} ${(formData as any)[key] ? 'filled' : ''}`}
                  >
                    <label className="form-label">{label}</label>
                    <div className="form-input-wrap">
                      <Icon className="form-icon" size={14} />
                      <input
                        type={type}
                        value={(formData as any)[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        onFocus={() => setFocusedField(key)}
                        onBlur={() => setFocusedField(null)}
                        className="form-input"
                        placeholder={placeholder}
                        required={required}
                      />
                    </div>
                    <div className="form-line" />
                  </div>
                ))}

                <div
                  className={`form-field ${focusedField === 'companyDescription' ? 'focused' : ''} ${formData.companyDescription ? 'filled' : ''}`}
                >
                  <label className="form-label">Company Description</label>
                  <div className="form-input-wrap textarea-wrap">
                    <Building2 className="form-icon" size={14} style={{ marginTop: '2px' }} />
                    <textarea
                      value={formData.companyDescription}
                      onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                      onFocus={() => setFocusedField('companyDescription')}
                      onBlur={() => setFocusedField(null)}
                      className="form-input form-textarea"
                      placeholder="About the company, vision, or culture…"
                      rows={2}
                    />
                  </div>
                  <div className="form-line" />
                </div>

                <div
                  className={`form-field ${focusedField === 'notes' ? 'focused' : ''} ${formData.notes ? 'filled' : ''}`}
                >
                  <label className="form-label">Notes</label>
                  <div className="form-input-wrap textarea-wrap">
                    <FileText className="form-icon" size={14} style={{ marginTop: '2px' }} />
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      onFocus={() => setFocusedField('notes')}
                      onBlur={() => setFocusedField(null)}
                      className="form-input form-textarea"
                      placeholder="Recruiter name, referral, key requirements…"
                      rows={4}
                    />
                  </div>
                  <div className="form-line" />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="save-btn">
                  {createMutation.isPending
                    ? <Loader2 size={16} className="spin" />
                    : 'Save Application'
                  }
                  <div className="btn-shine" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .modal-backdrop {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(12px);
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-panel {
    width: 100%; max-width: 860px;
    max-height: 90vh;
    display: flex;
    background: #0b0d11;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05);
    animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }

  /* ── Shared panel styles ── */
  .ai-panel {
    width: 45%; min-width: 0;
    display: flex; flex-direction: column;
    border-right: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.015);
    overflow: hidden;
  }
  .form-panel {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 22px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
  .panel-title {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
    color: rgba(255,255,255,0.9);
  }
  .ai-icon {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    color: white; box-shadow: 0 0 14px rgba(99,102,241,0.4); flex-shrink: 0;
  }

  .close-btn {
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px; color: rgba(255,255,255,0.4); cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .close-btn:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.8); }
  .md-hide { display: none; }

  /* ── AI Tabs ── */
  .ai-tabs {
    display: flex; gap: 4px;
    padding: 12px 16px 0;
    flex-shrink: 0;
  }
  .ai-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    background: transparent; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; color: rgba(255,255,255,0.35);
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
    padding: 8px 10px; cursor: pointer;
    transition: all 0.2s;
  }
  .ai-tab:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.12); }
  .ai-tab.active {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.35);
    color: #a5b4fc;
  }

  .ai-error-banner {
    margin: 12px 16px 0; padding: 10px 14px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
    border-radius: 12px; color: #fca5a5; font-size: 12px; line-height: 1.4;
  }

  /* ── Tab content ── */
  .tab-content {
    flex: 1; display: flex; flex-direction: column; gap: 12px;
    padding: 14px 16px 16px;
    overflow-y: auto;
  }
  .tab-content::-webkit-scrollbar { width: 4px; }
  .tab-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  .ai-hint { font-size: 12px; color: rgba(255,255,255,0.28); line-height: 1.6; }

  .jd-wrap { flex: 1; min-height: 0; }
  .jd-textarea {
    width: 100%; height: 180px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 12px 14px;
    color: rgba(255,255,255,0.8);
    font-family: 'DM Sans', sans-serif; font-size: 13px; line-height: 1.6;
    resize: none; outline: none;
    transition: border-color 0.2s;
  }
  .jd-textarea::placeholder { color: rgba(255,255,255,0.18); }
  .jd-textarea:focus { border-color: rgba(99,102,241,0.4); }

  .ai-action-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
    border: none; border-radius: 12px; padding: 11px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
  }
  .ai-action-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .parse-btn {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    box-shadow: 0 4px 20px rgba(99,102,241,0.3);
  }
  .parse-btn:hover:not(:disabled) { box-shadow: 0 6px 28px rgba(99,102,241,0.45); transform: translateY(-1px); }

  .suggest-btn {
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc;
  }
  .suggest-btn:hover:not(:disabled) { background: rgba(99,102,241,0.18); }

  /* Suggestions */
  .suggestions-list { display: flex; flex-direction: column; gap: 8px; }
  .suggestions-title {
    font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase;
    color: rgba(255,255,255,0.25); margin-bottom: 2px;
  }
  .suggestion-card {
    position: relative;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 10px 36px 10px 12px;
  }
  .suggestion-text { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6; }
  .copy-btn {
    position: absolute; top: 8px; right: 8px;
    width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px; color: rgba(255,255,255,0.35); cursor: pointer;
    transition: all 0.15s;
  }
  .copy-btn:hover { background: rgba(255,255,255,0.12); color: white; }
  .copy-btn.copied { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.3); color: #34d399; }

  .suggestions-empty {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; color: rgba(255,255,255,0.12); padding: 40px 20px; text-align: center;
  }
  .empty-sparkle { opacity: 0.3; }
  .suggestions-empty p { font-size: 12px; }

  /* ── Form panel ── */
  .app-form {
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden;
  }
  .form-fields {
    flex: 1; overflow-y: auto;
    padding: 8px 24px 16px;
    display: flex; flex-direction: column; gap: 22px;
  }
  .form-fields::-webkit-scrollbar { width: 4px; }
  .form-fields::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }

  /* Fields */
  .form-field { position: relative; padding-top: 18px; }
  .form-label {
    position: absolute; top: 0; left: 0;
    font-size: 10px; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase;
    color: rgba(255,255,255,0.28); transition: color 0.2s;
  }
  .form-field.focused .form-label { color: #818cf8; }

  .form-input-wrap { display: flex; align-items: flex-start; gap: 10px; padding-bottom: 10px; }
  .textarea-wrap { align-items: flex-start; }
  .form-icon { color: rgba(255,255,255,0.22); flex-shrink: 0; margin-top: 1px; transition: color 0.2s; }
  .form-field.focused .form-icon { color: #818cf8; }

  .form-input {
    flex: 1; background: transparent; border: none; outline: none;
    font-family: 'DM Sans', sans-serif; font-size: 14px; color: white;
    caret-color: #818cf8;
  }
  .form-input::placeholder { color: rgba(255,255,255,0.18); }
  .form-textarea { resize: none; line-height: 1.6; }

  .form-line { height: 1px; background: rgba(255,255,255,0.07); position: relative; }
  .form-line::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s ease; border-radius: 1px;
  }
  .form-field.focused .form-line::after { transform: scaleX(1); }

  /* Form actions */
  .form-actions {
    display: flex; gap: 10px;
    padding: 16px 24px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }

  .cancel-btn {
    flex: 1; background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; color: rgba(255,255,255,0.4);
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    padding: 11px; cursor: pointer; transition: all 0.15s;
  }
  .cancel-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }

  .save-btn {
    flex: 2; position: relative; overflow: hidden;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 12px; color: white;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    padding: 11px; cursor: pointer;
    box-shadow: 0 4px 20px rgba(99,102,241,0.35);
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(99,102,241,0.45); }
  .save-btn:active:not(:disabled) { transform: scale(0.99); }
  .save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-shine {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transform: skewX(-20deg) translateX(-150%); transition: transform 0.6s ease;
  }
  .save-btn:hover .btn-shine { transform: skewX(-20deg) translateX(250%); }

  .resume-btn {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 4px 20px rgba(16,185,129,0.3);
  }
  .resume-btn:hover:not(:disabled) { box-shadow: 0 6px 28px rgba(16,185,129,0.45); transform: translateY(-1px); }

  /* Resume Preview */
  .resume-preview-wrap {
    flex: 1; display: flex; flex-direction: column; gap: 8px; margin-top: 8px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px; overflow: hidden;
  }
  .resume-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px; background: rgba(255,255,255,0.03);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.3);
  }
  .copy-resume-btn {
    display: flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px; color: rgba(255,255,255,0.6); font-size: 10px; font-weight: 600;
    padding: 4px 8px; cursor: pointer; transition: all 0.2s;
  }
  .copy-resume-btn:hover { background: rgba(255,255,255,0.12); color: white; }
  .copy-resume-btn.copied { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.3); color: #34d399; }

  .resume-textarea {
    flex: 1; min-height: 250px;
    background: transparent; border: none; outline: none;
    padding: 12px; color: rgba(255,255,255,0.8);
    font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1.6;
    resize: none;
  }
  .resume-textarea::-webkit-scrollbar { width: 4px; }
  .resume-textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }

  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 640px) {
    .modal-panel { flex-direction: column; max-height: 95vh; border-radius: 20px; }
    .ai-panel { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); max-height: 45vh; }
    .md-hide { display: flex !important; }
  }
`;