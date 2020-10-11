import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/login.vue";
import Home from "../components/home.vue";
import Welcome from "../components/welcome.vue";
import Users from "../components/user/Users.vue";
import Rights from "../components/power/Rights.vue";
import Roles from "../components/power/Roles.vue";
import Cate from "../components/goods/Cate.vue";
import Params from "../components/goods/Params.vue";
import GoodsList from "../components/goods/List.vue";
import Add from "../components/goods/Add.vue";
import Order from "../components/order/Order.vue";
import Report from "../components/report/Report.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/login",
    component: Login, //将components文件夹中的单页面组件引入并进行注册
  },
  {
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      { path: "/welcome", component: Welcome },
      { path: "/users", component: Users },
      { path: "/rights", component: Rights },
      { path: "/roles", component: Roles },
      { path: "/categories", component: Cate },
      { path: "/params", component: Params },
      { path: "/goods", component: GoodsList },
      { path: "/goods/add", component: Add },
      { path: "/orders", component: Order },
      { path: "/reports", component: Report },
    ],
  },
];

const router = new VueRouter({
  routes,
  
});

//挂载路由导航守卫。如果没有路由导航守卫，就算没有登录，用户可以通过路径直接访问登陆后页面
//路由导航守卫的作用就是判断用户有没有携带token，如果没有当访问/home时强制跳转到登录页面
router.beforeEach((to, from, next) => {
  //to将要访问的路径
  //from从哪个路径跳转而来
  //next放行
  //  next（）放行    next（'/login'）强制跳转到传入的路径

  if (to.path === "/login") return next(); //如果用户访问的是登录页，那么直接放行,条件不成立则继续下面代码
  //获取token
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login"); //如果token为空不存在，条件成立则强制跳转
  //以前条件都不成立则直接放行
  //但是这里有个问题，我们可以手动在sessionStorage中添加一个任意值的token，来骗过守卫
  next();
});

export default router;
