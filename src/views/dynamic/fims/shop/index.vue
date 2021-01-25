<template>
  <div class="app-container">
    <div class="header">
      <el-row class="filter">
        <el-col :span="8">
          <el-input v-model="params.posname" placeholder="请输入商户名称" style="width: 200px;" class="filter-item"
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
          </el-button-group>
        </el-col>
      </el-row>
    </div>
    <el-table v-loading="loading_query" :data="bizdatas" style="width: 100%">
      <el-table-column type="index" width="50" />
      <el-table-column label="商户名称" prop="shname" />
      <el-table-column label="商户简称" prop="shortname" />
      <el-table-column label="负责人" prop="ownername" />
      <el-table-column label="负责人电话" prop="telephone" />
      <el-table-column label="负责人证件号" prop="owneridnum" />
      <el-table-column label="管理机构" prop="depname" />
      <el-table-column label="管理员工" prop="empname" />
      <el-table-column label="商户状态" prop="shopstsdesc" />
      <el-table-column label="操作">
        <template slot-scope="{row, $index}">
          <el-button type="primary" size="mini" @click="edit(row)">
            编辑
          </el-button>
          <el-button type="danger" size="mini" @click="del(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="params.page" :limit.sync="params.limit" @pagination="loadData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <shop-edit :bizdata="bizdata" @cancel="dialogFormVisible = false" @finish="finish" />
    </el-dialog>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  import ShopEdit from './components/edit.vue'

  export default {
    components: { Pagination, ShopEdit },
    data() {
      return {
        bizdatas: [],
        total: 0,
        loading_query: false,
        params: {
          page: 1,
          limit: 10,
          shname: ''
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          add: '新增',
          edit: '编辑'
        },
        bizdata: {}
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
          url: '/shop/queryList',
          method: 'post',
          data: this.params
        }).then(res => {
          this.loading_query = false
          this.bizdatas = res.bizdatas
          this.total = res.total || 0;
        })
      },
      add() {
        this.bizdata = {}
        this.dialogStatus = 'add'
        this.dialogFormVisible = true
      },
      edit(row) {
        this.bizdata = row
        this.dialogStatus = 'edit'
        this.dialogFormVisible = true
      },
      del(row, index) {
        this.$confirm('确定删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: '/shop/del?ids=' + row.id,
            method: 'post'
          }).then(res => {
            this.loadData()
          })
        })
      },
      finish() {
        this.dialogFormVisible = false
        this.loadData()
      }
    }
  }
</script>
