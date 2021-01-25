<template>
  <div class="app-container">
    <div class="header">
      <el-row class="filter">
        <el-col :span="8">
          <el-input v-model="params.depname" placeholder="请输入机构名" style="width: 200px;" class="filter-item"
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
    <el-table v-loading="loading_query" :data="bizdatas" row-key="id" height="700" @selection-change="selectRows">
      <el-table-column prop="id" type="selection" width="60" align="center" />
      <el-table-column prop="bizdata.depno" label="编号" />
      <el-table-column prop="bizdata.depname" label="机构名称" />
      <el-table-column prop="bizdata.sortno" width="100" label="序号" align="center" />
      <el-table-column label="操作" align="center">
        <template slot-scope="{row, index}">
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="addSub(row, index)">新增</el-button>
          <el-button type="success" size="mini" icon="el-icon-edit" @click="edit(row, index)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="del(row, index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" v-loading="loading_save" :rules="rules" :model="bizdata" label-position="left"
               label-width="150px"
               element-loading-text="正在保存"
      >
        <el-form-item label="上级机构" prop="parentid">
          <el-cascader v-model="bizdata.parentid" :options="bizdatas" clearable :props="{ value: 'id', label: 'depname', checkStrictly: true, emitPath: false }"
                       style="width: 500px;" 
          />
        </el-form-item>
        <el-form-item label="机构编号" prop="depno">
          <el-input v-model="bizdata.depno" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="机构名称" prop="depname">
          <el-input v-model="bizdata.depname" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="岗位" prop="posids">
          <el-select v-model="bizdata.posids" multiple filterable allow-create placeholder="请选择岗位" style="width: 500px;">
            <el-option v-for="item in positions" :key="item.id" :label="item.posname" :value="item.id" />
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
  export default {
    data() {
      return {
        loading_query: false,
        loading_save: false,
        positions: [],
        bizdatas: [],
        selectedRows: [],
        bizdata: {},
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          add: '新增',
          edit: '编辑'
        },
        rules: {
          depno: [{ required: true, message: '机构编号必填', trigger: 'blur' }],
          depname: [{ required: true, message: '机构名称必填', trigger: 'blur' }]
        },
        params: {
          depname: ''
        }
      }
    },
    created() {
      this.loadData()
      this.loadPosition()
    },
    methods: {
      loadData() {
        this.loading_query = true
        this.$http({
          url: '/department/getDepTree',
          method: 'post'
        }).then(res => {
          this.loading_query = false
          this.bizdatas = res
        })
      },
      loadPosition() {
        this.$http({
          url: '/position/queryAllList',
          method: 'post'
        }).then(res => {
          this.positions = res
        })
      },
      selectRows(rows) {
        this.selectedRows = rows
      },
      add() {
        this.bizdata = {}
        this.dialogStatus = 'add'
        this.dialogFormVisible = true
      },
      addSub(row, index) {
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
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading_save = true
            this.$http({
              url: '/department/save',
              method: 'post',
              data: this.bizdata
            }).then(res => {
              this.loadData()
              this.loading_save = false
              this.dialogFormVisible = false
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
            url: '/department/del?ids=' + row.id,
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
            url: '/department/del?ids=' + ids,
            method: 'post'
          }).then(res => {
            this.loadData()
          })
        })
      }
    }
  }
</script>

<style>
</style>
