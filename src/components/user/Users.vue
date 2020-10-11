<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="22">
        <el-col :span="19">
          <!-- 为搜索框添加clear属性，并添加内容清除时触发事件 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>

        </el-col>
      </el-row>

      <!-- 指定数据源 -->
      <el-table :data="userlist" border stripe>
        <!-- tablecolumn会遍历传入的prop属性,设置type index，可以添加索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="性名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <!-- scope.row可以拿到该行所有的数据 -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <el-tooltip effect="dark" content="修改" placement="top">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" >
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini"
              @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页中的属性建议用请求回来的数据进行绑定 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1,2,5,10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

    </el-card>
    <!-- 添加用户的对话框，并将addDialogVisible=true赋值给添加用户按钮的button点击事件中 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分配角色" :visible.sync="SetRoleDialogVisible" 
    width="50%" @close="setRoleDialogClosed">
        <div>
          <p>当前的用户：{{userInfo.username}}</p>
          <p>当前的角色：{{userInfo.role_name}}</p>
          <p>分配新角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <el-button @click="SetRoleDialogVisible = false">取 消</el-button>
        <el-button  @click="saveRoleInfo" type="primary" >确 定</el-button>
    </el-dialog>
  </div>
</template>


<script>
  export default {
    data() {
      //验证邮箱的规则，因为不需要返回出去，因此写在return代码块外部
      let checkEmail = (rule, value, cb) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          //合法的邮箱
          return cb()
        }
        //如果不符合正则匹配调用这一步
        cb(new Error('请输入合法的邮箱'))
      }
      let checkMobile = (rule, value, cb) => {
        const regMobile = /^(0\86\17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          //合法的邮箱
          return cb()
        }
        //如果不符合正则匹配调用这一步
        cb(new Error('请输入合法的手机号'))
      }
      return {

        //获取用户列表的参数对象
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 2
        },
        userlist: [],
        total: 0,
        //控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        editDialogVisible: false,
        //添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        editForm: {
        },
        SetRoleDialogVisible:false,
        userInfo:{},
        rolesList:[],
        selectedRoleId:'',

        //添加表单的验证规则对象
        addFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '用户名的长度在3~10个字符之间', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 8, max: 15, message: '密码的长度在8~15个字符之间', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            //自定义规则，将自定义规则接收的变量绑定给验证器
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ],
        },
        editFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机号码', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ],
        }
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        //调用接口，像服务器发起请求，参数都是后端定义好的api
        const { data } = await this.$http.get('users', { params: this.queryInfo })
        if (data.meta.status !== 200) return this.$message.error('获取用户列表失败')
        this.userlist = data.data.users
        this.total = data.data.total
        console.log(data)
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        console.log(newSize)
        //每次改变时对请求参数重新赋值,并重新发起请求
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      //监听switch开关的改变，发生改变时发起put请求
      async userStateChange(userinfo) {
        //使用es6的模板格式化输出传参，路径为接口定义好的地址
        const { data } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if (data.meta.status !== 200) {
          //如果请求失败则对状态取反，保证没有发生变化
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error = "更新用户状态失败"
        }
        this.$message.success('更新用户状态成功')
      },
      //监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      //点击按钮添加新用户
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data } = await this.$http.post('users', this.addForm)
          if (data.meta.status !== 201) {
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          //完成上面的代码之后重新隐藏对话框
          this.addDialogVisible = false
          //添加成功之后重新对服务器发起请求，获得新的用户列表
          this.getUserList()
        })
      },
      //展示编辑用户的对话框
      async showEditDialog(id) {
        const { data } = await this.$http.get('users/' + id)
        if (data.meta.status !== 200) {
          return this.$message.error('查询用户失败')
        }
        this.editForm = data.data
        this.editDialogVisible = true
      },
      //修改用户信息并提交
      editUserInfo() {
        //通过引用来进行验证，如果通过会返回一个true，再提交给服务器,
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          //如果返回false直接中断程序，否则发起对服务器的请求
          const { data } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          })

          if (data.meta.status !== 200) {
            return this.$message.error('更新用户信息失败')
          }
          this.editDialogVisible = false
          //重新获取数据
          this.getUserList()
          this.$message.success('更新用户信息成功')
        })
      },
      async removeUserById(id) {
        //使用elementui 提供的api展示确认弹窗
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '删除用户',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).catch(err => err)//当箭头函数的函数体只有一个 `return` 语句时，可以省略 `return` 关键字和方法体的花括号
        //如果确认删除返回字符串confirm
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }
        this.$message.success('删除用户成功')
        this.getUserList()
      },
      //分配角色点击事件
      async setRole(userInfo){
        this.userInfo=userInfo
        const {data:res}=await this.$http.get('roles')
        if(res.meta.status!==200){
          return this.$message.error('获取角色列表失败')
        }
        this.rolesList=res.data
        this.SetRoleDialogVisible=true
      },
      //确定按钮绑定的分配角色函数
      async saveRoleInfo(){
        if(!this.selectedRoleId){
          return this.$message.error('请选择要分配的角色')
        }
        const {data:res}=await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
        if(res.meta.status!==200){
          return this.$message.error('更新角色失败')
        }
        this.$message.success('更新角色成功')
        this.getUserList()
        this.SetRoleDialogVisible=false
      },
      setRoleDialogClosed(){
        //当对话框关闭时对数据重置
        this.selectedRoleId=''
        this.userInfo={}
      }
    }
  }
</script>

<style scoped>


</style>