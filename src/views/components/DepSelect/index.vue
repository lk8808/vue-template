<template>
  <el-cascader ref="depSelect" v-model="depid" :options="deps" clearable filterable
               :props="{ value: 'id', label: 'depname', checkStrictly: true, emitPath: false }"
               @change="depChange"
  />
</template>

<script>
  export default {
    name: 'DepSelect',
    props: {
      value: { type: Number },
      size: { type: String }
    },
    data() {
      return {
        deps: [],
        depid: this.value
      }
    },
    created() {
      this.$http({
        url: '/department/getDepTree',
        method: 'get'
      }).then(res => {
        this.deps = res
      })
    },
    methods: {
      depChange() {
        this.$emit('input', this.depid)
        var selectObjs = this.$refs['depSelect'].getCheckedNodes()
        this.$emit('change', selectObjs[0].data)
      }
    }
  }
</script>
