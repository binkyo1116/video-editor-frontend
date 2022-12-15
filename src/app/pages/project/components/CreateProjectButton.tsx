import * as Yup from 'yup'
import {KTSVG} from '../../../../_metronic/helpers'
import {useAuth} from '../../../modules/auth'
import {createProject} from '../core/_request'
import useProject from '../helper'
import {useNavigate} from 'react-router-dom'
import {useFormik} from 'formik'
import clsx from 'clsx'

function CreateProjectButton() {
  const {currentUser} = useAuth()
  const navigate = useNavigate()
  const create = async () => {
    const project = await createProject({
      name: formik.getFieldProps('name').value,
      authorId: currentUser?._id as string,
      projectDuration: 0,
      width: 0,
      height: 0,
      canvasHeight: 0,
      canvasWidth: 0,
      trackList: '',
      mediaList: '',
      trackId: 0,
      renderedVideoUrl: '',
      isRendering: false,
      thumbnailUrl: '/media/imageeditor/DarkGray.png',
    })
    if (project) {
      navigate(`/apps/video-editor/${project._id}/editor?type=video`)
    }
  }

  const projectSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 500 symbols')
      .required('Name is required'),
  })

  const formik = useFormik({
    initialValues: {name: ''},
    validationSchema: projectSchema,
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      try {
      } catch (ex) {
        console.error(ex)
      } finally {
        setSubmitting(true)
      }
    },
  })
  return (
    <>
      <div className='' data-bs-toggle='modal' data-bs-target='#kt_modal_1'>
        <label
          className=' h-250px btn btn-outline btn-outline-dashed btn-outline-default p-7  align-items-center'
          htmlFor='kt_create_account_form_account_type_personal'
        >
          <div className='symbol symbol-100px'>
            <span className='symbol-label'>
              <KTSVG
                svgClassName='h-100px'
                path='/media/icons/duotune/arrows/arr075.svg'
                className='svg-icon-3x svg-icon-primary d-block my-2 flex justify-content-center fs-6'
              />
            </span>
          </div>

          <span className='d-block fw-bold text-center mt-3'>
            <span className='text-dark fw-bolder d-block fs-4 mb-2'>Create Project</span>
            <span className='text-gray-400 fw-bold fs-6'>Click to create new project</span>
          </span>
        </label>
      </div>
      <div className='modal fade' tabIndex={-1} id='kt_modal_1'>
        <div className='modal-dialog'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Enter the name of the project</h5>
              <div
                className='btn btn-icon btn-sm btn-active-light-primary ms-2'
                data-bs-dismiss='modal'
                aria-label='Close'
              >
                <KTSVG
                  path='/media/icons/duotune/arrows/arr061.svg'
                  className='svg-icon svg-icon-2x'
                />
              </div>
            </div>
            <div className='modal-body'>
              <form
                id='kt_modal_add_user_form'
                className='form'
                onSubmit={formik.handleSubmit}
                noValidate
              >
                {/* begin::Scroll */}
                <div
                  className='d-flex flex-column scroll-y me-n7 pe-7'
                  id='kt_modal_add_user_scroll'
                  data-kt-scroll='true'
                  data-kt-scroll-activate='{default: false, lg: true}'
                  data-kt-scroll-max-height='auto'
                  data-kt-scroll-dependencies='#kt_modal_add_user_header'
                  data-kt-scroll-wrappers='#kt_modal_add_user_scroll'
                  data-kt-scroll-offset='300px'
                >
                  <div className='fv-row mb-7'>
                    {/* begin::Label */}
                    <label className='required fw-bold fs-6 mb-2'>Project Name</label>
                    {/* end::Label */}

                    {/* begin::Input */}
                    <input
                      placeholder='Project Name'
                      {...formik.getFieldProps('name')}
                      type='text'
                      name='name'
                      className={clsx(
                        'form-control form-control-solid mb-3 mb-lg-0',
                        {'is-invalid': formik.touched.name && formik.errors.name},
                        {
                          'is-valid': formik.touched.name && !formik.errors.name,
                        }
                      )}
                      autoComplete='off'
                      disabled={formik.isSubmitting}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className='fv-plugins-message-container'>
                        <div className='fv-help-block'>
                          <span role='alert'>{formik.errors.name}</span>
                        </div>
                      </div>
                    )}
                    {/* end::Input */}
                  </div>
                </div>
                {/* end::Scroll */}
              </form>
            </div>
            <div className='modal-footer'>
              <button type='button' className='btn btn-light' data-bs-dismiss='modal'>
                Close
              </button>
              <button
                type='button'
                onClick={create}
                className='btn btn-primary'
                data-bs-dismiss='modal'
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateProjectButton
