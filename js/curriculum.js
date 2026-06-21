// 高中数学知识树（人教版必修+选修结构）。
// gen: 对应 generators.js 中的题目生成器 key；有 gen 的知识点可练习，无则为"规划中"。
const CURRICULUM = [
  { id:"m1", tag:"必修一", name:"集合与函数", chapters:[
    { name:"集合", skills:[
      {id:"set_op", name:"集合的运算", gen:"set_op"},
      {id:"set_rel", name:"集合的关系", gen:null},
    ]},
    { name:"函数概念与性质", skills:[
      {id:"func_domain", name:"求函数定义域", gen:"func_domain"},
      {id:"func_parity", name:"奇偶性判断", gen:"func_parity"},
      {id:"func_mono", name:"单调性", gen:"func_mono"},
    ]},
    { name:"基本初等函数", skills:[
      {id:"exp_log", name:"指数与对数运算", gen:"exp_log"},
      {id:"log_compare", name:"对数比较大小", gen:"log_compare"},
    ]},
  ]},
  { id:"m2", tag:"必修一", name:"二次函数与方程", chapters:[
    { name:"二次函数", skills:[
      {id:"quad_vertex", name:"顶点与最值", gen:"quad_vertex", viz:"quad"},
      {id:"quad_roots", name:"求根与判别式", gen:"quad_roots"},
    ]},
  ]},
  { id:"m4", tag:"必修四", name:"三角函数与向量", chapters:[
    { name:"三角函数", skills:[
      {id:"trig_value", name:"特殊角的三角函数值", gen:"trig_value"},
      {id:"trig_graph", name:"正弦型函数图像", gen:null, viz:"trig"},
      {id:"trig_id", name:"三角恒等变换", gen:"trig_id"},
    ]},
    { name:"平面向量", skills:[
      {id:"vec_dot", name:"向量数量积", gen:"vec_dot"},
      {id:"vec_coord", name:"坐标运算", gen:"vec_coord"},
    ]},
  ]},
  { id:"m5", tag:"必修五", name:"数列与不等式", chapters:[
    { name:"数列", skills:[
      {id:"arith_seq", name:"等差数列", gen:"arith_seq"},
      {id:"geo_seq", name:"等比数列", gen:"geo_seq"},
      {id:"seq_sum", name:"数列求和技巧", gen:"seq_sum"},
    ]},
    { name:"不等式", skills:[
      {id:"ineq_quad", name:"一元二次不等式", gen:"ineq_quad"},
      {id:"ineq_mean", name:"基本不等式", gen:"ineq_mean"},
    ]},
  ]},
  { id:"s1", tag:"选修", name:"导数及其应用", chapters:[
    { name:"导数", skills:[
      {id:"deriv_poly", name:"多项式求导", gen:"deriv_poly"},
      {id:"deriv_tangent", name:"切线方程", gen:"deriv_tangent"},
      {id:"deriv_mono", name:"用导数判单调性", gen:"deriv_mono"},
    ]},
  ]},
  { id:"s2", tag:"选修", name:"解析几何", chapters:[
    { name:"直线与圆", skills:[
      {id:"line_dist", name:"点到直线距离", gen:"line_dist"},
      {id:"circle_eq", name:"圆的方程", gen:"circle_eq"},
    ]},
    { name:"圆锥曲线", skills:[
      {id:"ellipse", name:"椭圆", gen:"ellipse"},
      {id:"parabola", name:"抛物线", gen:"parabola"},
      {id:"hyperbola", name:"双曲线", gen:"hyperbola"},
    ]},
  ]},
  { id:"s3", tag:"选修", name:"概率与统计", chapters:[
    { name:"计数与概率", skills:[
      {id:"perm_comb", name:"排列组合", gen:"perm_comb"},
      {id:"prob_basic", name:"古典概型", gen:"prob_basic"},
      {id:"distribution", name:"随机变量分布", gen:null},
    ]},
  ]},
  { id:"s4", tag:"选修", name:"立体几何与复数", chapters:[
    { name:"立体几何", skills:[
      {id:"solid_vol", name:"体积与表面积", gen:"solid_vol"},
      {id:"solid_angle", name:"空间角", gen:null},
    ]},
    { name:"复数", skills:[
      {id:"complex_op", name:"复数运算", gen:"complex_op"},
    ]},
  ]},
];

// 扁平化所有 skill，便于查找
const SKILLS = {};
CURRICULUM.forEach(m=>m.chapters.forEach(c=>c.skills.forEach(s=>{
  SKILLS[s.id]={...s, module:m.name, chapter:c.name, tag:m.tag};
})));
