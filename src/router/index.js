import Vue from 'vue'
import VueRouter from 'vue-router'
import { getToken } from '@/http/auth.js'
import http from '@/http/http.js'
import store from '@/store'

Vue.use(VueRouter)

/* Layout */
import Layout from '@/layout'

// 定义路由跳转规则
// component 采用 路由懒加载形式
// 此项目中，均采用 name 方式指定路由进行跳转
/*
    meta 用于定义路由元信息，
其中
    isRouter 用于指示是否开启路由守卫（true 表示开启）。
    isTab 用于表示是否显示为标签页（true 表示显示）
    iframeUrl 用于表示 url，使用 http 或者 https 开头的 url 使用 iframe 标签展示
*/
export const constantRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '主页', icon: 'app', affix: true }
    }]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    hidden: true
  }
]

var asyncRoutes = []

const router = new VueRouter({
  routes: constantRoutes,
  mode: 'history',
  base: '/mita/',
  // scrollBehavior 用于定义路由切换时，页面滚动。
  scrollBehavior: () => ({ y: 0 }),
  // isAddDynamicMenuRoutes 表示是否已经添加过动态菜单（防止频繁请求动态菜单）
  isAddDynamicMenuRoutes: false
})

//  白名单路由
const whiteList = ['/login']
//  路由拦截器
router.beforeEach(async(to, from, next) => {
  // 设置浏览器显示标题
  // document.title = getPageTitle(to.meta.title)
  const token = getToken()
  // 不存在token
  if (!token) {
    // 不在白名单
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
    return
  }
  // 判断是否已经获取过 动态菜单，未获取，即 false 时，需要获取
  if (!router.options.isAddDynamicMenuRoutes) {
    http({
      url: '/menu/getAuthAppMenuTree',
      method: 'post',
      data: {}
    }).then(res => {
      router.options.isAddDynamicMenuRoutes = true
      asyncRoutes = initRoutes(res)
      asyncRoutes.push( {path: '*', redirect: { name: '404' }} )
      store.dispatch('permission/generateRoutes')
      router.addRoutes(asyncRoutes)
      //  使用 vuex 管理动态路由数据
      router.app.$options.store.dispatch('common/updateDynamicRoutes', asyncRoutes)
    })
  }
  if (to.path === '/login') {
    next({ path: '/' })
  } else {
    next()
  }
})

// 用于处理动态菜单数据，将其转为 route 形式
function initRoutes(menuList = [], routes = []) {
	// 用于保存普通路由数据
	const temp = []
	// 用于保存存在子路由的路由数据
	let route = []
	// 遍历数据
	for (let i = 0; i < menuList.length; i++) {
    if (!menuList[i].url) {
      continue
    }
		// 存在子路由，则递归遍历，并返回数据作为 children 保存
		if (menuList[i].children && menuList[i].children.length > 0) {
			// 获取路由的基本格式
			route = getRoute(menuList[i])
			// 递归处理子路由数据，并返回，将其作为路由的 children 保存
			route.children = initRoutes(menuList[i].children)
			// 保存存在子路由的路由
			routes.push(route)
		} else {
			// 保存普通路由
			temp.push(getRoute(menuList[i]))
		}
	}
	// 返回路由结果

	return routes.concat(temp)
}

// 返回路由的基本格式
function getRoute(item) {
  const route = {
    name: item.code,
    component: null,
    meta: {
      title: item.name,
      sortno: item.sortno
    },
    children: []
  }
  if (item.type === 'APP') {
    route.path = item.url
    route.component = Layout
    route.redirect = 'noRedirect'
    route.meta.icon = item.icon
  } else {
    if (item.url) {
      route.component = (resolve) => require([`@/views/dynamic/${item.url}`], resolve) || null
    } else {
      route.redirect = 'noRedirect'
    }
    route.path = item.url.substr(item.url.lastIndexOf('/') + 1)
  }
	// 返回 route
	return route
}

export default router
