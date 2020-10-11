<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card :body-style="{ padding: '0px' }">
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false">
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：
          </span>
          <el-cascader v-model="selectedCateKeys" :options="catelist" :props="catProps" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" @click="addDialogVisible=true" size="mini" :disabled="isBtnDisabled">添加参数
          </el-button>
          <!-- 动态属性表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                @close="handleClose(i,scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入的文本框，为避免文本框产生联动不应该在data中定义公用的变量
                而是在请求时通过forEach为每个对象定义独立的空变量,再通过作用域拿到各自独立的属性 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" @click="addDialogVisible=true" size="mini" :disabled="isBtnDisabled">添加属性
          </el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable
                @close="handleClose(i,scope.row)">
                  {{item}}
                </el-tag>
                <!-- 输入的文本框，为避免文本框产生联动不应该在data中定义公用的变量
                而是在请求时通过forEach为每个对象定义独立的空变量,再通过作用域拿到各自独立的属性 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除
                </el-button>

              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加动态参数/静态属性共用对话框 -->
    <el-dialog :title="'添加'+titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText " prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText " prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParams">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        catelist: [],
        catProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        //级联选择框双向绑定的数组
        selectedCateKeys: [],
        //activeName的值会和tabpane里的name属性进行关联
        activeName: 'many',
        manyTableData: [],
        onlyTableData: [],
        addDialogVisible: false,
        addForm: {
          attr_name: ''
        },
        addFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },
        editDialogVisible: false,
        editForm: {},
        editFormRules: {
          attr_name: [
            { requires: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },

      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败')
        }
        this.catelist = res.data
      },
      handleChange() {
        this.getParamsData()

      },
      handleTabClick() {
        this.getParamsData()

      },
      async getParamsData() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTableData=[]
          this.onlyTableData=[]
          return
        }
        //根据所选分类的id和当前所处的面板，获取对应的数据
        //在请求路径中传入写好的计算属性
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: this.activeName }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('请求数据失败')
        }
        //这时候想要对拿到的参数/属性中的attr_vals进行渲染，此时attr_vals返回的是一个字符串
        //foreach对应的就是data数组的每一个对象，并分别对各个对象进行遍历
        res.data.forEach(item => {//foreach会执行一个回调函数，item代表的是当前的对象
          //用split对attr——vals里的字符串用空格分隔，拆分成数组，并重新赋值回去
          //三元运算符，判断返回的数组是否为空，有数据则返回true取第一个表达式进行分割，否则为空赋值为一个空数组
          //这里解决了空数据被分割之后还是会渲染出一个空tag
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          //同时为了在展开列的添加新tag中不产生联动，在遍历时为每个对象添加各自单独的属性
          item.inputVisible = false
          item.inputValue = ''
          //拿到结果以后用作用域插槽v-scope="scope"在展开行中遍历渲染数组中的每一项
        })
        console.log(res.data)
        //拿到数据之后先进行判断，再保存到对应的变量中
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      },
      //监听对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      addParams() {
        //在发起添加请求之前先对表单进行预验证
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('参数添加失败')
          }
          this.$message.success('添加参数成功')
          this.addDialogVisible = false
          this.getParamsData()
        })
      },
      async showEditDialog(attr_id) {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
          params: { attr_sel: this.activeName }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('数据请求失败')
        }
        //如果请求成功将数据保存到绑定了：model的editform变量中
        this.editForm = res.data
        this.editDialogVisible = true
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      editParams() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改数据失败')
          }
          this.$message.success('数据修改成功')
          this.getParamsData()
          this.editDialogVisible = false
        })
      },
      //根据id删除对应的参数项
      async removeParams(attr_id) {
        //点击删除按钮之后进行弹窗提示,回返回一个promise用async await来简化
        const confirmResult = await this.$confirm('次操作将永久删除该参数，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        //用户取消的操作
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        //删除的业务逻辑
        const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败')
        }
        this.$message.success('删除参数成功')
        this.getParamsData()
      },
      //文本框失去焦点，或摁下了enter键都会触发
      async handleInputConfirm(row) {
        console.log('ok');
        //在触发事件之前，先判断文本框内容是否为空，如果为空进行重置并隐藏
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        //如果没有return说明输入了内容
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        //将内容push进数组之后，还需要对服务器发起请求进行持久化存储
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')//数据库储存的数据为字符串类型，因此还需要数组转换回字符串
        });
        if (res.meta.status !==200) {
          return this.$message.error('添加失败')
        }
        this.$message.success('添加成功');
      },
      //通过传过来的scope.row拿到独立的属性
      showInput(row) {
        row.inputVisible = true
        //当点击了new tag之后自动获取焦点
        //$nextTick方法的作用是，当页面上的元素被重新渲染之后，才会调用回调函数
        //也就是说当触发了点击事件之后，重置了inputVisible属性，但是不能保证此时输入框已经被渲染了
        //为了避免dom找不到input对象，nextTick就是等待渲染完成之后再执行回调
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      //tag关闭事件
      async handleClose(i,row){
        console.log(i,row);
        row.attr_vals.splice(i,1)//用splice函数传入索引，和要删除的数量
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        });
        if (res.meta.status !==200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功');
      }

    },
    computed: {
      //通过计算属性判断商品分类级联选择框是否被选中
      //将这个计算属性绑定给按钮的disabled属性，根据返回的布尔值决定是否启用
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      //获取请求时需要的id参数
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      //动态计算标题的文本
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        } else {
          return '静态属性'
        }
      }
    }
  }
</script>


<style scoped>
  .cat_opt {
    margin: 15px;

  }

  .el-cascader {
    max-width: 300px;
  }

  .el-tabs {
    margin: 0 15px;
    margin-bottom: 15px;
  }

  .el-tag {
    margin: 10px;
  }

  .input-new-tag {
    width: 150px;
  }
</style>