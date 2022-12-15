import {KTSVG} from '../../../../_metronic/helpers'
import {Project} from '../core/_models'
import {API_BASE_URL} from '../core/_request'

export function Dropdown(props: {
  project: Project
  deleteProjectById: (projectId: string) => void
  copyProject: (project: Project) => void
  openProject: (e: any) => void
  focusNameInput: () => void
}) {
  const deleteProject = () => {
    props.deleteProjectById(props.project._id as string)
  }

  const copyProject = async () => {
    props.copyProject(props.project)
  }

  const download = async () => {
    const blob = await fetch(
      `${API_BASE_URL}/media/${props.project?._id}/video/${props.project.renderedVideoUrl}`
    ).then((res) => res.blob())
    const tempUrl = URL.createObjectURL(blob)
    const aTag = document.createElement('a') as HTMLAnchorElement
    aTag.href = tempUrl
    aTag.download = props.project.renderedVideoUrl

    document.body.appendChild(aTag)

    aTag.click()
    URL.revokeObjectURL(tempUrl)
    aTag.remove()
  }

  return (
    <div className='p-5 w-170px'>
      <div className='d-flex align-items-center mb-2'>
        <div className='symbol symbol-40px me-3'>
          <span className=''>
            <KTSVG path='/media/icons/duotune/art/art005.svg' className='svg-icon-2x text-white' />
          </span>
        </div>
        <div className='d-flex flex-column'>
          <p onClick={props.focusNameInput} className='text-dark text-hover-primary fs-6 '>
            Rename
          </p>
        </div>
      </div>
      <div className='d-flex align-items-center mb-2'>
        <div className='symbol symbol-40px me-3'>
          <span className=''>
            <KTSVG path='/media/icons/duotune/art/art005.svg' className='svg-icon-2x text-white' />
          </span>
        </div>
        <div className='d-flex flex-column'>
          <p onClick={props.openProject} className='text-dark text-hover-primary fs-6 '>
            Edit
          </p>
        </div>
      </div>
      {props.project.renderedVideoUrl !== '' && props.project.renderedVideoUrl !== undefined && (
        <div className='d-flex align-items-center mb-2'>
          <div className='symbol symbol-40px me-3'>
            <span className=''>
              <KTSVG
                path='/media/icons/duotune/communication/com012.svg'
                className='svg-icon-2x text-white'
              />
            </span>
          </div>
          <div className='d-flex flex-column'>
            <p onClick={download} className='text-dark text-hover-primary fs-6 '>
              Download
            </p>
          </div>
        </div>
      )}
      <div className='d-flex align-items-center mb-2'>
        <div className='symbol symbol-40px me-3'>
          <span className=''>
            <KTSVG
              path='/media/icons/duotune/communication/com012.svg'
              className='svg-icon-2x text-white'
            />
          </span>
        </div>
        <div className='d-flex flex-column'>
          <p onClick={copyProject} className='text-dark text-hover-primary fs-6 '>
            Make a copy
          </p>
        </div>
      </div>
      <div className='d-flex align-items-center mb-2'>
        <div className='symbol symbol-40px me-3'>
          <span className=''>
            <KTSVG
              path='/media/icons/duotune/coding/cod008.svg'
              className='svg-icon-2x text-white'
            />
          </span>
        </div>
        <div className='d-flex flex-column'>
          <p onClick={deleteProject} className='text-dark text-hover-primary fs-6 '>
            Delete
          </p>
        </div>
      </div>
    </div>
  )
}
