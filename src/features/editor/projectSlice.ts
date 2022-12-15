import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Project} from '../../app/pages/project/core/_models'
import {RootState} from '../../app/store'

interface ProjectState {
  project: Project
}

const initialState: ProjectState = {
  project: {
    name: '',
    authorId: '',
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
  },
}

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProject: (state, action: PayloadAction<Project>) => {
      state.project = action.payload
    },
  },
})

export const selectProject = (state: RootState) => state.project.project

export const {setProject} = projectSlice.actions

export default projectSlice.reducer
