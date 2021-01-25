<template>
  <div>
    <el-tree ref="tree" v-loading="loading_roleres" :data="menus" show-checkbox node-key="key" default-expand-all>
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <i v-if="data.type === 'APP'" class="fa fa-hand-o-right" />
        <i v-else class="fa fa-tags" />
        &nbsp;&nbsp;
        <span>{{ data.name }}</span>
      </span>
    </el-tree>
    <div style="text-align: center;">
      <el-button type="primary" size="medium" @click="save">保存</el-button>
    </div>
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
        loading_roleres: false,
        menus: []
      }
    },
    watch: {
      bizdata(val) {
        this.loadRoleres()
      }
    },
    created() {
      this.loadAppMenuTree()
    },
    methods: {
      loadAppMenuTree() {
        this.$http({
          url: '/menu/getAppMenuTree',
          method: 'post'
        }).then(res => {
          this.menus = res
          this.loadRoleres()
        })
      },
      loadRoleres() {
        this.$refs.tree.setCheckedKeys([])
        this.$http({
          url: '/rolereslnk/queryByRoleid?roleid=' + this.bizdata.id,
          method: 'post'
        }).then(res => {
          var selectRes = res.map(function(item, index, arr) {
            return item.restype + item.resid
          })
          this.$refs.tree.setCheckedKeys(selectRes)
        })
      },
      save() {
        this.loading_roleres = true
        var menus = this.$refs.tree.getCheckedNodes()
        var roleid = this.bizdata.id
        menus = menus.map(function(item, index, arr) {
          return {roleid: roleid, restype: item.type, resid: item.id }
        })
        this.$http({
          url: '/rolereslnk/saveBath',
          method: 'post',
          data: {
            roleid: this.bizdata.id,
            bizdatas: menus
          }
        }).then(res => {
          this.loading_roleres = false
          this.$message.success('保存成功');
        })
      }
    }
  }
</script>
