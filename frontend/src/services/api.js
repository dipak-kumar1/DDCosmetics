import axios from 'axios'

const api = axios.create({
  baseURL: 'https://ddcosmetics.onrender.com/api',
})

export default api
