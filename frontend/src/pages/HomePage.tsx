import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, UserCircle2, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'

export default function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const isLoggedIn = Boolean(user)

  const features = [
    {
      icon: <Code2 className="w-10 h-10 text-blue-500" />,
      title: t('home.features.projects.title'),
      desc: t('home.features.projects.desc'),
      link: '/projects'
    },
    {
      icon: <UserCircle2 className="w-10 h-10 text-indigo-500" />,
      title: t('home.features.about.title'),
      desc: t('home.features.about.desc'),
      link: '/about'
    },
    {
      icon: <MessageSquare className="w-10 h-10 text-blue-400" />,
      title: t('home.features.contact.title'),
      desc: t('home.features.contact.desc'),
      link: '/contact'
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50/50">
      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {t('home.title')}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('home.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 uppercase tracking-wider"
            >
              {t('home.cta')}
              <ArrowRight size={22} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              variants={item}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center"
            >
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
                {f.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-8 flex-1 italic">
                "{f.desc}"
              </p>
              <Link 
                to={f.link}
                className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn"
              >
                Tudj meg többet
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Auth Info Section (Only for guests) ─────────────────────────── */}
      {!isLoggedIn && (
        <section className="py-20 px-4">
          <motion.div 
            className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-10 md:p-16 text-white shadow-3xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={200} />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 font-bold text-sm mb-6 border border-blue-500/30 uppercase tracking-widest">
                <ShieldCheck size={16} />
                Secure Access
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                {t('home.auth_info.title')}
              </h2>
              <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
                {t('home.auth_info.desc')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-white/10"
                >
                  Regisztráció
                </Link>
                <Link
                  to="/login"
                  className="bg-white/10 text-white border border-white/20 backdrop-blur-md px-8 py-4 rounded-2xl font-black hover:bg-white/20 transition-all active:scale-95"
                >
                  Bejelentkezés
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} — Minden jog fenntartva</p>
      </footer>
    </div>
  )
}
