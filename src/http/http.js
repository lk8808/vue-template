import axios from 'axios'
import { Message } from 'element-ui'
import { getToken, removeToken } from '@/http/auth.js'
import router from '@/router'

// 创建 axios 实例
const instance = axios.create({
  // 统一 url 配置，定义访问前缀 baseURL
  baseURL: process.env.VUE_APP_BASE_API,
  // 定义请求超时时间
  timeout: 10000,
  // 请求带上 cookie
  withCredentials: true,
  // 定义消息头
  headers: {
      'Content-Type': 'application/json; charset=utf-8'
  }
})

// 定义请求拦截器
instance.interceptors.request.use(
  config => {
    config.headers['Token'] = getToken()
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 定义响应拦截器
instance.interceptors.response.use(
  response => {
    const rtsts = response.data.rtsts
    if (rtsts.code === '000000') {
      return response.data.rtdata;
    } else if (rtsts.code === '100003') { //  token失效
      removeToken()
      router.push({path: '/'})
      return Promise.reject(new Error(rtsts.msg || 'Error'))
    } else {
      Message({
        message: rtsts.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(rtsts.msg || 'Error'))
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default instance
