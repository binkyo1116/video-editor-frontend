import React from 'react'
import {useEffect} from 'react'
import {useAuth} from '../../../modules/auth'
import {createProject, deleteProject, getProjects, updateProject} from '../core/_request'
import ProjectItem from './ProjectItem'
import {useState} from 'react'
import {Project, ProjectQueryResponse, ProjectsQueryResponse} from '../core/_models'
import useProject from './../helper/index'

function ProjectList() {
  const {currentUser} = useAuth()
  const {saveCurrentProject} = useProject()
  const [projects, setProjects] = useState<ProjectsQueryResponse>([])
  useEffect(() => {
    if (currentUser)
      getProjects(currentUser._id).then((res) => {
        setProjects(res as ProjectsQueryResponse)
      })
  }, [])

  const deleteProjectById = async (projectId: string) => {
    const status = await deleteProject(projectId)
    if (status === 200) {
      if (currentUser)
        getProjects(currentUser._id).then((res) => {
          setProjects(res as ProjectsQueryResponse)
        })
    }
  }

  const copyProject = async (project: Project) => {
    const createdProject = await createProject({
      ...project,
      _id: undefined,
    })
    if (createdProject) {
      if (currentUser)
        getProjects(currentUser._id).then((res) => {
          setProjects(res as ProjectsQueryResponse)
        })
    }
  }

  const renameProject = async (project: Project, name: string) => {
    const updatedProject = await updateProject({...project, name: name})
    if (updatedProject) {
      saveCurrentProject(updatedProject)
    }
  }

  return (
    <>
      {projects.map((project) => (
        <div key={project._id} className='col-lg-2'>
          <ProjectItem
            project={project}
            updatedDate={new Date(project.updatedAt)}
            renameProject={renameProject}
            deleteProjectById={deleteProjectById}
            copyProject={copyProject}
          ></ProjectItem>
        </div>
      ))}
    </>
  )
}

export default ProjectList
