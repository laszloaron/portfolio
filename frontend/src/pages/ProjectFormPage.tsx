import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectsStore } from '@/store/useProjectsStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';

export default function ProjectFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { project, fetchProject, createProject, updateProject } = useProjectsStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    github_link: '',
    documentation: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      github_link: formData.github_link || null,
      documentation: formData.documentation || null
    };

    let success = false;
    if (isEditing && id) {
      success = await updateProject(id, dataToSubmit);
    } else {
      success = await createProject(dataToSubmit);
    }

    if (success) {
      navigate('/projects');
    }
  };

  if (!user?.is_superuser) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <button 
        onClick={() => navigate('/projects')}
        className="mb-8 flex items-center text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
      >
        <h1 className="mb-6 text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          {isEditing ? 'Edit Project' : 'Add New Project'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">Project Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="e.g. Awesome AI tool"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">Short Description *</label>
            <input
              type="text"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="A brief summary of the project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">GitHub Link (Optional)</label>
            <input
              type="url"
              name="github_link"
              value={formData.github_link}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">Detailed Documentation (Markdown)</label>
            <textarea
              name="documentation"
              value={formData.documentation}
              onChange={handleChange}
              rows={12}
              className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm"
              placeholder="# Project Details&#10;&#10;You can write markdown here, including images: ![alt](url)"
            />
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Save className="mr-2 h-5 w-5" />
            {isEditing ? 'Save Changes' : 'Create Project'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
