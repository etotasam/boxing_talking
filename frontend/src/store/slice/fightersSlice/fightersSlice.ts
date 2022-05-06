import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from "../../store"
import { useSelector } from "react-redux"
import { Axios, CancelToken } from "@/libs/axios"

import { FighterType } from "@/libs/hooks/fetchers";

type InitialStateType = {
  fighters: FighterType[] | undefined
  pending: boolean,
  error: boolean
}

const initialState: InitialStateType = {
  fighters: undefined,
  pending: false,
  error: false
}

let axiosSource: any
export const fetchFighters = createAsyncThunk(
  'fetchFighter',
  async () => {
    axiosSource = CancelToken.source()
    const { data }: { data: FighterType[] } = await Axios.get("api/fighter", {
      cancelToken: axiosSource.token
    })
    return data
  }
)

export const fetchFightersSlice = createSlice({
  name: 'fetch/fighters',
  initialState,
  reducers: {
    axiosCancel: () => {
      axiosSource.cancel()
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchFighters.pending, (state: InitialStateType) => {
      state.pending = true
      state.error = false
    })
    builder.addCase(fetchFighters.fulfilled, (state: InitialStateType, action: PayloadAction<FighterType[]>) => {
      state.fighters = action.payload
      state.pending = false
    })
    builder.addCase(fetchFighters.rejected, (state: InitialStateType) => {
      state.error = true
      state.pending = false
    })
  }
})

export const { axiosCancel } = fetchFightersSlice.actions

export const useFightersState = () => {
  return useSelector((state: RootState) => state.fighters)
}
export default fetchFightersSlice.reducer