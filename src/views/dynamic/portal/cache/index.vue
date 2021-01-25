<template>
  <div class="app-container">
    <div class="header">
      <el-row class="filter">
        <el-col :span="8">
          <el-input v-model="pattern" placeholder="搜索缓存" style="width: 200px;" class="filter-item"
                    @keyup.enter.native="showCaches"
          />
          <el-button type="primary" size="small" icon="el-icon-search" style="margin: 5px;" @click="showCaches">
            搜索
          </el-button>
        </el-col>
      </el-row>
      <el-row class="operation">
        <el-col :span="24">
          <div style="display: flex;align-items: center;">
            <div style="flex:1">
              <el-button-group>
                <el-button type="primary" size="mini" @click="clearCache">清空缓存</el-button>
              </el-button-group>
            </div>
            <div>
              <el-tag type="info">缓存数：{{ keys.length }}</el-tag>
              <el-tag type="info">在线用户：{{ inlineNum }}</el-tag>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-table :data="keys" max-height="600" size="mini">
      <el-table-column label="key" align="center">
        <template slot-scope="{row}">
          <el-button type="text" size="small" @click="view(row)">{{ row }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{row, $index}">
          <el-button type="danger" size="mini" @click="del(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogViewVisible" center fullscreen>
      <div class="editor-container">
        <json-editor ref="jsonEditor" v-model="cacheData" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import JsonEditor from '@/components/JsonEditor'

  export default {
    components: { JsonEditor },
    data() {
      return {
        inlineNum: 0,
        pattern: '',
        keys: [],
        cacheData: {},
        dialogViewVisible: false
      }
    },
    created() {
      this.$http({
        url: '/cache/getInlineNum',
        method: 'post'
      }).then(res => {
        this.inlineNum = res || 0
      })
    },
    methods: {
      showCaches() {
        this.$http({
          url: '/cache/keys?pattern=' + this.pattern,
          method: 'post'
        }).then(res => {
          this.keys = res
        })
      },
      view(row) {
        this.$http({
          url: '/cache/get?key=' + row,
          method: 'get'
        }).then(res => {
          this.cacheData = res
          this.dialogViewVisible = true
        })
      },
      del(row, index) {
        this.$http({
          url: '/cache/remove?pattern=' + row,
          method: 'get'
        }).then(res => {
          this.keys.splice(index, 1)
        })
      },
      clearCache() {
        this.$http({
          url: '/cache/remove?pattern=*',
          method: 'get'
        }).then(res => {
          this.showCaches()
        })
      }
    }
  }
</script>

<style>
  .el-tag {
    margin: 5px;
  }
</style>
