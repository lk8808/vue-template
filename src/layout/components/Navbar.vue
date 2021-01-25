<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">

      <div class="space" />

      <svg-icon :icon-class="isFullscreen?'exit-fullscreen':'fullscreen'" class="right-menu-item" @click="toggleScreen" />

      <el-dropdown class="userinfo-container right-menu-item" trigger="click">
        <div class="userinfo-wrapper">
          <i class="el-icon-s-custom"> {{ empname }} </i>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item>
            <span style="display:block;" @click="dialogTheme=true">切换主题</span>
          </el-dropdown-item>
          <el-dropdown-item>
            <span style="display:block;" @click="dialogPasswd=true">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <el-dialog title="主题" :visible.sync="dialogTheme" width="30%">
      <el-radio-group v-model="selectedTheme" @change="themeChange">
        <el-radio v-for="theme in themes" :key="theme.label" :label="theme.label">{{ theme.name }}</el-radio>
      </el-radio-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogTheme = false">取 消</el-button>
        <el-button type="primary" @click="modifyTheme">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改密码" :visible.sync="dialogPasswd" width="20%">
      <el-form ref="pwdForm" auto-complete="on" :rules="rules" :model="bizdata" element-loading-text="正在保存">
        <el-form-item prop="oldpasswd">
          <el-input v-model="bizdata.oldpasswd" placeholder="请输入原始密码" show-password>
            <template slot="prepend">旧密码</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="newpasswd1">
          <el-input v-model="bizdata.newpasswd1" placeholder="请输入新密码" show-password>
            <template slot="prepend">新密码</template>
          </el-input>
        </el-form-item>
        <el-form-item prop="newpasswd2">
          <el-input v-model="bizdata.newpasswd2" placeholder="请再次输入新密码" show-password @keyup.enter.native="modifyPasswd">
            <template slot="prepend">确认密码</template>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPasswd = false">取 消</el-button>
        <el-button type="primary" @click="modifyPasswd">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import md5 from 'js-md5'
  import '@/assets/theme_main/index.css'
  import '@/assets/theme_dark/index.css'
  import { mapState } from 'vuex'
  import { removeToken } from '@/http/auth.js'
  import Breadcrumb from '@/components/Breadcrumb'
  import Hamburger from '@/components/Hamburger'
  import screenfull from 'screenfull'

  export default {
    components: { Breadcrumb, Hamburger },
    data() {
      return {
        isFullscreen: false,
        dialogTheme: false,
        selectedTheme: '',
        themes: [
          { label: 'theme_main', name: '默认主题' },
          { label: 'theme_dark', name: '黑夜主题' }
        ],
        dialogPasswd: false,
        bizdata: {
          oldpasswd: '',
          newpasswd1: '',
          newpasswd2: ''
        },
        rules: {
          oldpasswd: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
          newpasswd1: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
          newpasswd2: [{ required: true, message: '请输入确认密码', trigger: 'blur' }]
        }
      }
    },
    mounted() {
      screenfull.on('change', this.change)
      this.selectedTheme = localStorage.getItem('theme') || 'theme_main'
      document.body.className = this.selectedTheme
    },
    computed: {
      ...mapState('app', ['sidebar']),
      empname() {
        return sessionStorage.getItem('empname') || '';
      }
    },
    methods: {
      toggleSideBar() {
        this.$store.dispatch('app/toggleSideBar')
      },
      toggleScreen() {
        screenfull.toggle()
      },
      change() {
        this.isFullscreen = screenfull.isFullscreen
      },
      themeChange(theme) {
        document.body.className = theme
      },
      modifyTheme() {
        this.$http({
          url: '/user/modifyTheme?theme=' + this.selectedTheme,
          method: 'post'
        }).then(res => {
        })
        localStorage.setItem('theme', this.selectedTheme)
        this.dialogTheme = false
      },
      modifyPasswd() {
        this.$refs['pwdForm'].validate((valid) => {
          if (valid) {
            var oldpasswd = this.bizdata.oldpasswd
            var newpasswd1 = this.bizdata.newpasswd1
            var newpasswd2 = this.bizdata.newpasswd2
            if(oldpasswd === newpasswd1) {
              this.$message.error('新密码不能和旧密码一样');
              return
            }
            if(newpasswd1 !== newpasswd2) {
              this.$message.error('新密码和确认密码不一致');
              return
            }
            var op = md5(oldpasswd)
            var np = md5(newpasswd1)
            this.$http({
              url: '/user/modifyPwd?op=' + op + '&np=' + np,
              method: 'get',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(res => {
              alert('修改成功，请重新登录')
              this.logout()
            })
          }
        })
      },
      logout() {
        this.$http({
          url: '/login/logout',
          method: 'post'
        }).then(res => {
          removeToken()
          this.$router.push('login')
        })
      },
      destroy() {
        if (screenfull.enabled) {
          screenfull.off('change', this.change)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    display: flex;
    height: 100%;
    align-items: center;

    .space {
      flex: 1;
    }

    &:focus {
      outline: none;
    }

    .svg-icon {
      width: 30px;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      font-size: 16px;
      color: #5a5e66;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .userinfo-container {
      margin-right: 30px;
      .userinfo-wrapper {
        display: flex;
        height: 100%;
        align-items: center;
        i {
          cursor: pointer;
        }
      }
    }
  }
}

</style>
