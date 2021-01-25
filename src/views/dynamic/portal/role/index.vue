<template>
  <div class="app-container">
    <div class="header">
      <el-row class="filter">
        <el-col :span="8">
          <el-input v-model="params.rolename" placeholder="请输入角色名" style="width: 200px;" class="filter-item"
                    @keyup.enter.native="loadData"
          />
          <el-button type="primary" size="small" icon="el-icon-search" style="margin: 5px;" @click="loadData">
            搜索
          </el-button>
        </el-col>
      </el-row>
      <el-row class="operation">
        <el-col :span="4">
          <el-button-group>
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="add" />
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteBatch" />
          </el-button-group>
        </el-col>
      </el-row>
    </div>
    <el-table v-loading="loading_query" :data="bizdatas" style="width: 100%"
              @selection-change="selectRows"
    >
      <el-table-column type="selection" align="center" />
      <el-table-column type="index" width="200" label="序号" align="center" />
      <el-table-column label="角色编号">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="view(scope.row)">{{ scope.row.roleno }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" prop="rolename" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="info" size="mini" @click="auth(scope.row)">
            授权
          </el-button>
          <el-button type="primary" size="mini" @click="edit(scope.row)">
            编辑
          </el-button>
          <el-button v-if="scope.row.status!='deleted'" type="danger" size="mini" @click="del(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="loadData" />

    <el-dialog :title="textMap[dialogFormStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" v-loading="loading_save" :rules="rules" :model="bizdata" label-position="left"
               label-width="100px"
               element-loading-text="正在保存"
      >
        <el-form-item label="角色编号" prop="roleno">
          <el-input v-model="bizdata.roleno" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="角色名称" prop="rolename">
          <el-input v-model="bizdata.rolename" style="width: 500px;" />
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

    <el-dialog :title="'角色配置 - ' + viewbizdata.rolename" :visible.sync="dialogViewVisible" center>
      <role-view :bizdata="viewbizdata" />
    </el-dialog>

    <el-dialog :title="'功能授权 - ' + authbizdata.rolename" :visible.sync="dialogAuthVisible" width="30%" center>
      <role-auth :bizdata="authbizdata" />
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import RoleView from './components/view'
  import RoleAuth from './components/auth'

  export default {
    components: { Pagination, RoleView, RoleAuth },
    data() {
      return {
        bizdatas: [],
        selectedRows: [],
        total: 0,
        loading_query: false,
        loading_save: false,
        params: {
          page: 1,
          limit: 10,
          rolename: ''
        },
        dialogFormVisible: false,
        dialogViewVisible: false,
        dialogAuthVisible: false,
        dialogFormStatus: '',
        textMap: {
          add: '新增',
          edit: '编辑'
        },
        bizdata: {},
        rules: {
          roleno: [{ required: true, message: '角色编号必填', trigger: 'blur' }],
          rolename: [{ required: true, message: '角色名称必填', trigger: 'blur' }]
        },
        viewbizdata: {},
        authbizdata: {}
      }
    },
    created() {
      this.loadData()
    },
    methods: {
      filter() {
        this.params.page = 1
        this.loadData()
      },
      loadData() {
        this.loading_query = true
        this.$http({
          url: '/role/queryList',
          method: 'post',
          data: this.params
        }).then(res => {
          this.loading_query = false
          this.bizdatas = res.bizdatas
          this.total = res.total || 0;
        })
      },
      selectRows(rows) {
        this.selectedRows = rows
      },
      add() {
        this.bizdata = {}
        this.dialogFormStatus = 'add'
        this.dialogFormVisible = true
      },
      edit(row) {
        this.bizdata = row
        this.dialogFormStatus = 'edit'
        this.dialogFormVisible = true
      },
      save() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading_save = true
            this.$http({
              url: '/role/save',
              method: 'post',
              data: this.bizdata
            }).then(res => {
              this.loading_save = false
              this.dialogFormVisible = false
              this.params.page = 1
              this.loadData()
            }).catch(err => {
              this.loading_save = false
            })
          }
        })
      },
      del(row) {
        this.$confirm('确定删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: '/role/del?ids=' + row.id,
            method: 'post'
          }).then(res => {
            this.loadData()
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
            url: '/role/del?ids=' + ids,
            method: 'post'
          }).then(res => {
            this.loadData()
          })
        })
      },
      view(row) {
        this.viewbizdata = row
        this.dialogViewVisible = true
      },
      auth(row) {
        this.authbizdata = row
        this.dialogAuthVisible = true
      }
    }
  }
</script>
