<template>
  <div class="main_cont">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 定义一个数据对象 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <el-form-item prop="username"><!-- 通过prop绑定对应的验证规则 -->
          <el-input v-model='loginForm.username' prefix-icon='el-icon-user'></el-input><!-- 如果没有全局导入整个库需要在plugin文件夹中按需导入 -->
        </el-form-item>

        <el-form-item prop='password'>
          <el-input v-model='loginForm.password' prefix-icon='el-icon-lock' type="password"></el-input><!-- 密码 -->
        </el-form-item>

        <el-form-item class="btns">
          <el-button @click="login" type="primary">登录</el-button>
          <el-button @click="resetLoginForm" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      /* 登录表单的数据绑定对象 */
      loginForm:{
        username:'admin',
        password:'123456'

      },
      //表单的验证规则对象
      loginFormRules:{
        username:[
          {required:true,message:'请输入账号',trigger:'blur'},
          {min:3,max:8,message:'长度在3到8个字符',trigger:'blur'}
        ],
        password:[
          {required:true,message:'请输入密码',trigger:'blur'},
          {min:6,max:15,message:'长度在6到15个字符',trigger:'blur'}
        ]
      }
    }
  },
  methods: {
    /* 点击重置表单 */
    resetLoginForm(){
      this.$refs.loginFormRef.resetFields()
    },
    login(){/* 通过this拿到表单的引用 */
      this.$refs.loginFormRef.validate(async valid=>{
        if(!valid)return;
        //如果返回的是一个promise那么应该用async await来简化返回的结果
        //const result=await this.$http.post('login',this.loginForm)
        const {data}=await this.$http.post('login',this.loginForm)
        //es6语法糖可以直接解构返回的对象，只拿想要的数据,也可以使用：对拿到的数据重命名
        if(data.meta.status!==200)return this.$message.error('登录失败')
        this.$message.success('登录成功')

        //登录成功以后将token保存到客户端的sessionStorage中
        window.sessionStorage.setItem("token",data.data.token)
        this.$router.push('/home')
      })
    }
  },
}
</script>

<style lang="less" scoped>
  .main_cont{
    background-image: url(https://cdn.dribbble.com/users/472667/screenshots/14074439/media/64720654d52f9a50f9b2ffd1b9256b35.png);
    height: 100%;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    .avatar_box{
      box-shadow: 0 0 10px black;
      height: 130px;
      width: 130px;
      border:1px solid #eee;
      border-radius:50%;
      padding:10px;
      position: absolute;
      left: 50%;
      transform:translate(-50%,-50%);
      img{
        width: 100%;
        height: 100%;
        border-radius:50%;
        background-color: aquamarine;
      }
    }
  }
  .btns{
    display: flex;
    justify-content: flex-end;
  }
  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  /* 如果要使用less语法需要在依赖中下载less和less loader */
</style>