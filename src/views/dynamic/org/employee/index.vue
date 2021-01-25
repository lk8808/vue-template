<template>
  <div class="app-container-flex">
    <div class="left">
      <el-tree :data="deps" @node-click="depClick">
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <i class="fa fa-male" />&nbsp;&nbsp;
          <span>【{{ data.depno }}】{{ data.depname }}</span>
        </span>
      </el-tree>
    </div>
    <div class="right">
      <div class="header">
        <el-row class="filter">
          <el-col :span="8">
            <el-input v-model="params.empname" placeholder="请输入员工名" style="width: 200px;" class="filter-item"
                      @keyup.enter.native="filter"
            />
            <el-button type="primary" size="small" icon="el-icon-search" style="margin: 5px;" @click="loadEmps">
              搜索
            </el-button>
          </el-col>
        </el-row>
        <el-row class="operation">
          <el-col :span="4">
            <el-button-group>
              <el-button type="primary" size="mini" icon="el-icon-plus" @click="add" />
              <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteBatch" />
              <el-button type="success" size="mini" icon="el-icon-refresh" @click="loadEmps" />
            </el-button-group>
          </el-col>
        </el-row>
      </div>
      <el-table v-loading="loading_query" :data="emps" row-key="id" @selection-change="selectRows">
        <el-table-column prop="id" type="selection" width="60" align="center" />
        <el-table-column prop="empno" label="员工编号" />
        <el-table-column prop="empname" label="员工姓名" />
        <el-table-column prop="depname" label="所属机构" />
        <el-table-column prop="sortno" width="100" label="序号" align="center" />
        <el-table-column label="操作" align="center">
          <template slot-scope="{row, index}">
            <el-button type="success" size="mini" icon="el-icon-edit" @click="edit(row, index)">编辑</el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="del(row, index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="loadEmps" />
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" v-loading="loading_save" :rules="rules" :model="bizdata" label-position="left"
               label-width="150px"
               element-loading-text="正在保存"
      >
        <el-form-item label="所属机构" prop="departmentid">
          <el-cascader v-model="bizdata.departmentid" :options="deps" clearable :props="{ value: 'id', label: 'depname', checkStrictly: true, emitPath: false }"
                       style="width: 500px;"
          />
        </el-form-item>
        <el-form-item label="员工编号" prop="empno">
          <el-input v-model="bizdata.empno" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="员工姓名" prop="empname">
          <el-input v-model="bizdata.empname" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="岗位" prop="posids">
          <el-select v-model="bizdata.posids" :loading="loading_pos" multiple
                     filterable allow-create placeholder="请选择岗位" style="width: 500px;" @focus="loadPositions"
          >
            <el-option v-for="item in positions" :key="item.positionid" :label="item.posname" :value="item.positionid">
              <span style="float: left">【{{ item.depname }}】{{ item.posname }}</span>
            </el-option>
          </el-select>
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
  import Pagination from '@/components/Pagination'

  export default {
    components: { Pagination },
    data() {
      var validateDep = (rule, value, callback) => {
        if (value > 0) {
          callback()
        } else {
          callback(new Error('请选择所属部门'))
        }
      }
      return {
        loading_query: false,
        loading_save: false,
        loading_pos: false,
        total: 0,
        params: {
          page: 1,
          limit: 10,
          empname: '',
          empno: '',
          depid: 0
        },
        deps: [],
        emps: [],
        selectedRows: [],
        positions: [],
        querydepid: 0,
        depIndex: -1,
        bizdata: {},
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          add: '新增',
          edit: '编辑'
        },
        rules: {
          departmentid: [{ validator: validateDep, trigger: 'blur' }],
          empno: [{ required: true, message: '员工编号必填', trigger: 'blur' }],
          empname: [{ required: true, message: '员工姓名必填', trigger: 'blur' }]
        }
      }
    },
    created() {
      this.loadDepTree()
      this.loadEmps()
    },
    methods: {
      loadDepTree() {
        this.$http({
          url: '/department/getDepTree',
          method: 'post'
        }).then(res => {
          this.deps = res
        })
      },
      loadEmps() {
        this.loading_query = true
        this.$http({
          url: '/employee/queryAllEmpsByDepid',
          method: 'post',
          data: this.params
        }).then(res => {
          this.loading_query = false
          this.emps = res.bizdatas
          this.total = res.total || 0;
        })
      },
      loadPositions() {
        if (this.positions.length > 0 && this.querydepid === this.bizdata.departmentid) {
          return
        }
        this.querydepid = this.bizdata.departmentid
        this.loading_pos = true
        this.$http({
          url: '/depposlnk/queryByDepid?depid=' + this.querydepid,
          method: 'post'
        }).then(res => {
          this.loading_pos = false
          this.positions = res
        })
      },
      depClick(node) {
        if (this.params.depid !== node.id) {
          this.params.depid = node.id
          this.loadEmps()
        }
      },
      selectRows(rows) {
        this.selectedRows = rows
      },
      add() {
        this.bizdata = {departmentid: this.params.depid}
        this.dialogStatus = 'add'
        this.dialogFormVisible = true
      },
      edit(row, index) {
        this.bizdata = row
        this.dialogStatus = 'edit'
        this.dialogFormVisible = true
        this.loadPositions()
      },
      save() {
        var that = this
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            that.loading_save = true
            that.$http({
              url: '/employee/save',
              method: 'post',
              data: that.bizdata
            }).then(res => {
              that.loading_save = false
              that.dialogFormVisible = false
              that.params.page = 1
              that.loadEmps()
            }).catch(err => {
              that.loading_save = false
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
            url: '/employee/del?ids=' + row.id,
            method: 'post'
          }).then(res => {
            this.loadEmps()
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
            url: '/employee/del?ids=' + ids,
            method: 'post'
          }).then(res => {
            console.log(res)
            this.loadEmps()
          })
        })
      }
    }
  }
</script>
