import {FC, useState} from 'react'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {isNotEmpty} from '../../../../../../_metronic/helpers'
import {initialUser, User} from '../core/_models'
import clsx from 'clsx'
import {useListView} from '../core/ListViewProvider'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {createUser, updateUser} from '../core/_requests'
import {useQueryResponse} from '../core/QueryResponseProvider'

type Props = {
  isUserLoading: boolean
  user: User
}

const UserEditModalForm: FC<Props> = ({user, isUserLoading}) => {
  const {setItemIdForUpdate, modalType} = useListView()

  const resetPasswordShape = {
    password: Yup.string()
      .min(6, 'Minimum 6 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Password is required'),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .min(6, 'Minimum 6 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Password Confirmation is required'),
  }

  const editShape = {
    email: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Email is required'),
    fullname: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('Name is required'),
    isActive: Yup.boolean(),
  }

  const createShape = {...editShape, ...resetPasswordShape}

  const editUserSchema = Yup.object().shape(
    modalType === 'create' ? createShape : modalType === 'edit' ? editShape : resetPasswordShape
  )

  const {refetch} = useQueryResponse()

  const [active, setActive] = useState<boolean>(user.isActive as boolean)

  const [userForEdit] = useState<User>({
    ...user,
    role: user.isAdmin ? 'Administrator' : 'User',
    fullname: user.fullname || initialUser.fullname,
    email: user.email || initialUser.email,
    password: initialUser.password,
    password_confirmation: initialUser.password,
  })

  const cancel = (withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }

  const formik = useFormik({
    initialValues: userForEdit,
    validationSchema: editUserSchema,
    onSubmit: async (values, {setSubmitting}) => {
      setSubmitting(true)
      try {
        if (isNotEmpty(values._id)) {
          await updateUser(
            {
              ...values,
              isAdmin: values.role === 'Administrator',
              isActive: active,
            },
            modalType === 'reset_password'
          )
        } else {
          await createUser({
            ...values,
            isAdmin: values.role === 'Administrator',
            isActive: active,
          })
        }
      } catch (ex) {
        console.error(ex)
      } finally {
        setSubmitting(true)
        cancel(true)
      }
    },
  })

  return (
    <>
      <form id='kt_modal_add_user_form' className='form' onSubmit={formik.handleSubmit} noValidate>
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
          {(modalType === 'edit' || modalType === 'create') && (
            <>
              {/* begin::Input group */}
              <div className='fv-row mb-7'>
                {/* begin::Label */}
                <label className='required fw-bold fs-6 mb-2'>Full Name</label>
                {/* end::Label */}

                {/* begin::Input */}
                <input
                  placeholder='Full name'
                  {...formik.getFieldProps('fullname')}
                  type='text'
                  name='fullname'
                  className={clsx(
                    'form-control form-control-solid mb-3 mb-lg-0',
                    {'is-invalid': formik.touched.fullname && formik.errors.fullname},
                    {
                      'is-valid': formik.touched.fullname && !formik.errors.fullname,
                    }
                  )}
                  autoComplete='off'
                  disabled={formik.isSubmitting || isUserLoading}
                />
                {formik.touched.fullname && formik.errors.fullname && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>
                      <span role='alert'>{formik.errors.fullname}</span>
                    </div>
                  </div>
                )}
                {/* end::Input */}
              </div>
              {/* end::Input group */}

              {/* begin::Input group */}
              <div className='fv-row mb-7'>
                {/* begin::Label */}
                <label className='required fw-bold fs-6 mb-2'>Email</label>
                {/* end::Label */}

                {/* begin::Input */}
                <input
                  placeholder='Email'
                  {...formik.getFieldProps('email')}
                  className={clsx(
                    'form-control form-control-solid mb-3 mb-lg-0',
                    {'is-invalid': formik.touched.email && formik.errors.email},
                    {
                      'is-valid': formik.touched.email && !formik.errors.email,
                    }
                  )}
                  type='email'
                  name='email'
                  autoComplete='off'
                  disabled={formik.isSubmitting || isUserLoading}
                />
                {/* end::Input */}
                {formik.touched.email && formik.errors.email && (
                  <div className='fv-plugins-message-container'>
                    <span role='alert'>{formik.errors.email}</span>
                  </div>
                )}
              </div>
              {/* end::Input group */}
            </>
          )}
          {(modalType === 'reset_password' || modalType === 'create') && (
            <>
              {/* begin::Input group */}
              <div className='fv-row mb-7'>
                {/* begin::Label */}
                <label className='required fw-bold fs-6 mb-2'>Password</label>
                {/* end::Label */}

                {/* begin::Input */}
                <input
                  placeholder='Password'
                  {...formik.getFieldProps('password')}
                  type='password'
                  name='password'
                  className={clsx(
                    'form-control form-control-solid mb-3 mb-lg-0',
                    {'is-invalid': formik.touched.password && formik.errors.password},
                    {
                      'is-valid': formik.touched.password && !formik.errors.password,
                    }
                  )}
                  autoComplete='off'
                  disabled={formik.isSubmitting || isUserLoading}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>
                      <span role='alert'>{formik.errors.password}</span>
                    </div>
                  </div>
                )}
                {/* end::Input */}
              </div>
              {/* end::Input group */}

              {/* begin::Input group */}
              <div className='fv-row mb-7'>
                {/* begin::Label */}
                <label className='required fw-bold fs-6 mb-2'>Password Confirmation</label>
                {/* end::Label */}

                {/* begin::Input */}
                <input
                  placeholder='Password Confirmation'
                  {...formik.getFieldProps('password_confirmation')}
                  type='password'
                  name='password_confirmation'
                  className={clsx(
                    'form-control form-control-solid mb-3 mb-lg-0',
                    {
                      'is-invalid':
                        formik.touched.password_confirmation && formik.errors.password_confirmation,
                    },
                    {
                      'is-valid':
                        formik.touched.password_confirmation &&
                        !formik.errors.password_confirmation,
                    }
                  )}
                  autoComplete='off'
                  disabled={formik.isSubmitting || isUserLoading}
                />
                {formik.touched.password_confirmation && formik.errors.password_confirmation && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>
                      <span role='alert'>{formik.errors.password_confirmation}</span>
                    </div>
                  </div>
                )}
                {/* end::Input */}
              </div>
              {/* end::Input group */}
            </>
          )}

          {(modalType === 'create' || modalType === 'edit') && (
            <>
              <div className='row mb-0'>
                <label className='col-lg-5 required fw-bold fs-6 mb-2'>Active</label>

                <div className='col-lg-7 d-flex align-items-center'>
                  <div className='form-check form-check-solid form-switch fv-row'>
                    <input
                      className='form-check-input w-45px h-30px'
                      type='checkbox'
                      id='active'
                      name='isActive'
                      defaultChecked={formik.values.isActive}
                      onChange={() => setActive((previousActive) => !previousActive)}
                    />
                    <label className='form-check-label'></label>
                  </div>
                </div>
              </div>

              {/* begin::Input group */}
              <div className='mb-7'>
                {/* begin::Label */}
                <label className='required fw-bold fs-6 mb-5'>Role</label>
                {/* end::Label */}
                {/* begin::Roles */}
                {/* begin::Input row */}
                <div className='d-flex fv-row'>
                  {/* begin::Radio */}
                  <div className='form-check form-check-custom form-check-solid'>
                    {/* begin::Input */}
                    <input
                      className='form-check-input me-3'
                      {...formik.getFieldProps('role')}
                      name='role'
                      type='radio'
                      value='Administrator'
                      id='kt_modal_update_role_option_0'
                      checked={formik.values.role === 'Administrator'}
                      disabled={formik.isSubmitting || isUserLoading}
                    />

                    {/* end::Input */}
                    {/* begin::Label */}
                    <label className='form-check-label' htmlFor='kt_modal_update_role_option_0'>
                      <div className='fw-bolder text-gray-800'>Administrator</div>
                      <div className='text-gray-600'>Best for Administrators</div>
                    </label>
                    {/* end::Label */}
                  </div>
                  {/* end::Radio */}
                </div>
                {/* end::Input row */}
                <div className='separator separator-dashed my-5'></div>
                {/* begin::Input row */}
                <div className='d-flex fv-row'>
                  {/* begin::Radio */}
                  <div className='form-check form-check-custom form-check-solid'>
                    {/* begin::Input */}
                    <input
                      className='form-check-input me-3'
                      {...formik.getFieldProps('role')}
                      name='role'
                      type='radio'
                      value='User'
                      id='kt_modal_update_role_option_1'
                      checked={formik.values.role === 'User'}
                      disabled={formik.isSubmitting || isUserLoading}
                    />
                    {/* end::Input */}
                    {/* begin::Label */}
                    <label className='form-check-label' htmlFor='kt_modal_update_role_option_1'>
                      <div className='fw-bolder text-gray-800'>User</div>
                      <div className='text-gray-600'>Best for Users</div>
                    </label>
                    {/* end::Label */}
                  </div>
                  {/* end::Radio */}
                </div>
                {/* end::Input row */}
                {/* end::Roles */}
              </div>
              {/* end::Input group */}
            </>
          )}
        </div>
        {/* end::Scroll */}

        {/* begin::Actions */}
        <div className='text-center pt-15'>
          <button
            type='reset'
            onClick={() => cancel()}
            className='btn btn-light me-3'
            data-kt-users-modal-action='cancel'
            disabled={formik.isSubmitting || isUserLoading}
          >
            Discard
          </button>

          <button
            type='submit'
            className='btn btn-primary'
            data-kt-users-modal-action='submit'
            disabled={isUserLoading || formik.isSubmitting || !formik.isValid || !formik.touched}
          >
            <span className='indicator-label'>Submit</span>
            {(formik.isSubmitting || isUserLoading) && (
              <span className='indicator-progress'>
                Please wait...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
        </div>
        {/* end::Actions */}
      </form>
      {(formik.isSubmitting || isUserLoading) && <UsersListLoading />}
    </>
  )
}

export {UserEditModalForm}
