<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <div id="main" style="width:600px;height:400px"></div>
    </el-card>

  </div>
</template>

<script>
  import echarts from 'echarts'

  export default {
    data() {
      return {

      }
    },
    created() {

    },
    async mounted() {
      //在渲染完毕后初始化echats实例
      let myChart=echarts.init(document.getElementById('main'))
      const {data:res}=await this.$http.get(`reports/type/1`);
      if(res.meta.status!==200){
       return this.$message.error('获取图表失败')}

      myChart.setOption(res.data)
    },
    methods: {

    },
  }
</script>


<style>


</style>