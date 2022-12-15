import {useNavigate} from 'react-router-dom'
import ContentEditable from 'react-contenteditable'
import {Dropdown} from './DropDown'
import {useState} from 'react'
import {Project} from '../core/_models'
import {useRef} from 'react'

function ProjectItem(props: {
  project: Project
  updatedDate?: Date
  renameProject: (project: Project, name: string) => void
  deleteProjectById: (projectId: string) => void
  copyProject: (project: Project) => void
}) {
  const [name, setName] = useState(props.project.name)
  const nameInput = useRef<any>()
  const navigate = useNavigate()

  const focusNameInput = () => {
    nameInput.current.focus()
  }

  const changeName = (e: any) => {
    setName(e.target.value)
    props.renameProject(props.project, e.target.value)
  }

  const openProject = async (e: any) => {
    e.preventDefault()
    if (props.project._id) {
      navigate(`/apps/video-editor/${props.project._id}/editor?type=video`)
    }
  }
  return (
    <div className='card h-250px'>
      <div className='card-body pb-5'>
        <div className='d-flex mb-5'>
          <div className='d-flex flex-grow-1'>
            <img
              onClick={openProject}
              crossOrigin='anonymous'
              src={props.project.thumbnailUrl}
              className='w-100 h-100px'
              alt={props.project.name}
            />
            <div className='position-absolute' style={{top: 10, right: 10}}>
              <span className='badge badge-light-success fw-bolder fs-8'>
                {props.project.isRendering ? 'Rendering' : ''}
              </span>
            </div>

            <div className='my-0'>
              <button
                style={{bottom: 5, right: 10}}
                className='position-absolute btn btn-sm btn-icon btn-bg-light btn-active-color-primary'
                data-kt-menu-trigger='hover'
                data-kt-menu-placement='bottom-end'
                data-kt-menu-flip='top-end'
              >
                <i className='bi bi-three-dots fs-3'></i>
              </button>
              <div className='menu menu-sub menu-sub-dropdown' data-kt-menu='true'>
                <Dropdown
                  project={props.project}
                  focusNameInput={focusNameInput}
                  openProject={openProject}
                  copyProject={props.copyProject}
                  deleteProjectById={props.deleteProjectById}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='mb-1' style={{height:'60px', overflowY:'auto'}}>
          <p className='text-gray-800 fw-normal'>{`Edited at ${props.updatedDate?.toLocaleDateString()}, ${props.updatedDate?.toLocaleTimeString()}`}</p>
          <p className='text-gray-800 fw-normal'>
            {props.project?.lastRenderedTime === undefined
              ? 'Not rendered yet'
              : `Rendered at ${new Date(
                  props.project.lastRenderedTime ?? ''
                ).toLocaleDateString()}, ${new Date(
                  props.project.lastRenderedTime ?? ''
                ).toLocaleTimeString()}`}
          </p>
        </div>
        <div className='separator mb-4'></div>
        <div>
          <ContentEditable
            innerRef={nameInput}
            html={name}
            disabled={false}
            onChange={changeName}
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectItem
