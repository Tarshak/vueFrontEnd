<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
    <!-- 步骤条:active属性用于设置默认的步骤，由于tab栏接收的值是字符串，步骤条需要接收的是number，
            那么可以对里面的值进行-0操作 转换成number类型-->
    <el-steps :space="200" :active="activeIndex -0" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <!-- tab栏区域 ，通过name属性用索引和步骤条关联,每次点击tab会对activeIndex进行重新赋值-->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <!-- 为tabs绑定点击事件 -->
      <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <!-- 对输入内容进行类型限制 -->
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight" type="number">
            <el-input v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number" type="number">
            <el-input v-model="addForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="cateProps" @change="handleChange">
            </el-cascader>
          </el-form-item>
        </el-tab-pane>
        <!-- 渲染表单的item项 -->
        <el-tab-pane label="商品参数" name="1">
          <!-- 拿到tabClicked函数中请求的数据，并进行循环渲染 -->
          <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in manyTableData">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox border :label="cb" :key="i" v-for="(cb,i) in item.attr_vals"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in onlyTableData">
            <el-input v-model="item.attr_vals" placeholder=""></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <!-- action属性中需要传入储存的服务器地址，必须传入一个完整的绝对路径
          请求时不需要完整地址是因为使用axios已经配置baseUrl
          listtype用于指定ui样式
          同时图片在上传时是通过内部封装的ajax请求，而不是axios，因此在main.js中设置的每次发送请求前配置token的拦截器无法对他起效
          因此需要在header属性手动让他携带token,
          在上传成功之后服务器会返回一个临时保存图片的路径，这时候需要通过on-success提供的钩子函数来进行对应的保存-->
          <el-upload :action="uploadURL"
            :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture"
            :headers="headerObj" :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <el-button type="primary" @click="add">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    </el-card>
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
    
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    data() {
      return {
        //tab栏和步骤条共用的变量，只是他们需要的数据类型不一致
        activeIndex: '0',
        //添加商品的表单数据对象
        catelist: [],
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          goods_cat: [],
          pics:[],
          goods_introduce:'',
          attrs:[]
        },
        manyTableData: [],
        onlyTableData: [],
        addFormRules: {
          goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
          goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
          goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
          goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
          goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
        },
        cateProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        
        uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
        //为上传图片组件手动添加token
        headerObj:{
          Authorization:window.sessionStorage.getItem('token')
        },
        previewVisible:false,
        previewPath:''
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const { data: res } = await this.$http.get(`categories`);
        if (res.meta.status !== 200) {
          return this.$message.error('数据请求失败')
        }
        this.catelist = res.data
      },
      handleChange() {
        console.log(this.addForm.goods_cat);
        //控制级联选择器必须选中第三级分类，否则清空数组无法选中
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },
      //tabs的钩子函数,固定参数格式，第一个参数是将要跳转的标签页，第二个参数是即将离开的标签页
      //返回的是字符串索引
      beforeTabLeave(activeName, oldActiveName) {
        console.log('即将跳转的标签页名字是' + activeName);
        console.log('即将离开的标签页名字是' + oldActiveName);
        //进行判断如果从0标签页跳转，且没有选择第三级分类返回出去false阻止跳转
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类');
          return false
        }
      },
      async tabClicked() {
        if (this.activeIndex === '1') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: { sel: 'many' }
          });
          if (res.meta.status !== 200) {
            return this.$message.error('请求商品参数失败')
          }
          //在储存数据之前先对字符串用空格分割转成数组
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          })
          this.manyTableData = res.data
          console.log(res.data);
        } else if (this.activeIndex === '2') {
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
            params: { sel: 'only' }
          });
          if (res.meta.status !== 200) {
            return this.$message.error('请求商品属性失败')
          }
          this.onlyTableData = res.data
          console.log(res.data);
        }
      },
      //处理图片预览效果
      handlePreview(file){
        this.previewPath=file.response.data.url
        this.previewVisible=true
      },
      
      //监听图片上传成功的事件，服务器返回的临时路径保存到addForm对象中
      handleSuccess(response){
        console.log(response);
        //从返回结果结构出临时路径，赋给pic键，pic为数据库中定义好的变量
        const picInfo={pic:response.data.tmp_path}
        //将图片信息对象push到pics数组中
        this.addForm.pics.push(picInfo)
      },
      //处理移除图片的操作
      handleRemove(file){
        const filePath=file.response.data.tmp_path
        //findIndex回调函数中的x代表的是pics数组中的每个对象，匹配每个对象中的pic值找到索引
        const i=this.addForm.pics.findIndex(x=>
          x.pic===filePath)
        this.addForm.pics.splice(i,1)
        
      },
      //最后一步添加商品点击事件
      add(){
        this.$refs.addFormRef.validate(async valid=>{
          if(!valid){
            return this.$message.error('请填写必要的表单项');
          }
          //在发请求保存数据之前要先将addForm对象进行深拷贝，对这个新拷贝出来对象进行goods_cat进行字符串转换
          //不能直接对原对象进行转换是因为级联选择器要求双向绑定的数据必须是数组，因此我们直接绕过原数组
          //深拷贝一个新对象，用这个新对象发送请求
          const form=_.cloneDeep(this.addForm)
          form.goods_cat=form.goods_cat.join(',')
          //发送添加商品请求，attrs参数为数组，包含了动态参数和静态属性两个对象，
          //因此在请求之前还需要对manytabledata和onlytabledata进行处理,其中两个对象都需要attr_id和attr_vals参数
          this.manyTableData.forEach(item=>{
            const newInfo={attr_id:item.attr_id , attr_value:item.attr_vals.join('')}
            this.addForm.attrs.push(newInfo)
          })
          this.onlyTableData.forEach(item=>{
            //静态属性不需要join，本来就是一个字符串
            const newInfo={attr_id:item.attr_id , attr_value:item.attr_vals}
            this.addForm.attrs.push(newInfo)
          })
          //将处理好的attrs属性赋值给深拷贝出来的新对象
          form.attrs=this.addForm.attrs
          const {data:res}=await this.$http.post(`goods`,form);
          if(res.meta.status!==201){
            return this.$message.error('商品添加失败')}
          this.$message.success('添加商品成功');
          //添加商品成功之后使用编程式导航进行跳转
          this.$router.push('/goods')
        })
      }

    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    },
  }
</script>


<style scoped>
  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }
  .previewImg{
    width: 100%;
  }
  
</style>