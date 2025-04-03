import BuildTime from './BuildTime'
import { getProjects, type VercelProject } from '@/app/actions/vercel'

export default async function Footer() {
  const projects = await getProjects()

  return (
    <footer className="mt-auto py-6 bg-gradient-to-r from-gray-50 to-gray-100 shadow-inner">
      <div className="mx-auto flex justify-between items-center px-6">
        <div className="flex gap-4">
          {projects.map((project: VercelProject) => (
            <a
              key={project.name}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {project.name}
            </a>
          ))}
        </div>
        <BuildTime />
      </div>
    </footer>
  )
}
