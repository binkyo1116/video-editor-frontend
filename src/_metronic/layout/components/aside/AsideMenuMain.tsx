import {AsideMenuItem} from './AsideMenuItem'

import {useAppSelector} from '../../../../app/hooks'
import {selectProject} from '../../../../features/editor/projectSlice'

export function AsideMenuMain() {
  const project = useAppSelector(selectProject)

  return (
    <>
      <AsideMenuItem
        to={`/apps/video-editor/${project._id}/editor`}
        icon='/media/svg/icon/layer.svg'
        title='Layer'
        fontIcon='bi-app-indicator'
        search='layer'
      />
      <AsideMenuItem
        to={`/apps/video-editor/${project._id}/editor`}
        icon='/media/svg/icon/text.svg'
        title='Text'
        search='text'
        fontIcon='bi-layers'
      />
      <AsideMenuItem
        to={`/apps/video-editor/${project._id}/editor`}
        icon='/media/svg/icon/video.svg'
        title='Video'
        search='video'
        fontIcon='bi-layers'
      />
      <AsideMenuItem
        to={`/apps/video-editor/${project._id}/editor`}
        icon='/media/svg/icon/image.svg'
        title='Image'
        search='image'
        fontIcon='bi-layers'
      />
      <AsideMenuItem
        to={`/apps/video-editor/${project._id}/editor`}
        icon='/media/svg/icon/audio.svg'
        title='Audio'
        search='audio'
        fontIcon='bi-layers'
      />
    </>
  )
}
