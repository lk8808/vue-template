<template>
  <div class="app-container-flex">
    <div class="left">
      <el-menu default-active="0" @select="appSelect">
        <el-menu-item v-for="(app, index) in apps" :key="app.code" :index="index.toString()">
          <i class="el-icon-menu" style="margin-right: 10px;" />
          <span>{{ app.appname }}</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right">
      <div class="header">
        <el-row class="operation">
          <el-col :span="4">
            <el-button-group>
              <el-button type="primary" size="mini" icon="el-icon-plus" @click="add" />
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteBatch" />
              <el-button type="success" size="mini" icon="el-icon-refresh" @click="loadApp" />
            </el-button-group>
          </el-col>
        </el-row>
      </div>
      <el-table v-loading="loading_query" :data="menus" row-key="id" @selection-change="selectRows">
        <el-table-column prop="id" type="selection" width="60" align="center" />
        <el-table-column prop="bizdata.menuno" label="编号" />
        <el-table-column prop="bizdata.menuname" label="菜单名称" />
        <el-table-column prop="bizdata.menuurl" label="url" />
        <el-table-column prop="bizdata.sortno" width="100" label="序号" align="center" />
        <el-table-column label="操作" align="center">
          <template slot-scope="{row, index}">
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="addSubmenu(row, index)">新增</el-button>
            <el-button type="success" size="mini" icon="el-icon-edit" @click="edit(row, index)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="del(row, index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" v-loading="loading_save" :rules="rules" :model="bizdata" label-position="left"
               label-width="150px"
               element-loading-text="正在保存"
      >
        <el-form-item label="上级菜单" prop="parentid">
          <el-cascader v-model="bizdata.parentid" :options="options" clearable :props="{ value: 'id', label: 'name', checkStrictly: true }"
                       style="width: 500px;" @change="parentChange"
          />
        </el-form-item>
        <el-form-item label="菜单编号" prop="menuno">
          <el-input v-model="bizdata.menuno" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuname">
          <el-input v-model="bizdata.menuname" style="width: 500px;" />
        </el-form-item>
        <el-form-item label="菜单url" prop="menuurl">
          <el-input v-model="bizdata.menuurl" style="width: 500px;" />
        </el-form-item>
        <el-form-item label="序号" prop="sortno">
          <el-input v-model="bizdata.sortno" style="width: 200px;" oninput="value=value.replace(/[^\d]/g,'')" />
        </el-form-item>
        <el-form-item>
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="save">
            保存
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>

  export default {
    data() {
      return {
        loading_query: false,
        loading_save: false,
        apps: [],
        selectedRows: [],
        options: [],
        appIndex: -1,
        menus: [],
        bizdata: {},
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          add: '新增',
          edit: '编辑'
        },
        rules: {
          menuno: [{ required: true, message: '菜单编号必填', trigger: 'blur' }],
          menuname: [{ required: true, message: '菜单名称必填', trigger: 'blur' }],
          menuurl: [{ required: true, message: '菜单url必填', trigger: 'blur' }]
        }
      }
    },
    created() {
      this.loadApp()
      this.loadAppMenuTree()
    },
    methods: {
      loadAppMenuTree() {
        this.$http({
          url: '/menu/getAppMenuTree',
          method: 'post'
        }).then(res => {
          this.options = res
        })
      },
      loadApp() {
        this.$http({
          url: '/application/queryAllList',
          method: 'post'
        }).then(res => {
          this.apps = res
          if (this.apps && this.apps.length > 0) {
            if (this.appIndex > 0) {
              this.loadMenus(this.apps[this.appIndex].id)
            } else {
              this.appIndex = 0
              this.loadMenus(this.apps[this.appIndex].id)
            }
          }
        })
      },
      loadMenus(appid) {
        this.loading_query = true
        this.$http({
          url: '/menu/getMenuTreeByAppid?appid=' + appid,
          method: 'post'
        }).then(res => {
          this.loading_query = false
          this.menus = res
        })
      },
      appSelect(index) {
        if (index === this.appIndex) {
          return
        }
        var appid = this.apps[index].id
        this.appIndex = index
        this.loadMenus(appid)
      },
      selectRows(rows) {
        this.selectedRows = rows
      },
      parentChange(arr){
        if (arr.length > 1) {
          this.bizdata.parentid = arr[arr.length - 1]
        } else {
          this.bizdata.parentid = undefined
        }
      },
      add() {
        this.bizdata = {}
        this.dialogStatus = 'add'
        this.dialogFormVisible = true
      },
      addSubmenu(row, index) {
        this.bizdata = {parentid: row.id}
        this.dialogStatus = 'add'
        this.dialogFormVisible = true
      },
      edit(row, index) {
        this.bizdata = row.bizdata
        this.dialogStatus = 'edit'
        this.dialogFormVisible = true
      },
      save() {
        this.bizdata.appid = this.apps[this.appIndex].id
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading_save = true
            this.$http({
              url: '/menu/save',
              method: 'post',
              data: this.bizdata
            }).then(res => {
              this.loadMenus(this.apps[this.appIndex].id)
              this.loading_save = false
              this.dialogFormVisible = false
              this.params.page = 1
            }).catch(err => {
              this.loading_save = false
            })
          }
        })
      },
      del(row, index) {
        this.$confirm('确定删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: '/menu/del?ids=' + row.id,
            method: 'post'
          }).then(res => {
            this.loadMenus(this.apps[this.appIndex].id)
          })
        })
      },
      deleteBatch() {
        if (this.selectedRows.length === 0) {
          this.$message({
            type: 'warning',
            message: '请选择要删除的数据'
          });
          return
        }
        this.$confirm('确定删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          var ids = this.selectedRows.map( (obj) => {
            return obj.id
          }).join(',')
          this.$http({
            url: '/menu/del?ids=' + ids,
            method: 'post'
          }).then(res => {
            this.loadMenus(this.apps[this.appIndex].id)
          })
        })
      }
    }
  }
</script>

<style lang="scss">

  .el-menu {
    border: 0;
  }

  .list-group {
    font-size: 1rem;
    line-height: 1.5;
  }
  .list-group-item {
    position: relative;
    display: block;
    padding: .75rem;
    background-color: #fff;
    cursor: pointer;
  }
  .list-group-item:hover {
    color: #409EFF;
  }

</style>
