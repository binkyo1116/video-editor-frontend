// @ts-nocheck
import {Column} from 'react-table'
import {UserInfoCell} from './UserInfoCell'
import {UserLastLoginCell} from './UserLastLoginCell'
import {UserTwoStepsCell} from './UserTwoStepsCell'
import {UserActionsCell} from './UserActionsCell'
import {UserSelectionCell} from './UserSelectionCell'
import {UserCustomHeader} from './UserCustomHeader'
import {UserSelectionHeader} from './UserSelectionHeader'
import {User} from '../../core/_models'

const usersColumns: ReadonlyArray<Column<User>> = [
  {
    Header: (props) => <UserSelectionHeader tableProps={props} />,
    id: 'selection',
    Cell: ({...props}) => <UserSelectionCell id={props.data[props.row.index]._id} />,
  },
  {
    Header: (props) => <UserCustomHeader tableProps={props} title='Name' className='min-w-125px' />,
    id: 'name',
    Cell: ({...props}) => <UserInfoCell user={props.data[props.row.index]} />,
  },
  {
    Header: (props) => <UserCustomHeader tableProps={props} title='Role' className='min-w-125px' />,
    accessor: 'isAdmin',
    Cell: ({...props}) => (
      <div>{props.data[props.row.index].isAdmin ? 'Administrator' : 'User'}</div>
    ),
  },
  {
    Header: (props) => <UserCustomHeader tableProps={props} title='Active' className='min-w-125px' />,
    accessor: 'isActive',
    Cell: ({...props}) => (
      <div>{props.data[props.row.index].isActive ? 'Active' : 'Inactive'}</div>
    ),
  },
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title='Last login' className='min-w-125px' />
    ),
    id: 'lastLogin',
    Cell: ({...props}) => {
      const delta = Date.now() - +new Date(props.data[props.row.index].lastLogin)

      if (delta < 60000) {
        return <UserLastLoginCell last_login={`${parseInt(delta / 1000)} seconds ago`} />
      } else if (delta >= 60000 && delta <= 3600000) {
        return <UserLastLoginCell last_login={`${parseInt(delta / 60000)} minutes ago`} />
      } else if (delta >= 3600000 && delta < 86400000) {
        return <UserLastLoginCell last_login={`${parseInt(delta / 3600000)} hours ago`} />
      } else if (delta >= 86400000 && delta < 604800000) {
        return <UserLastLoginCell last_login={`${parseInt(delta / 86400000)} days ago`} />
      } else if (delta >= 604800000 && delta < 2592000000) {
        return <UserLastLoginCell last_login={`${parseInt(delta / 604800000)} weeks ago`} />
      } else if (delta >= 2592000000 && delta < 31104000000) {
        return <UserLastLoginCell last_login={`${parseInt(delta / 2592000000)} months ago`} />
      } else {
        return <UserLastLoginCell last_login={`${parseInt(delta / 31104000000)} years ago`} />
      }
    },
  },
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title='Joined day' className='min-w-125px' />
    ),
    accessor: 'createdAt',
    Cell: ({...props}) => {
      const createdAt = new Date(props.data[props.row.index].createdAt)
      return <div>{`${createdAt.toDateString()}, ${createdAt.toLocaleTimeString()}`}</div>
    },
  },
  {
    Header: (props) => (
      <UserCustomHeader tableProps={props} title='Actions' className='text-end min-w-100px' />
    ),
    id: 'actions',
    Cell: ({...props}) => <UserActionsCell id={props.data[props.row.index]._id} />,
  },
]

export {usersColumns}
