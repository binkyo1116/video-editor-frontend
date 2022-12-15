import {FC} from 'react'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import {useLocation} from 'react-router'
import {checkIsActive, KTSVG, WithChildren} from '../../../helpers'
import {useLayout} from '../../core'

type Props = {
  to: string
  title: string
  icon?: string
  fontIcon?: string
  hasBullet?: boolean
  search?: string
}

const AsideMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  search,
  title,
  icon,
  fontIcon,
  hasBullet = false,
}) => {
  const location = useLocation()
  const isActive = checkIsActive(
    location.pathname + location.search,
    to + (search === undefined ? '' : `?type=${search}`)
  )
  const {config} = useLayout()
  const {aside} = config

  return (
    <div className='menu-item'>
      <Link
        className={clsx('menu-link without-sub', {active: isActive})}
        to={{pathname: to, search: search === undefined ? '' : `?type=${search}`}}
      >
        {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )}
        {icon && aside.menuIcon === 'svg' && (
          <span className='menu-icon'>
            <KTSVG path={icon} className='svg-icon-2' />
          </span>
        )}
        {fontIcon && aside.menuIcon === 'font' && <i className={clsx('bi fs-3', fontIcon)}></i>}
        <span className='menu-title'>{title}</span>
      </Link>
      {children}
    </div>
  )
}

export {AsideMenuItem}
