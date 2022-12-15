import React, {useState} from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useFormik} from 'formik'
import {resetPassword} from '../core/_requests'
import {useLocation} from 'react-router-dom'

const initialValues = {
  password: '',
  password_confirmation: '',
  otpCode: '',
}

const resetPasswordSchema = Yup.object().shape({
  otpCode: Yup.string().required('OTP is required').length(6, 'OTP must be 6 symbols'),
  password: Yup.string()
    .min(6, 'Minimum 6 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .min(6, 'Minimum 6 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password Confirmation is required'),
})

export function ResetPassword() {
  const location = useLocation()
  const {state} = location
  const [loading, setLoading] = useState(false)
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined)
  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      setHasErrors(undefined)
      setTimeout(() => {
        resetPassword((state as any).email as string, values.otpCode, values.password)
          .then(() => {
            setHasErrors(false)
            setLoading(false)
          })
          .catch(() => {
            setHasErrors(true)
            setLoading(false)
            setSubmitting(false)
            setStatus('The login detail is incorrect')
          })
      }, 1000)
    },
  })

  return (
    <>
      <form
        className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
        noValidate
        id='kt_login_password_reset_form'
        onSubmit={formik.handleSubmit}
      >
        <div className='text-center mb-10'>
          {/* begin::Title */}
          <h1 className='text-dark mb-3'>Forgot Password ?</h1>
          {/* end::Title */}

          {/* begin::Link */}
          <div className='text-gray-400 fw-bold fs-4'>
            Enter your verification code to reset your password.
          </div>
          {/* end::Link */}
        </div>

        {/* begin::Title */}
        {hasErrors === true && (
          <div className='mb-lg-15 alert alert-danger'>
            <div className='alert-text font-weight-bold'>
              Sorry, looks like there are some errors detected, please try again.
            </div>
          </div>
        )}

        {hasErrors === false && (
          <div className='mb-lg-15 alert alert-success'>
            <div className='alert-text font-weight-bold'>Successfully password reset</div>
          </div>
        )}
        {/* end::Title */}
        {/* begin::Input group */}
        <div className='fv-row mb-7'>
          {/* begin::Label */}
          <label className='required fw-bold fs-6 mb-2'>Verification Code </label>
          {/* end::Label */}

          {/* begin::Input */}
          <input
            placeholder='Verification Code'
            {...formik.getFieldProps('otpCode')}
            type='text'
            name='otpCode'
            className={clsx(
              'form-control form-control-solid mb-3 mb-lg-0',
              {
                'is-invalid': formik.touched.otpCode && formik.errors.otpCode,
              },
              {
                'is-valid': formik.touched.otpCode && !formik.errors.otpCode,
              }
            )}
            autoComplete='off'
            disabled={formik.isSubmitting}
          />
          {formik.touched.otpCode && formik.errors.otpCode && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.otpCode}</span>
              </div>
            </div>
          )}
          {/* end::Input */}
        </div>
        {/* end::Input group */}
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
            disabled={formik.isSubmitting}
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
                  formik.touched.password_confirmation && !formik.errors.password_confirmation,
              }
            )}
            autoComplete='off'
            disabled={formik.isSubmitting}
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
        {/* begin::Form group */}
        <div className='d-flex flex-wrap justify-content-center pb-lg-0'>
          <button
            type='submit'
            id='kt_password_reset_submit'
            className='btn btn-lg btn-primary fw-bolder me-4'
          >
            <span className='indicator-label'>Submit</span>
            {loading && (
              <span className='indicator-progress'>
                Please wait...
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
          <Link to='/auth/login'>
            <button
              type='button'
              id='kt_login_password_reset_form_cancel_button'
              className='btn btn-lg btn-light-primary fw-bolder'
              disabled={formik.isSubmitting || !formik.isValid}
            >
              Cancel
            </button>
          </Link>{' '}
        </div>
        {/* end::Form group */}
      </form>
    </>
  )
}
