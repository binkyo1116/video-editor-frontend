import {Project} from '../core/_models'
import {useState, useEffect} from 'react'

function useProject() {
  const [currentProject, setCurrentProject] = useState<Project>()

  useEffect(() => {
    setCurrentProject(loadCurrentProject())
  }, [])

  const saveCurrentProject = (projectToSave: Project) => {
    setCurrentProject(projectToSave)
    localStorage.setItem('project', JSON.stringify(projectToSave))
  }

  const loadCurrentProject = (): Project => {
    return JSON.parse(localStorage.getItem('project') as string) as Project
  }

  return {currentProject, saveCurrentProject, loadCurrentProject}
}

export default useProject
