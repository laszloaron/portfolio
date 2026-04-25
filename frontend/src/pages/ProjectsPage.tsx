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
    <section className="mx-auto max-w-7xl px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
      >
        <div className="max-w-2xl">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-500 bg-clip-text text-transparent pb-4 leading-[1.1]">
            {t('projects.title') || 'Projects'}
          </h1>
          <p className="mt-4 text-xl text-gray-200 font-medium leading-relaxed">
            A curated showcase of my digital craftsmanship, from complex full-stack systems to creative experiments.
          </p>
        </div>

        {user?.is_superuser && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/projects/new')}
            className="flex items-center rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all"
          >
            <Plus className="mr-2 h-6 w-6" />
            Create Project
          </motion.button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500"></div>
          <p className="text-blue-400 font-bold animate-pulse">Loading amazing things...</p>
        </div>
      ) : projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm"
        >
          <p className="text-2xl text-gray-400 font-medium">{t('projects.noProjects') || 'Your project gallery is currently empty.'}</p>
        </motion.div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/projects/${project.id}`} className="group relative block h-full">
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 blur transition duration-500 group-hover:opacity-30"></div>
                
                <div className="relative flex h-full flex-col justify-between rounded-[2rem] border border-blue-500/20 bg-[#0a192f] p-8 transition-all duration-500 group-hover:bg-[#112240] group-hover:border-blue-400/40 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-inner">
                        <Github className="h-6 w-6" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-white leading-tight mb-4 group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-blue-100/80 text-lg line-clamp-3 leading-relaxed mb-8 font-medium">
                      {project.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {project.github_link ? (
                      <button 
                        className="flex items-center text-sm font-bold text-blue-300 hover:text-white transition-colors"
                        onClick={(e) => { 
                          e.preventDefault(); 
                          window.open(project.github_link || '', '_blank'); 
                        }}
                      >
                        <Github className="h-4 w-4 mr-2" />
                        Codebase
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-blue-500/40 italic">Private Repo</span>
                    )}
                    
                    <div className="rounded-full bg-blue-500/10 p-2 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 border border-blue-500/20">
                      <ArrowRight className="h-5 w-5" />
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
