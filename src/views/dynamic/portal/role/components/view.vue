<template>
  <div>
    <div class="header">
      <el-row class="operation">
        <el-col :span="4">
          <el-button-group>
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="addRoleauth" />
            <el-button type="success" size="mini" icon="fa fa-floppy-o" @click="saveRoleauth" />
          </el-button-group>
        </el-col>
      </el-row>
    </div>
    <el-table v-loading="loading_roleauth" :data="roleauths" empty-text="">
      <el-table-column min-width="300px" label="角色类型">
        <template slot-scope="{row}">
          <el-select v-model="row.roleauthtype" clearable placeholder="请选择" size="small">
            <el-option v-for="item in roleauthtypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column min-width="300px" label="配置名称">
        <template slot-scope="{row}">
          <el-cascader v-if="row.roleauthtype == 'DEP'" v-model="row.refid" :options="deps" clearable size="small"
                       :props="{ value: 'id', label: 'depname', checkStrictly: true, emitPath: false }" style="width: 300px;"
          />
          <el-select v-if="row.roleauthtype == 'POS'" v-model="row.refid" placeholder="请选择岗位" size="small">
            <el-option v-for="item in positions" :key="item.id" :label="item.posname" :value="item.id" />
          </el-select>
          <el-select v-if="row.roleauthtype == 'DEPPOS'" v-model="row.refid" placeholder="请选择部门岗位" size="small">
            <el-option v-for="item in depposlnks" :key="item.id" :label="'【' + item.depname + '】' + item.posname" :value="item.id">
              <span>【{{ item.depname }}】{{ item.posname }}</span>
            </el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{$index}">
          <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteRoleauth($index)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  export default {
    props: {
      bizdata: {
        required: true,
        type: Object
      }
    },
    data() {
      return {
        loading_roleauth: false,
        roleauthtypes: [
          { value: 'DEP', label: '部门' },
          { value: 'POS', label: '岗位' },
          { value: 'DEPPOS', label: '部门岗位' }
        ],
        deps: [],
        positions: [],
        depposlnks: [],
        roleauths: []
      }
    },
    watch: {
      bizdata(val) {
        this.loadRoleauths()
      }
    },
    created() {
      this.dialogViewVisible = true
      this.loadRoleauths()
      this.loadDeps()
      this.loadPositions()
      this.loadDepposlnks()
    },
    methods: {
      loadDeps() {
        this.$http({
          url: '/department/getDepTree',
          method: 'post'
        }).then(res => {
          this.deps = res
        })
      },
      loadPositions() {
        this.$http({
          url: '/position/queryAllList',
          method: 'post'
        }).then(res => {
          this.positions = res
        })
      },
      loadDepposlnks() {
        this.$http({
          url: '/depposlnk/queryAllList',
          method: 'post'
        }).then(res => {
          this.depposlnks = res
        })
      },
      loadRoleauths() {
        this.loading_roleauth = true
        this.$http({
          url: '/roleauthcfg/queryByRoleid?roleid=' + this.bizdata.id,
          method: 'get'
        }).then(res => {
          this.roleauths = res
          this.loading_roleauth = false
        })
      },
      addRoleauth() {
        this.roleauths.push( { roleid: this.bizdata.id, roleauthtype: '' } )
      },
      saveRoleauth() {
        this.roleauths = this.roleauths.filter(function (item) {
          return item.refid > 0
        })
        if (this.roleauths.length < 1) {
          return
        }
        this.loading_roleauth = true
        this.$http({
          url: '/roleauthcfg/saveBath',
          method: 'post',
          data: {
            roleid: this.bizdata.id,
            bizdatas: this.roleauths
          }
        }).then(res => {
          this.loading_roleauth = false
          this.dialogViewVisible = false
          this.$message.success('保存成功');
        })
      },
      deleteRoleauth(index) {
        this.roleauths.splice(index, 1)
      }
    }
  }
</script>
