import MediaManager from './mediaManager'
import {useEffect, useState} from 'react'
import {Project} from './types'

export default function ProjectManager() {
  const [projectWidth, setProjectWidth] = useState<number>(0)
  const [projectHeight, setProjectHeight] = useState<number>(0)
  const [projectFramerate, setProjectFramerate] = useState<number>(30)
  const [projectDuration, setProjectDuration] = useState<number>(0)

  return (
    <MediaManager
      projectHeight={projectHeight}
      setProjectHeight={setProjectHeight}
      projectWidth={projectWidth}
      setProjectWidth={setProjectWidth}
      projectFramerate={projectFramerate}
      setProjectFramerate={setProjectFramerate}
      projectDuration={projectDuration}
      setProjectDuration={setProjectDuration}
    />
  )
}
