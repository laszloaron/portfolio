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
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent pb-2 leading-tight">
            {project.name}
          </h1>
          
          <div className="flex items-center gap-3">
            {project.github_link && (
              <a
                href={project.github_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <Github className="mr-2 h-4 w-4" />
                Repository
              </a>
            )}
            
            {user?.is_superuser && (
              <>
                <button
                  onClick={() => navigate(`/projects/edit/${project.id}`)}
                  className="flex items-center rounded-lg bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600/30 transition-colors"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center rounded-lg bg-red-600/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-xl text-gray-200 leading-relaxed">
          {project.description}
        </p>

        <div className="mt-12 pt-8 border-t border-white/10">
          {project.documentation ? (
            <article className="prose prose-invert prose-blue max-w-none prose-headings:text-white prose-h1:text-4xl prose-h2:text-3xl prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.documentation}
              </ReactMarkdown>
            </article>
          ) : (
            <p className="text-gray-500 italic">No detailed documentation provided for this project.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
