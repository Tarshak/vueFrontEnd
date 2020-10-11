<template>
  <el-container class="home-container">

    <el-header>
      <div>
        
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>

    </el-header>
    <el-container class="aside-container">
      <!-- 三目运算符，根据isCollapse的布尔值设定为整个侧边栏设定宽度 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <!-- 点击折叠 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu  class="elMenu" text-color="black" active-text-color="#ffd04b" :collapse="isCollapse"
          :collapse-transition="false" router :default-active="activePath">
          <!-- 为整个侧边栏开启路由模式根据subItem的index跳转到对应的路由 -->

          <!-- 一级菜单,动态绑定唯一标识否则每次点击，所有的列表都会展开，由于只接受字符串，还需要进行拼接将变量转为字符串-->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <!--创建一个icons对象，将要使用的图标和item.id进行关联，这样可以直接遍历出对应要使用的图标-->
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 根据index的值跳转到对应路由，path数据是从服务器返回的-->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id"
              @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>

          </el-submenu>

        </el-menu>
      </el-aside>
      <el-main>
        <!-- 在该位置放一个routerview用于显示详细内容 -->
        <router-view></router-view>
      </el-main>
    </el-container>

  </el-container>


</template>

<script>
  export default {
    data() {
      return {
        backgroudcolor:`background: #C6FFDD;
    /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, #f7797d, #FBD786, #C6FFDD);
    /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, #f7797d, #FBD786, #C6FFDD);
    /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */`,
        menulist: [],
        iconsObj: {
          '125': 'el-icon-user',
          '103': 'el-icon-s-management',
          '101': 'el-icon-s-shop',
          '102': 'el-icon-s-order',
          '145': 'el-icon-s-marketing'
        },
        isCollapse: false,
        //saveNavState每次点击生成一个键为activepath的session，再动态绑定到高亮设置中
        activePath: ''
      }
    },
    created() {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      async getMenuList() {
        const { data: res } = await this.$http.get('menus')
        //如果返回的状态不等于200说明请求失败，返回并打印错误信息
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        //如果请求成功没有触发上面的if继续执行这一步将获取到的数据赋值给data中的menulist
        this.menulist = res.data
      },
      //展开按钮切换侧边栏的折叠和展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      //保存链接的激活状态
      saveNavState(index) {
        window.sessionStorage.setItem('activePath', index)
        //每次点击之后对activepath进行重新赋值
        this.activePath = index
      }
    },
  }
</script>


<style scoped>
  .home-container {
    height: 100%;
  }

  .el-header {
    background: #bdc3c7;  /* fallback for old browsers */
background: -webkit-linear-gradient(to right, #2c3e50, #bdc3c7);  /* Chrome 10-25, Safari 5.1-6 */
background: linear-gradient(to right, #2c3e50, #bdc3c7); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */


    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;
  }

  .el-header div {
    display: flex;
    align-items: center;
  }

  .el-header span {
    margin-left: 15px;
  }

  .el-menu {
    border-right: solid 0px #e6e6e6;
  }

  .el-aside {
    background: #bdc3c7;  /* fallback for old browsers */
background: -webkit-linear-gradient(to right, #2c3e50, #bdc3c7);  /* Chrome 10-25, Safari 5.1-6 */
background: linear-gradient(to right, #2c3e50, #bdc3c7); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  }

  .el-main {
    background-color: #EAEDF1;
  }

  header div img {
    height: 62px;
    width: 65px;
  }

  .toggle-button {
    background: #bdc3c7;  /* fallback for old browsers */
background: -webkit-linear-gradient(to right, #2c3e50, #bdc3c7);  /* Chrome 10-25, Safari 5.1-6 */
background: linear-gradient(to right, #2c3e50, #bdc3c7); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

    font-size: 18px;
    line-height: 24px;
    color: rgb(29, 23, 23);
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .elMenu{
    background: #bdc3c7;  /* fallback for old browsers */
background: -webkit-linear-gradient(to right, #2c3e50, #bdc3c7);  /* Chrome 10-25, Safari 5.1-6 */
background: linear-gradient(to right, #2c3e50, #bdc3c7); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  }
</style>