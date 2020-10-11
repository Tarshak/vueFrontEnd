<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightsList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template v-slot="scope">
            <!-- 通过v-slot=”scope“拿到每一行的数据 -->
            <el-tag v-if="scope.row.level ==='0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level==='1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        rightsList: []
      }
    },
    created() {
      //生命周期函数中调用数据请求
      this.getRightsList()
    },
    methods: {
      async getRightsList() {
        const { data: res } = await this.$http.get('rights/list')
        if (res.meta.status !== 200) {
          return this.$message.error("获取权限列表失败")
        }
        this.rightsList = res.data
      }
    },
  }
</script>


<style scoped>

</style>