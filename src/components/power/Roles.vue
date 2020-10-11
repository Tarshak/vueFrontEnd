<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <!-- 为row全部绑定bdbottom类，并通过三目运算符判断是否绑定dbtop -->
            <el-row :class="['bdbottom', i1 === 0?'bdtop' : '', 'vcenter']" v-for="(item1,i1) in scope.row.children"
              :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span=5>
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 嵌套渲染二级权限 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2,i2) in item1.children"
                  :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 嵌套渲染三级权限,调用tag标签的close事件 -->
                    <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning"
                      v-for="(item3,i3) in item2.children" :key="item3.id">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!--  <pre>
              {{scope.row}}
              </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="290px">
          <template v-slot="scope">
            <el-button type="primary" @click="" size="mini" icon="el-icon-edit">编辑</el-button>
            <el-button type="danger" @click="" size="mini" icon="el-icon-delete">删除</el-button>
            <el-button type="warning" @click="" size="mini" icon="el-icon-setting"
            @click="showSetRightDialog(scope.row)">分配权限
            </el-button>

          </template>
        </el-table-column>
      </el-table>

    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="SetRightDialogVisible" width="50%">
      <!-- 树形空间，绑定数据源，并传入需要的参数,node-key代表的是每一个选中的节点要代表哪个属性，这里我们传入id -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox 
      node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        rolelist: [],
        SetRightDialogVisible: false,
        rightslist:[],
        //树形控件的配置,
        treeProps:{
          label:'authName',//在树形控件中要显示的属性
          children:'children'//指定数据是通过哪个属性实现的父子嵌套
        },
        //默认选中的节点数组
        defKeys:[],
        roleId:''
      }
    },
    created() {
      this.getRolesList()
    },
    methods: {
      async getRolesList() {
        const { data: res } = await this.$http.get('/roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.rolelist = res.data
        console.log(res.data)
      },
      async removeRightById(role, rightId) {
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        this.$message.success('删除权限成功')
        role.children = res.data
      },
      async showSetRightDialog(role) {
        this.roleId=role.id
        //在每次打开对话框时对数据初始化，避免其他角色的数据被携带进来
        this.defKeys=[]
        const {data:res}=await this.$http.get('rights/tree')
        if(res.meta.status !== 200){
          return this.$message.error('获取权限数据失败')
        }
        this.rightslist=res.data
        console.log(this.rightslist)
        //递归调用
        this.getLeafKeys(role,this.defKeys)
        this.SetRightDialogVisible=true
      },
      //通过递归的形式，获取角色下的三级权限的id，并保存到defKeys数组中
      getLeafKeys(node,arr){
        //判断在传入的节点中是否存在children属性，如果没有。说明是三级节点
        if(!node.children){
          return arr.push(node.id)
        }
        //这里的底层原理就是，如果上面的条件没触发，那么说明节点中存在children属性
        //foreach就是对当前自身所在的位置节点进行遍历调用
        node.children.forEach(item=>
        this.getLeafKeys(item,arr))
      },
      //分配权限函数
      async allotRights(){
        const keys=[
          //es6展开运算符，可以将结果直接进行结构并放入数组
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys(),
        ]
        //console.log(keys)
        //拿到数据之后发现是number类型用join对数组的数据进行转换
        const idsStr=keys.join(',')
        const{data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idsStr})
        if(res.meta.status!==200){
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.SetRightDialogVisible=false
      }
      
    },
  }
</script>

<style scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>