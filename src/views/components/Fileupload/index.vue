<template>
  <div>
    <el-upload :action="uploadUrl" :headers="headers" :data="param" :limit="limit" :file-list="fileList"
               :on-preview="handlePreview" :on-remove="handleRemove" :before-upload="beforeUpload"
    >
      <el-button size="small" type="primary">选择文件</el-button>
    </el-upload>
  </div>
</template>

<script>
  import { v4 as uuidv4 } from 'uuid';
  import { getToken } from '@/http/auth.js'

  export default {
    name: 'Fileupload',
    props: {
      entityname: {
        required: true,
        type: String
      },
      entityid: {type: String},
      filter: {type: String}, //  过滤
      maxNum: {type: Number}, // 最多上传数目
      maxSize: {type: Number}
    },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_BASE_API + '/file/upload',
        headers: {token: getToken()},
        fileList: [],
        limit: 99,
        param: {}
      };
    },
    watch: {
      entityid(val) {
        this.fileList = []
        this.init()
      }
    },
    created() {
      if (this.maxNum > 0) {
        this.limit = this.maxNum;
      }
      this.init();
    },
    methods: {
      init() {
        const fileuuid = uuidv4()
        this.param = {}
        this.param.fileuuid = fileuuid
        this.param.entityname = this.entityname
        if(this.entityid > 0) {
          this.param.entityid = this.entityid
          this.loadFiles()
        }
        if(this.filter) {
          this.param.filter = this.filter
        }
        this.$emit('input', fileuuid)
      },
      loadFiles() {
        this.$http({
          url: '/file/queryByEntity',
          method: 'post',
          data: {entityname: this.entityname, entityid: this.entityid}
        }).then(res => {
          this.fileList = res.map( (obj) => {
            return {
              id: obj.id,
              name: obj.filename,
              url: obj.filepath
            }
          })
        })
      },
      beforeUpload(file) {
        // 上传文件大小限制
        if(this.maxSize && file.size / 1024 > this.maxSize) {
          this.$message.error('上传头像图片大小不能超过 ' + this.maxSize + 'kb!');
          return false;
        }
        return true;
      },
      handleRemove(file, fileList) {
        var fileid = file.id
        if (fileid > 0) {
          this.$http({
            url: '/file/del?fileid=' + fileid,
            method: 'post'
          }).then(res => {
          })
        }
      },
      handlePreview(file) {
        console.log(file);
      }
    }
  }
</script>
