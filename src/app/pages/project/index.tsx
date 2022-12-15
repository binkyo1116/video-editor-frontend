import CreateProjectButton from './components/CreateProjectButton'
import ProjectList from './components/ProjectList'

function Project() {
  return (
    <div className='fv-row'>
      <div className='row g-10'>
        <div className='col-lg-2'>
          <CreateProjectButton />
        </div>
        <ProjectList></ProjectList>
      </div>
    </div>
  )
}

export default Project
