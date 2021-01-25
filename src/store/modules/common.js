
const state = {
  // 表示侧边栏选中的菜单项的名
  menuActiveName: '',
  // 表示标签页数据，数组
  mainTabs: [],
  // 表示标签页中选中的标签名
  mainTabsActiveName: '',
  // 用于保存动态路由的数据
  dynamicRoutes: []
}

const mutations = {
  updateMenuActiveName(state, name) {
    state.menuActiveName = name
  },
  updateMainTabs(state, tabs) {
    state.mainTabs = tabs
  },
  updateMainTabsActiveName(state, name) {
    state.mainTabsActiveName = name
  },
  updateDynamicRoutes(state, routes) {
    state.dynamicRoutes = routes
  },
  resetState(state) {
    const stateTemp = {
      menuActiveName: '',
      mainTabs: [],
      mainTabsActiveName: '',
      dynamicRoutes: []
    }
    Object.assign(state, stateTemp)
  }
}

const actions = {
  updateLanguage({commit, state}, data) {
    commit('updateLanguage', data)
  },
  updateMenuActiveName({commit, state}, name) {
    commit('updateMenuActiveName', name)
  },
  updateMainTabs({commit, state}, tabs) {
    commit('updateMainTabs', tabs)
  },
  updateMainTabsActiveName({commit, state}, name) {
    commit('updateMainTabsActiveName', name)
  },
  updateDynamicRoutes({commit, state}, routes) {
    commit('updateDynamicRoutes', routes)
  },
  resetState({commit, state}) {
    commit('resetState')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
