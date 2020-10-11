<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 在main.js中全局注册的第三方组件,属性和api查看官方文档 -->
            <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false"
                :expand-type="false" show-index border :show-row-hover="false">
                <!-- 定义一个自定义模板,通过isok插槽进行占位，并指定scope作用域插槽拿到数据 -->
                <template v-slot:isok="scope">
                    <i class="el-icon-success" style="color:lightgreen" v-if="scope.row.cat_deleted===false"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序列 -->
                <template v-slot:order="scope">
                    <el-tag closable size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level===1" size="mini" closable>二级</el-tag>
                    <el-tag type="warning" v-else closable size="mini">三级</el-tag>
                </template>
                <template v-slot:opt="scope">
                    <el-button type="primary" @click="" size="mini" icon="el-icon-edit">编辑</el-button>
                    <el-button type="danger" @click="" size="mini" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page.sync="queryInfo.pagenum" :page-sizes="[10,20,50,100]" :page-size="queryInfo.pagesize"
                layout="total,sizes, prev, pager, next,jumper" :total="total">
            </el-pagination>
        </el-card>
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options用来指定数据源,props中指定数据源中对应的属性，
                        value指定选中的值，label指定选中的值，children父子嵌套的属性
                        v-model指定要保存选中的数据-->
                    <el-cascader v-model="selectedKeys" :options="parentCateList" :props="{ 
                        expandTrigger: 'hover',
                        value:'cat_id',
                        label:'cat_name',
                        children:'children'}" @change="parentCateChanged" clearable change-on-select></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>


<script>
    export default {
        data() {
            return {
                queryInfo: {
                    type: 3,//根据ipa接口请求所有三级分类
                    pagenum: 1,
                    pagesize: 10
                },
                catelist: [],
                total: 0,
                //第三方树形组件的配置，为每一列指定名称和数据源,每个对象对应一列
                columns: [{
                    label: '分类名称',
                    prop: 'cat_name',
                }, {
                    label: '是否有效',
                    //将当前列定义为自定义模板列
                    type: 'template',
                    //当前列使用的模板名称
                    template: 'isok'
                }, {
                    label: "排序",
                    type: "template",
                    template: "order"
                }, {
                    label: "操作",
                    type: "template",
                    template: "opt"
                }],
                addCateDialogVisible: false,
                addCateForm: {
                    cat_name: "",
                    //父级分类的id
                    cat_pidL: 0,
                    //分类的等级，默认要添加的是一级分类
                    cat_level: 0

                },
                addCateFormRules: {
                    cat_name: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' }
                    ]
                },
                parentCateList: [],
                selectedKeys: []
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            //获取商品分类数据
            async getCateList() {
                const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类失败')
                }
                this.catelist = res.data.result
                this.total = res.data.total
            },
            //监听pagesize改变
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getCateList()
            },
            //监听pagenum的改变
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage
                this.getCateList()
            },
            showAddCateDialog() {
                this.getParentCateList()
                this.addCateDialogVisible = true
            },
            //获取父级分类的数据列表
            async getParentCateList() {
                //在添加分类按钮的点击事件中调用该函数
                const { data: res } = await this.$http.get('categories', { params: { type: 2 } })//es6结构语法，不用另外定义变量，直接进行对象结构
                if (res.meta.status !== 200) {
                    return this.$message.error("获取父级分类失败")
                }
                this.parentCateList = res.data
            },
            //选择项发生变化触发
            parentCateChanged() {
                console.log(this.selectedKeys);
                //如果selectedKeys数组中的length大于0，说明选中了父级分类
                //反之说明没有选中任何父级分类
                if(this.selectedKeys.length>0){
                    //只要数组中有数据，那么就取出数组的最后一位就是需要的父级分类
                    this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]
                    //根据数组的长度判断要分配的等级，如果没有任何父级分类 那么数组长度就是0，如果有一个父级那么数组长度就为1
                    this.addCateForm.cat_level=this.selectedKeys.length
                    return
                }else{
                    //如果第一个条件不成立，那么说明要添加的就是一级分类，在后台中的id为0
                    this.addCateForm.cat_pid=0
                    this.addCateForm.cat_level=0
                }

            },
            addCate(){
                this.$refs.addCateFormRef.validate(async valid=>{
                    if(!valid) return
                    const {data:res}=await this.$http.post('categories',this.addCateForm)
                    if(res.meta.status!==201){
                        return this.$message.error('添加分类失败')
                    }
                    this.$message.success('添加分类成功')
                    this.getCateList()
                    this.addCateDialogVisible=false
                })                
            },
            addCateDialogClosed(){
                this.$refs.addCateFormRef.resetFields()
                this.selectedKeys=[]
                this.addCateForm.cat_level=0
                this.addCateForm.cat_pid=0
            }
        },
    }
</script>

<style >
    .treeTable {
        margin-top: 15px;
    }

    .el-cascader-panel {
        height: 300px;
    }

    .el-cascader {
        width: 100%;
    }
</style>