import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Github, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectsStore } from '@/store/useProjectsStore';

export default function ProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, fetchProjects, isLoading } = useProjectsStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-12"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            {t('projects.title') || 'Projects'}
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Explore some of the recent work and open source projects.
          </p>
        </div>

        {user?.is_superuser && (
          <button
            onClick={() => navigate('/projects/new')}
            className="flex items-center rounded-full bg-blue-600 px-5 py-2.5 font-medium text-white shadow-lg hover:bg-blue-700 hover:shadow-blue-500/20 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Project
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm">
          <p className="text-xl text-gray-400">{t('projects.noProjects') || 'No projects found.'}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link to={`/projects/${project.id}`} className="group block h-full">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:bg-white/5 hover:shadow-2xl hover:shadow-blue-500/10">
                  <div>
                    <h3 className="mb-3 text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    {project.github_link ? (
                      <div className="flex items-center text-gray-400 hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); window.open(project.github_link || '', '_blank'); }}>
                        <Github className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Repository</span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="flex items-center text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                      Details <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
