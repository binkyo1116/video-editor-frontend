/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
import Project from '../project'


const DashboardPage: FC = () => (
  <>
    <Project />
  </>
)

const DashboardWrapper: FC = () => {
  return (
    <>
      {/* <PageTitle breadcrumbs={[]}>{intl.formatMessage({id: 'MENU.DASHBOARD'})}</PageTitle> */}
      <DashboardPage />
    </>
  )
}

export {DashboardWrapper}
