import axios from 'axios'
import { BACKEND_URL } from '@/constants'

const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/`,
  headers: {
    Accept: 'application/json',
  },
})

export default apiClient
