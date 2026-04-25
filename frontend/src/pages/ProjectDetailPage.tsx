import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectsStore } from '@/store/useProjectsStore';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { project, fetchProject, deleteProject, isLoading } = useProjectsStore();

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      if (id) {
        const success = await deleteProject(id);
        if (success) {
          navigate('/projects');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-400">Project not found.</p>
        <button 
          onClick={() => navigate('/projects')}
          className="mt-4 text-blue-400 hover:underline"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <motion.button 
        whileHover={{ x: -4 }}
        onClick={() => navigate('/projects')}
        className="mb-8 flex items-center text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-2 rounded-full w-fit"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Gallery
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-[3rem] border border-blue-100 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.1)]"
      >
        {/* Header Section: Vibrant and Cheerful */}
        <div className="relative p-10 sm:p-16 border-b border-blue-50 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center rounded-full bg-blue-600 px-4 py-1 text-xs font-black uppercase tracking-widest text-white mb-6">
                Featured Project
              </div>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-blue-900 pb-4 leading-[1.1]">
                {project.name}
              </h1>
              <p className="mt-8 text-xl sm:text-2xl text-blue-800 font-semibold leading-relaxed max-w-3xl">
                {project.description}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              {project.github_link && (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={project.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center rounded-2xl bg-blue-600 text-white px-8 py-4 text-sm font-black shadow-xl hover:bg-blue-700 transition-all uppercase tracking-wider"
                >
                  <Github className="mr-3 h-6 w-6" />
                  Source Code
                </motion.a>
              )}
              
              {user?.is_superuser && (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => navigate(`/projects/edit/${project.id}`)}
                    className="flex items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-all"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center rounded-2xl bg-red-50 border border-red-100 px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section: Clear and High Contrast */}
        <div className="p-10 sm:p-16">
          {project.documentation ? (
            <article className="prose prose-blue max-w-none 
              prose-headings:text-blue-900 prose-headings:font-black prose-headings:tracking-tight
              prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl
              prose-p:text-blue-950 prose-p:leading-relaxed prose-p:text-xl
              prose-a:text-blue-600 prose-a:font-bold hover:prose-a:text-blue-500
              prose-strong:text-blue-900 prose-strong:font-black
              prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-2 prose-code:py-1 prose-code:rounded-lg
              prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:border prose-img:border-gray-100
              prose-ul:list-disc prose-ol:list-decimal prose-li:text-blue-900 prose-li:text-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.documentation}
              </ReactMarkdown>
            </article>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-blue-50/30 rounded-[2rem]">
              <div className="rounded-full bg-blue-100 p-10 mb-8">
                <Github className="h-16 w-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-blue-900 mb-2">No detailed docs yet</h3>
              <p className="text-blue-700 text-lg font-medium max-w-md">I'm currently putting together the documentation for this masterpiece. Stay tuned!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
