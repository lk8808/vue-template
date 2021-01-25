<template>
  <el-select v-model="dictid" clearable placeholder="请选择" :size="size" @change="dictChange">
    <el-option v-for="item in dicts" :key="item.dictid" :label="item.dictname" :value="item.dictid" />
  </el-select>
</template>

<script>
  export default {
    name: 'DictSelect',
    props: {
      dicttypeid: { // 数据字典类型id
        required: true,
        type: String
      },
      filterstr: { type: String }, // 过滤
      default: { type: String }, // 默认选中
      value: { type: String },
      size: { type: String }
    },
    data() {
      return {
        dicts: [],
        dictid: this.value
      }
    },
    created() {
      var that = this
      this.$http({
        url: '/dict/queryDictsByDicttypeid?dicttypeid=' + this.dicttypeid,
        method: 'get'
      }).then(res => {
        if (that.filterstr) {
          this.dicts = res.filter(function(item) {
            return that.filterstr.indexOf(item.dictid) > -1
          })
        } else {
          this.dicts = res
        }
        if (this.default) {
          this.value = this.default
        }
      })
    },
    methods: {
      dictChange() {
        this.$emit('input', this.dictid)
      }
    }
  }
</script>
