import {configureStore, ThunkAction, Action} from '@reduxjs/toolkit'
import projectSlice from './../features/editor/projectSlice'

export const store = configureStore({
  reducer: {
    project: projectSlice,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
