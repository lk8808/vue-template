<template>
  <div>
    <el-form ref="dataForm" v-loading="loading_save" :rules="rules" :model="bizdata"
             label-width="120px" size="medium"
             element-loading-text="正在保存"
    >
      <el-form-item label="商户名称" prop="shname">
        <el-input v-model="bizdata.shname" style="width: 300px;" />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="商户简称" prop="shortname">
            <el-input v-model="bizdata.shortname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="营业执照" prop="buslicence">
            <el-input v-model="bizdata.buslicence" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="负责人姓名" prop="ownername">
            <el-input v-model="bizdata.ownername" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人电话" prop="telephone">
            <el-input v-model="bizdata.telephone" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="负责人证件号" prop="owneridnum">
        <el-input v-model="bizdata.owneridnum" style="width: 300px;" />
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属机构" prop="departmentid">
            <dep-select v-model="bizdata.departmentid" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="管理员工" prop="employeeid">
            <emp-select v-model="bizdata.employeeid" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="结算账户名" prop="accountname">
            <el-input v-model="bizdata.accountname" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结算账户" prop="account">
            <el-input v-model="bizdata.account" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="经营类别" prop="busstype">
            <dict-select v-model="bizdata.busstype" dicttypeid="fims_busstype" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="商户状态" prop="shopsts">
            <dict-select v-model="bizdata.shopsts" dicttypeid="fims_shopsts" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="选择地区" prop="region">
        <el-cascader v-model="bizdata.region" :options="options" style="width: 300px;" size="medium" filterable @change="regionChange" />
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="bizdata.address" style="width: 300px;" />
      </el-form-item>
      <el-form-item label="附件上传">
        <fileupload v-model="fileuuid" entityname="FIMS_SHOP" :entityid="String(bizdata.id)" />
      </el-form-item>
      <el-form-item>
        <el-button @click="$emit('cancel',$event)">
          取消
        </el-button>
        <el-button type="primary" @click="save">
          保存
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import DictSelect from '@/views/components/DictSelect'
  import DepSelect from '@/views/components/DepSelect'
  import EmpSelect from '@/views/components/EmpSelect'
  import Fileupload from '@/views/components/Fileupload'
  import { validPhone, validIdcard } from '@/utils/validate.js'
  import { regionData, CodeToText } from 'element-china-area-data';

  export default {
    components: { DictSelect, DepSelect, EmpSelect, Fileupload },
    props: {
      bizdata: {
        required: true,
        type: Object
      }
    },
    data() {
      var checkPhone = (rule, value, callback) => {
        if (validPhone(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的手机号'))
        }
      }
      var checkIdnum = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入证件号'))
        }
        var rt = validIdcard(value)
        if (rt === '0') {
          callback()
        } else {
          callback(new Error(rt))
        }
      }
      return {
        loading_save: false,
        options: regionData,
        rules: {
          shname: [{ required: true, message: '商户名称必填', trigger: 'blur' }],
          shortname: [{ required: true, message: '商户简称必填', trigger: 'blur' }],
          buslicence: [{ required: true, message: '营业执照必填', trigger: 'blur' }],
          telephone: [{ required: true, trigger: 'blur', validator: checkPhone }],
          owneridnum: [{ required: true, trigger: 'blur', validator: checkIdnum }]
        },
        fileuuid: ''
      }
    },
    watch: {
      bizdata(val) {
        this.init()
      }
    },
    created() {
      this.init()
    },
    methods: {
      init() {
        if (this.bizdata.province && this.bizdata.city && this.bizdata.country) {
          this.bizdata.region = [this.bizdata.province, this.bizdata.city, this.bizdata.country]
        }
      },
      regionChange(arr) {
        if (!arr) {
          return
        }
        this.bizdata.province = arr[0]
        this.bizdata.city = arr[1]
        this.bizdata.country = arr[2]
        this.bizdata.address = CodeToText[arr[0]] + CodeToText[arr[1]] + CodeToText[arr[2]]
      },
      save() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.loading_save = true
            this.$http({
              url: '/shop/save',
              method: 'post',
              data: this.bizdata
            }).then(res => {
              this.loading_save = false
              this.dialogFormVisible = false
              this.$emit('finish', this.bizdata)
            }).catch(err => {
              this.loading_save = false
            })
          }
        })
      }
    }
  }
</script>
