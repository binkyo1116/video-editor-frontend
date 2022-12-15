import {useEffect} from 'react'
import {Outlet} from 'react-router-dom'
import {AsideDefault} from './components/aside/AsideDefault'
import {Footer} from './components/Footer'
import {HeaderWrapper} from './components/header/HeaderWrapper'
import {Toolbar} from './components/toolbar/Toolbar'
import {RightToolbar} from '../partials/layout/RightToolbar'
import {ScrollTop} from './components/ScrollTop'
import {Content} from './components/Content'
import {PageDataProvider} from './core'
import {useLocation} from 'react-router-dom'
import {
  DrawerMessenger,
  ActivityDrawer,
  InviteUsers,
  UpgradePlan,
  ThemeModeProvider,
} from '../partials'
import {MenuComponent} from '../assets/ts/components'
import {useState} from 'react'

const MasterLayout = () => {
  const location = useLocation()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization()
    }, 500)
  }, [])

  useEffect(() => {
    if (location.pathname === '/apps/user-management/users' || location.pathname === '/dashboard')
      setHidden(true)
    else setHidden(false)
  }, [location.pathname])

  useEffect(() => {
    setTimeout(() => {
      MenuComponent.reinitialization()
    }, 500)
  }, [location.key])

  return (
    <PageDataProvider>
      <ThemeModeProvider>
        <div className='page d-flex flex-row flex-column-fluid'>
          <AsideDefault />
          <div
            className={`${hidden ? '' : ''} d-flex flex-column flex-row-fluid mt-20`}
            id='kt_wrapper'
          >
            <HeaderWrapper />

            <div id='kt_content' className='content d-flex flex-column flex-column-fluid'>
              {/* <Toolbar /> */}
              <div
                className='post d-flex flex-column-fluid'
                id=''
                style={
                  hidden
                    ? {padding: `0px ${window.innerWidth / 6}px`}
                    : {padding: `0px 0px 0px ${window.innerWidth / 7}px`}
                }
              >
                {/* <div> */}
                  <Content>
                    <Outlet />
                  </Content>
                {/* </div> */}
              </div>
            </div>
            {/* <Footer /> */}
          </div>
        </div>

        {/* begin:: Drawers */}
        <ActivityDrawer />
        <RightToolbar />
        <DrawerMessenger />
        {/* end:: Drawers */}

        {/* begin:: Modals */}
        <InviteUsers />
        <UpgradePlan />
        {/* end:: Modals */}
        <ScrollTop />
      </ThemeModeProvider>
    </PageDataProvider>
  )
}

export {MasterLayout}
