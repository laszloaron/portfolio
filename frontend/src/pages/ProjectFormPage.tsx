import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectsStore } from '@/store/useProjectsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, FileUp, Eye, Edit3 } from 'lucide-react';

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docSectionRef = useRef<HTMLDivElement>(null);
  const savedScrollPos = useRef<number>(0);
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { project, fetchProject, createProject, updateProject } = useProjectsStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    github_link: '',
    documentation: ''
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!user?.is_superuser) {
      navigate('/projects');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isEditing && id) {
      fetchProject(id);
    }
  }, [isEditing, id, fetchProject]);

  useEffect(() => {
    if (isEditing && project) {
      setFormData({
        name: project.name,
        description: project.description,
        github_link: project.github_link || '',
        documentation: project.documentation || ''
      });
    }
  }, [isEditing, project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      alert('Please select a Markdown (.md) file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFormData(prev => ({ ...prev, documentation: content }));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      github_link: formData.github_link || null,
      documentation: formData.documentation || null
    };

    let result;
    if (isEditing && id) {
      const success = await updateProject(id, dataToSubmit);
      if (success) result = id;
    } else {
      const newProject = await createProject(dataToSubmit);
      if (newProject) result = newProject.id;
    }

    if (result) {
      navigate(`/projects/${result}`);
    }
  };

  const togglePreview = (mode: boolean) => {
    if (mode) {
      // Save current scroll position before entering preview
      savedScrollPos.current = window.pageYOffset;
      setPreviewMode(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Restore scroll position when going back to editor
      const scrollTarget = savedScrollPos.current;
      setPreviewMode(false);
      setTimeout(() => {
        window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }, 100);
    }
  };

  if (!user?.is_superuser) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <button 
        onClick={() => navigate('/projects')}
        className="mb-8 flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gallery
      </button>

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-blue-100 bg-white p-8 sm:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
      >
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-black text-blue-900 tracking-tight">
            {previewMode ? 'Documentation Preview' : (isEditing ? 'Update Project' : 'New Creation')}
          </h1>
          
          {previewMode && (
            <button
              onClick={() => togglePreview(false)}
              className="flex items-center px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Back to Editor
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {!previewMode ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-3 uppercase tracking-widest">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/10 p-5 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-normal shadow-sm"
                    placeholder="e.g. My Amazing Portfolio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-3 uppercase tracking-widest">Short Description *</label>
                  <input
                    type="text"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/10 p-5 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-normal shadow-sm"
                    placeholder="What is this project about in one sentence?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-3 uppercase tracking-widest">GitHub Link (Optional)</label>
                  <input
                    type="url"
                    name="github_link"
                    value={formData.github_link}
                    onChange={handleChange}
                    className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/10 p-5 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-normal shadow-sm"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div ref={docSectionRef}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <label className="text-sm font-bold text-blue-900 uppercase tracking-widest">Detailed Documentation (Markdown)</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePreview(true)}
                        className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors border border-blue-100 shadow-sm"
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        Enter Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors border border-blue-100 shadow-sm"
                      >
                        <FileUp className="mr-1.5 h-4 w-4" />
                        Import .md
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        accept=".md"
                        className="hidden"
                      />
                    </div>
                  </div>
                  <textarea
                    name="documentation"
                    value={formData.documentation}
                    onChange={handleChange}
                    rows={15}
                    className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/10 p-5 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm font-normal shadow-sm"
                    placeholder="# Use Markdown here...&#10;&#10;Explain the tech stack, features, and challenges."
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="min-h-[500px] w-full rounded-[2rem] border-2 border-blue-50 bg-blue-50/10 p-10 overflow-auto shadow-inner"
              >
                {formData.documentation ? (
                  <article className="prose prose-blue max-w-none 
                    prose-headings:text-blue-900 prose-headings:font-black
                    prose-p:text-blue-950 prose-p:leading-relaxed prose-p:text-lg
                    prose-a:text-blue-600 prose-strong:text-blue-900
                    prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded
                    prose-img:rounded-3xl prose-img:shadow-xl">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.documentation}
                    </ReactMarkdown>
                  </article>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-blue-300 py-20">
                    <Eye className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-xl font-medium italic text-center">Your masterpiece will appear here.<br/>Go back and start writing!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!previewMode && (
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 font-black text-white hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 uppercase tracking-widest"
            >
              <Save className="mr-3 h-6 w-6" />
              {isEditing ? 'Save Changes' : 'Complete Project'}
            </button>
          )}
        </form>
      </motion.div>
    </div>
  );
}
