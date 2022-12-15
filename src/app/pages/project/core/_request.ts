import axios, {AxiosResponse} from 'axios'
import {ID, Response} from '../../../../_metronic/helpers'
import {Project, ProjectQueryResponse, ProjectsQueryResponse} from './_models'

const API_URL = `${process.env.REACT_APP_API_URL}/api`
const PROJECT_URL = `${API_URL}/projects`
const GET_PROJECTS_URL = `${API_URL}/projects`
export const API_BASE_URL = process.env.REACT_APP_API_URL

const getProjects = (authorId: string): Promise<ProjectsQueryResponse | undefined> => {
  return axios
    .get(`${GET_PROJECTS_URL}/all/${authorId}`)
    .then((d: AxiosResponse<Response<ProjectsQueryResponse>>) => d.data)
    .then((response: Response<ProjectsQueryResponse>) => response.data)
}

const getProjectById = (id: string): Promise<Project | undefined> => {
  return axios
    .get(`${PROJECT_URL}/${id}`)
    .then((response: AxiosResponse<Response<Project>>) => response.data)
    .then((response: Response<Project>) => response.data)
}

const createProject = (project: Project): Promise<Project | undefined> => {
  return axios
    .post(PROJECT_URL, project)
    .then((response: AxiosResponse<Response<Project>>) => response.data)
    .then((response: Response<Project>) => response.data)
}

const updateProject = (project: Project): Promise<Project | undefined> => {
  return axios
    .put(`${PROJECT_URL}/${project._id}`, project)
    .then((response: AxiosResponse<Response<Project>>) => response.data)
    .then((response: Response<Project>) => response.data)
}

const createThumbnail = (projectId: string, dataUrl: string): Promise<string> => {
  return axios
    .post(`${PROJECT_URL}/create_project_thumbnail`, {projectId, dataUrl})
    .then((response) => response.data)
    .then((response) => response.thumbnailUrl)
}

const deleteProject = (projectId: string): Promise<number> => {
  return axios.delete(`${PROJECT_URL}/${projectId}`).then((res) => res.status)
}

const deleteSelectedProjects = (projectIds: Array<ID>): Promise<void> => {
  const requests = projectIds.map((id) => axios.delete(`${PROJECT_URL}/${id}`))
  return axios.all(requests).then(() => {})
}

const uploadFile = (projectId: string, form: FormData): Promise<string[]> => {
  return axios
    .post(`${PROJECT_URL}/${projectId}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (data) => {
        // console.log(Math.round((100 * data.loaded) / data.total))
      },
    })
    .then((res) => res.data)
}

export {
  getProjects,
  deleteProject,
  deleteSelectedProjects,
  getProjectById,
  createProject,
  updateProject,
  uploadFile,
  createThumbnail,
}
