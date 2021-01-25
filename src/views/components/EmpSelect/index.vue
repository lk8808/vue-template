<template>
  <el-select v-model="empid" placeholder="请选择" filterable @change="empChange">
    <el-option v-for="item in emps" :key="item.empno" :label="item.empname" :value="item.id">
      <span style="float: left">{{ item.empname }}【{{ item.empno }}】</span>
      <span style="float: right; color: #8492a6; font-size: 13px">{{ item.depname }}</span>
    </el-option>
  </el-select>
</template>

<script>
  export default {
    name: 'EmpSelect',
    props: {
      value: { type: Number },
      size: { type: String }
    },
    data() {
      return {
        emps: [],
        empid: this.value
      }
    },
    created() {
      this.$http({
        url: '/employee/queryAllList',
        method: 'get'
      }).then(res => {
        this.emps = res
      })
    },
    methods: {
      empChange(selectVal) {
        var emp = this.emps.find((item) => {
          return item.id === selectVal;
        });
        this.$emit('input', this.empid)
        this.$emit('change', emp)
      }
    }
  }
</script>
