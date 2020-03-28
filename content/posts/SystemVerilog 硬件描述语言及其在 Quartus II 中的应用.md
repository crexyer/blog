---
title: SystemVerilog 硬件描述语言及其在 Quartus II 中的应用
date: 2020-03-29T13:01:10+08:00
slug: systemverilog-with-quartus-ii
toc: true
categories:
  - SystemVerilog
tags:
  - SystemVerilog
  - Quartus II
  - 硬件描述语言
  - FPGA
---

本文摘录自 Altera 官方的[在线课程](https://www.intel.com/content/www/us/en/programmable/support/training/course/ochdl1125.html)，该课程的视频版本可以在[哔哩哔哩](https://www.bilibili.com/video/BV1M7411K7Ka)上观看。虽然该课程已经被翻译为了中文，但是翻译质量不高，因此本文在原稿的基础上进行了部分修改。

该课程主要介绍了 Quartus II 软件支持的 SystemVerilog 结构，包括：数组简化操作符、同等和不同等通配符、模块头封装导入、接口增强部分、类型转换、固定类型。

<!--more-->

## Quartus II 中的 SystemVerilog

### 学习目标

- 实现 SystemVerilog 数据类型和声明，例如，逻辑、类型定义和枚举类型等。
- 实现 SystemVerilog 过程块
- 实现包括 SystemVerilog 增强 case 声明在内的程序声明
- 使用 SystemVerilog 编码类型的状态机
- 使用 SystemVerilog 中的增强端口链接功能。

### SystemVerilog 简介

SystemVerilog 最初是于 2005 年作为 Verilog 语言扩展，用作 IEEE 标准，它支持所有的 Verilog 结构，而且它还结合了 Accellera 语言 Superlog 的可综合结构以及 Synopsys OpenVera 结构的验证构架。

2009年，SystemVerilog 与基本 Verilog 标准合并，成为一个标准，IEEE 标准 1800-2009。

与 Verilog 相比，SystemVerilog 在建模和验证上的抽象层次更高。SystemVerilog 增强语言提供更简明的硬件描述，而且还支持当前的硬件实现流程简单方便的使用现有工具，这种增强功能还为直接和约束随机测试台开发、覆盖驱动验证和基于声明的验证提供扩展支持。

## 数据声明和数据类型

本文涵盖了 SystemVerilog 的可综合结构，由 Altera 的 Quartus II 软件提供支持，如果能够基本理解 Verilog 语言，有助于学习 SystemVerilog。

本文介绍了下面的 SystemVerilog 结构：

- 数据声明和数据类型
- 过程块
- 程序声明
- 状态机设计和
- 增强端口连接

现在，让我们看一下 SystemVerilog 支持的数据声明和数据类型。

### 变量

![变量](/images/systemverilog-with-quartus-ii/variables.png)

Verilog 变量包括 `reg` 和整数类型。所有 Verilog 变量使用 4 个状态值。即，变量可以取值 0、1、x 或者 z。

SystemVerilog 还引入了其他数据类型，在变量和 net 类型上更加灵活。对于 Verilog reg 和整数类型，SystemVerilog 增加了 `bit`、`byte`、`int`、`logic` 和 `time`。`bit`、`byte` 以及 3 种形式的 `int`（`shortint`、`int` 和 `longint`）是 2 态数据类型。它们可以取值 0 或者 1，默认值是 0。

与 4 状态数据类型相比，2 状态数据类型仿真更快，占用的存储器资源更少。但是，2 状态数据类型在仿真时不一定能够精确地对硬件实现进行建模。

新的 SystemVerilog 类型 `logic` 和 `time` 是 4 状态数据类型，它们可以取值 0、1、x 或者 z，默认值是 x。

2 态和 4 态整数类型使用整数算术，可以是有符号也可以是无符号值。`bit`、`logic` `reg` 和 `time` 默认为无符号值。所有其他的都默认为有符号值。

### logic 数据类型

正如在前面的幻灯片所介绍的，SystemVerilog 引入了名为 `logic` 的新数据类型。`logic` 数据类型与 VHDL 中的信号数据类型相类似。新数据类型旨在避免与 Verilog 中 `reg` 数据类型相混淆。有时候会错误的将 `reg` 数据类型理解为应该在硬件中产生具有某一变量名的寄存器，需要说明的是，使用 `reg` 变量和 Verilog 中推断的硬件之间没有相关性，`reg` 变量的前后关系决定了推断组合逻辑还是时序逻辑。

出于这一原因，在大多数情况下，建议使用关键词 `logic` 来取代关键词 `reg` 和 `wire`。

在 SystemVerilog 中，作为综合的一般规则，在需要多个驱动器的地方，使用 `net` 或者 `wire`，而其他地方，则使用 `logic` 或者 `bit`。

```verilog
logic data_wire, data_reg;
always_comb
   case (sel)
      1'b0 : data_wire = datain;
      1'b1 : data_wire = ~datain;
   endcase
always_ff @(posedge clk)
   data_reg <= datain;
```

在这个例子中，2 个变量 `data_wire` 和 `data_reg` 被定义为数据类型 `logic`。在对 `data_wire` 赋值时，没有推断硬件寄存器。在对 `data_reg` 赋值时，推断了硬件寄存器。在后面的培训课程内容中，将介绍 SystemVerilog 过程块声明 `always_comb` 和 `always_ff`。

### 类型转换

Verilog 是宽松类型，因此在编译时并没有进行过多的类型检查。

SystemVerilog 的数据类型非常复杂，所以，它在类型转换上更加严格，并且提供了类型转换操作符 `'`（撇号），类型转换允许将某种类型的数值赋给另一种类型的变量。

```verilog
// casting to change size, no truncation warning
10'(x - 2)

// casting to type int
int'(2.0 * 3.0)

// casting to signed
signed'(x)

// casting to defined enum fruit
fruit'(0);
```

这里的四个例子列出了使用类型转换操作符的各种用法。第一个例子，将表达式 `x-2` 的大小改为 10 比特，这里不会产生截断警告。

第二个表达式将两个实数相乘的结果改为 `int` 类型。

第三个表达式将变量 `x` 转换为有符号变量。

最后，最后一个表达式将 `0` 转换为 `enum fruit` 中相应的数值。

### 自定义类型

SystemVerilog 还支持自定义的类型和枚举类型。自定义的类型支持用户使用 `typedef` 语句定义自己的数据类型。

```verilog
// define data type as unsigned integer
typedef int unsigned uint;
typedef logic [15:0] main_bus;
```

在上面的例子中，自定义了 2 个新的数据类型。第一个 `uint` 定义为无符号整数值。第二个用户类型定义为 `main_bus`。这一类型被定义为 16 个元素的 logic 类型。

```verilog
// enumerated type boolean
typedef enum bit {true, false} boolean;

// assign rdy as bool
boolean rdy;

assign eq_two = (datain == 2'b10) ? true : false;
```

枚举数据类型把对变量的赋值限制为一组特定的数值，在上面的例子中，一个新数据类型被定义为布尔类型。这是一个枚举数据类型，可以取值 `true` 和 `false`。

可以在定义一个类型之前就使用它，只要空 `typedef` 第一次能够把它识别为类型即可，例如：

```verilog
typedef int48; // full definition is elsewhere
int48 c;
```

### 自定义类型：结构体（Struct）

SystemVerilog 还支持结构体，它是变量以及定义为一个名称的常数的集合。在这个例子中，一个结构体包括名为 `even` 的逻辑数据类型，以及名为 `parity` 的逻辑数据类型，它含有 8 个元素，赋值给结构体的名称是 `par_struct`。

下面的代码定义了两个结构体，`par_in` 和 `par_out`，类型为 `par_struct`。

```verilog
// define the structure
typedef struct {
   logic       even
   logic [7:0] parity;
} par_struct;

par_struct par_in, par_out;    // 2 structures of par_struct

assign par_in = '{0,8'h80};    // assign values by position

assign par_out.even = 1'b1;    // assign even in par_out
assign par_out.parity = 8'h55; // assign parity in par_out
```

可以按照位置来对结构体中的元素进行赋值，如 `par_in` 的赋值语句所示，结构体的 `even` 比特被赋值 0，字节 `parity` 被赋值为十六进制数值 80。

而且，还可以对结构体中的元素单独进行赋值，如 `par_out` 赋值语句所示。

### 数组（Array）

数组是所有相同数据类型变量的集合。在 SystemVerilog 中，所有数据类型都可以声明为数组。可以通过数组名称以及数组索引来访问数组，通过模块端口来传递数组。

数组可以压缩，也可以不压缩，在声明中，压缩后的数组维度显示在数组名称的左侧，它可以是多维的，不压缩的数组维度显示在数组名称的右侧。

![数组](/images/systemverilog-with-quartus-ii/arrays.png)

在所示的实例代码中，名为 `data_mem` 的数组被定义为 2 维字节数组，字节是压缩后的逻辑数组。数组定义描述了存储器 256 输入深度的 4 个例化，例如 4 路高速缓存。在实例代码中定义了数组后，进行了两个赋值声明。

在第一个赋值声明中，更新了数组中的一个字节输入，第 100 行的例化数 1 被更新为 `8'h55`。

在第二个赋值声明中，存储器数组第二个例化中的 2 个邻近字节在输入 80 和 81 被更新。这一赋值中，类型转换操作符用于区分拼接操作，而不是拼接后作为 8 比特输入。

与 Verilog 存储器相似，数据类型（上例中为 `logic`）后面的维度设置了压缩后数组的大小，例化（上例中为 `data_men`）后的维度设置了未压缩数组的大小。如同 Verilog-2001，可以列出数组声明逗号分割表，列表中的所有数组都有相同的数据类型以及压缩数组维度。

SystemVerilog 使用术语 part-select，是指选择一维压缩数组的一个或者多个连续比特，这与 Verilog 中使用的术语 part-select 相一致。SystemVerilog 使用术语 slice，是指选择一个数组的一个或者多个连续元素，Verilog 只允许选择一个数组中的一个元素，对于这种选择并没有专门的术语。

SystemVerilog 提供新的系统函数 `$size`、`$dimension` 用于返回数组信息，请参考[语言参考手册](https://ieeexplore.ieee.org/document/8299595)了解这方面的详细信息。

### 数组简化方法

SystemVerilog 支持数组简化方法，例如 `sum`、`product`、`and`、`or`、以及 `xor`，可以把任何未压缩的数组简化为一个数值。

```verilog
byte data[2:0] = '{ 1, 3, 5 };
int result;

// calling reduction methods
assign result = data.sum;     //result becomes 9
assign result = data.product; //result becomes 15
assign result = data.and;     //bitwise and, result = 1
```

在这里给出的例子中，我的数组中有三个元素，第一个赋值操作符将所有元素的和赋值给结果，第二个操作符将结果设置为三个元素的乘积，而这里的第三个赋值操作符对所有元素进行位逻辑操作。

### 无位宽整数字面量（Un-sized Integer Literals）

```verilog
module sv_test #(parameter reg_width = 8)
      (input  clk,set,
       input  [reg_width-1:0] data_in,
       output [reg_width-1:0] data_out);
logic [reg_width-1 :0] data_reg;

always_ff @ (posedge clk, posedge set)
   if (set)
      data_reg <= '1; // automatically scales regardless of the value of reg_width
   else data_reg <= data_in;

assign data_out = data_reg;

endmodule
```

SystemVerilog 增加了设定无位宽单比特字面量的功能，该比特前缀 `'`（撇号），没有数基标志符（例如 `b`、`o`、`d` 和 `h`），等号左侧变量的所有比特都被设置为右侧指定的数值。

在这一示例代码中，采用一个参数来定义数据总线的宽度，在赋值后，无论 `data_reg` 的位宽是多少，它所有比特都被设置为 1。除此以外，还可以把左侧变量全部赋值为 `0`、`x` 或者 `z`，而 Verilog 没有以全 1 填充无位宽矢量的方法。

### 封装（Package）

封装是 SystemVerilog 中的扩展功能，支持多个设计模块共享自定义类型、参数、任务和函数。

```verilog
package global_defs;
   enum {idle, sop, data_pyld, crc, eop} pckt_state, nxt_pckt_state;
   typedef int unsigned uint;
   typedef logic [15:0] main_bus;
endpackage
```

在这个例子中，定义了名为 `global_defs` 的封装，其中包括了枚举数据类型以及其他 2 个自定义类型。

### 导入封装

在这里，我们可以通过三种方法来使用前面声明的封装中的内容。

![导入封装](/images/systemverilog-with-quartus-ii/importing-packages.png)

第一个例子里，在 `main_ctl` 的模块定义中，有一个 `in_bus` 输入端口，是封装中定义的 `main_bus` 类型。使用范围解析操作符 `::`（双冒号）可以引用在 `global_defs` 中定义的类型。

在中间的例子中，我们导入了封装 `global_defs` 中的所有内容，之后可以直接引用 `main_bus`。由于在导入时使用了通配符，因此可以使用封装中的所有定义。

在第三个例子中，我们在模块头中导入了封装。以这种方式导入时，`global_defs` 为局部作用域，即该封装只能在本模块内使用。

### 不支持的数据类型和特性

这是 SystemVerilog 提供的一些其他数据类型，目前 Quartus II 软件还不提供支持：

- 事件（Event）
- 联合体（Union）
- 类（Class）
- 队列（Queue）

详细信息请参考 SystemVerilog 语言参考手册。

## 过程块

现在，让我们看一下 SystemVerilog 过程块。

### Verilog 过程块的扩展

Verilog 提供名为 `always` 的通用过程块，SystemVerilog 扩展了这一通用过程块，以体现设计人员的意图。

Verilog 中的 `always` 块可以用于建立时序逻辑、组合逻辑和锁定逻辑。SystemVerilog 在 `always` 块上引入了 3 种扩展：

- always_ff
- always_comb
- always_latch

使用这些特殊的过程块，消除了 Verilog 通用 `always` 块的歧义，澄清了设计人员的意图。

理解了设计人员的意图后，综合器、仿真器以及 Lint 检查器和验证检查器等 EDA 工具现在可以更精确的完成其任务，工具之间具有很好的一致性。

### always_ff

使用 SystemVerilog `always_ff` 过程块，设计人员旨在使用软件工具对时序逻辑进行建模。

`always_ff` 块需要敏感列表，敏感列表中的每一信号必须由 posedge 或者 negedge 关键词进行声明，这告诉软件工具时钟信号的极性，以及在哪一信号边沿进行异步清零或置位。另外，`always_ff` 过程块的输出不能在其他过程块中进行赋值。

```verilog
always_ff @(posedge clk, posedge rst) begin
   if (rst)
      pckt_state <= IDLE;
   else
      pckt_state <= nxt_pckt_state;
```

### always_comb

使用 `always_comb` 过程块，设计人员旨在使用软件工具对组合逻辑进行建模，自动推断敏感列表，包括过程块读取的所有信号。

![always_comb 语句](/images/systemverilog-with-quartus-ii/always-comb.png)

由于 `always_comb` 是推断敏感列表的标准方法，因此所有软件工具会推断相同的敏感列表。敏感列表的自动推断，避免了列出不正确或者不完整的敏感列表，消除了设计人员留下的任何歧义。在上面的例子中，将推断出敏感列表中信号的 `pckt_state`、`pkt_rdy`、`end_of_data` 和 `crc_done`。此外，敏感列表中还包括了 `always_comb` 块调用的函数所使用的任何信号。

`always_comb` 过程块中任何方程左侧的变量都不能在其他过程块中赋值，这避免了使用组合逻辑以外方式的进行建模，例如意外地生成锁存器等情况，这也保证了所有软件工具遵守同样的建模规则。

在所有 `initial` 块和通用 `always` 模块被激活后，`always_comb` 块将在仿真的零时刻自动触发，保证了输出逻辑在零时刻与输入信号匹配。

### always_latch

使用 `always_latch` 过程，设计人员旨在使用软件工具对锁存器进行建模，软件工具将进行除了组合逻辑以外的检查。

```verilog
always_latch
   if (data_enable)
      data_out_lat <= data_in;
```

与 `always_comb` 过程块相似，`always_latch` 也会自动推断敏感信号。在上面的例子中，敏感列表包括数据使能信号以及数据输入信号，同样的，`always_latch`  语句中左侧的赋值操作不能在其他过程块中进行，在仿真的零时刻求值。

## 过程块声明

现在，让我们看一下过程块中的 SystemVerilog 声明。

### 递增和递减操作符

```verilog
// up/down counter
always_comb
   begin
      cntr = cntr_value;
      if (up)
         cntr++;
      else if (down)
         cntr--;
   end

always_ff @ (posedge clk, posedge rst)
   if (rst)
      cntr_value <= '0;
   else
      cntr_value <= cntr;
```

SystemVerilog 中的新特性是递增和递减操作符，在上面的例子中，我们有一个 up/down 计数器。当 `up` 信号出现时，计数器会递增 1，当 `down` 信号出现时，计数器会递减 1。

这些操作符的赋值方式为闭塞赋值，如果用在时序逻辑中，可能会产生竞争条件，例如，第二个过程块可能会在计数器值更新之前或之后读取，为避免竞争条件的出现，这些操作符只能用在组合逻辑中。

### 赋值操作符

除了自动递增和自动递减操作符，SystemVerilog 还提供了下面这些赋值操作符。

```verilog
always_comb begin
   alu_out = op_a;
   unique case (op_code)
      ADD   : alu_out +=   op_a; // alu_out = alu_out  +  op_a
      SUB   : alu_out -=   op_a; // alu_out = alu_out  -  op_a
      MUL   : alu_out *=   op_a; // alu_out = alu_out  *  op_a
      DIV   : alu_out /=   op_a; // alu_out = alu_out  /  op_a
      MOD   : alu_out %=   op_a; // remainder divided  by op_a
      B_AND : alu_out &=   op_a; // bitwise and'd with    op_a
      B_OR  : alu_out |=   op_a; // bitwise or'd with     op_a
      B_XOR : alu_out ^=   op_a; // bitwise xor'd with    op_a
      SL    : alu_out <<=  op_a; // logic shift left   by op_a
      SR    : alu_out >>=  op_a; // logic shift right  by op_a
      ASL   : alu_out <<<= op_a; // arith shift left   by op_a
      ASR   : alu_out >>>= op_a; // arith shift right  by op_a
   endcase
end
```

例如，`+=` 赋值操作符等价于该变量加另一变量后再赋值给该变量，赋值操作符支持加法、减法、乘法、除法、求余，`and`、`or`、`xor` 等位操作，以及逻辑和算术左右移位等操作。

### 对比操作符

Verilog 支持相等关系操作符（`==`），SystemVerilog 增加了相等通配符（`==?`）和不等通配符（`!=?`）的支持，该操作符把右侧操作数的 x 和 z 值作为匹配 0、1、z 或者 x 的通配符，但不将左侧操作数的 x 和 z 值作为通配符。

这些算子之间逐位进行对比，返回 1 比特结果。如果是 false，则返回 0，如果是 true 则返回 1。

```verilog
always_comb begin
   if (arg ==? condition)
      ...
   else
      ...
end
```

### 跳转（Jump）声明

SystemVerilog 还支持 Jump 声明，包括 `break`、`continue` 和 `return`，这些声明使得代码更直观简明。

`break` 会终结循环的执行，在执行流程再次遇到作为新声明的循环开始之前，不会再次执行。

`continue` 跳到循环的最后，执行循环控制，不需要增加 Verilog 禁止声明需要的 begin和 end 声明。

可以在任务或者函数的任何时间来执行 `return`，会立即退出任务或者函数。

### 块名标记

![匹配模块标记](/images/systemverilog-with-quartus-ii/block-names-1.png)

![匹配模块标记](/images/systemverilog-with-quartus-ii/block-names-2.png)

复杂代码会存在嵌套 if then else 结构，使用块名标记可以增强代码的可读性。SystemVerilog 支持在 `begin` 和 `end` 使用块名标记，该标记将匹配 `begin` 和 `end` 之间的代码，且两处的块名标记必须相同。

在这个例子中，块名标记用于识别在 `begin` 和 `end` 之间 `cntr_reg` 块内的代码和 `ram_val_reg` 块内的代码的。同时，块名标记`write_registers` 用于识别 `always_comb` 过程块中的所有模块代码。

Quartus II 软件能够检测到所有不匹配的块名标记，产生综合错误。

### 增强 case 语句

Verilog 标准定义了按照 `case` 声明出现的顺序执行代码，这种推断优先级的方式与 if then else 的结构相似。SystemVerilog 为 `case`、`casex` 和 `casez` 声明提供特殊的修饰语 `unique` 和 `priority`。

利用 `unique` 修饰语，设计人员告诉综合工具，在 `case` 声明中没有优先级，代码可以并行执行，从而使得综合和仿真工具在没有优先级的条件下进行优化。

在下面的的例子中，采用了 `unique` 修饰语，只有一个条件与输入匹配，仿真或综合工具不会推断优先级。

```verilog
// equivalent to full_case and parallel_case
always_comb
   unique case (addr[7:6])
      2'b00 : dma_ch_cs    = 1'b1;
      2'b01 : strt_addr_cs = 1'b1;
      2'b10 : dma_cnt_cs   = 1'b1;
      2'b11 : dma_ctrl_cs  = 1'b1;
   endcase
```

`priority` 修饰语表明，考虑同时有多个分支选择表达式为 `true` 时的情况，且优先执行第一个为  `true` 的分支的表达式。

在下面的例子中，可以有 1 个以上的分支为 `true`，通过使用 `priority` 修饰语，指示了声明的顺序表示执行的优先级。

```verilog
// equivalent to full_case
always_comb
   priority case (irg_in)
      irq_in[0] : irq_level = 3'b000;
      irq_in[1] : irq_level = 3'b001;
      irq_in[2] : irq_level = 3'b010;
      default   : irq_level = 3'b111;
   endcase
```

## 状态机设计

现在，让我们看一下使用 SystemVerilog 结构的状态机设计。

### 设计指南

这里列出了一些指南，适用于所有的状态机，无论采用何种语言对状态机进行编程。

1. 为状态机输出设置默认值。
2. 将状态机逻辑从算术函数、数据通路、输出数值中分离出来。
3. 如果设计中含有多个状态使用的操作，那么在状态机之外定义操作，然后在状态机的输出逻辑中使用这些数值。

### 设计指南：复位

为保证状态机能够正确的从复位状态中恢复，建议在 FPGA 设计中使用下面的复位电路，这一电路为系统触发器提供异步置位和同步解除置位的复位信号，在 FPGA 中异步清除或者置位。

![状态机设计指南：复位信号](/images/systemverilog-with-quartus-ii/state-machine-guidelines-resets.png)

如图所示，当低电平有效的异步复位信号 `rst_async_n` 变为低电平时，将导致触发器清零，使得连接至 `rst_sync_n` 的系统触发器清零。然后，当 `rst_async_n` 解除置位（变为高电平）时，第一个触发器对输入的 VCC 信号进行同步，再经过第二个触发器同步后移除复位信号。这样，Quartus II 软件的 TimeQuest 时序分析工具能够准确的测量系统触发器的恢复和移除时序。

```verilog
module reset_gen (
   output rst_sync_n,
   input  clk, rst_async_n);

logic rst_s1, rst_s2;

always_ff @ (posedge clk, negedge rst_async_n)
   if (~rst_async_n) begin
      rst_s1 <= 1'b0;
      rst_s2 <= 1'b0;
      end
   else begin
      rst_s1 <= 1'b1;
      rst_s2 <= rst_s1;
      end
assign rst_sync_n = rst_s2;
endmodule
```

如代码所示，上述复位电路可以在 SystemVerilog 中实现：程序例化 2 个触发器 `rst_s1` 和 `rst_s2`，由输入信号 `rst_async_n` 将其异步清零，当输入复位信号解除置位时，触发器会同步移除复位 `rst_sync_n` 信号。

### 枚举类型的状态机编码

状态机中使用的状态变量采用 SystemVerilog 枚举数据类型，下面有 4 个定义状态变量的例子：

```verilog
// default signed int (2-state)
enum {IDLE, SOP, DATA_PYLD, CRC, EOP} pckt_state, nxt_pckt_state;

// forcing to unsigned int (2-state)
enum int unsigned {IDLE, SOP, DATA_PYLD, CRC, EOP}
   pckt_state, nxt_pckt_state;

// enum data type set to logic (4-state)
enum logic [2:0] {IDLE, SOP, DATA_PYLD, CRC, EOP}
   pckt_state, nxt_pckt_state;

// enum data type set to logic; state assignments set to one-hot
enum logic [4:0] {IDLE      = 5'b00001,
                  SOP       = 5'b00010,
                  DATA_PYLD = 5'b00100,
                  CRC       = 5'b01000,
                  EOP       = 5'b10000} pckt_state, nxt_pckt_state;
```

在第一个例子中，采用了默认数据类型 `int`。这定义了 32 比特符号 `int` 数据类型。

第二个例子对此进行完善，定义为无符号数据类型。需要注意的是，`int` 数据类型是 2 态变量，只能取值 0 和 1，2 态数据类型保存在仿真存储器中，有助于让仿真运行的更快，但是，不一定能正确的反应硬件仿真，隐藏了设计问题。

在第三个例子中，状态变量定义了一个矢量化数据类型 `logic`。

第四个例子描述了状态机变量编码定义，但是 Quartus II 软件默认为自动编码，会忽略这些赋值，除非 State Machine Processing 设置由 Auto 变为 User-Encoded 或者其他选项之一。

### 设置状态机编码

从 Quartus II 软件中，可以控制状态机变量编码。在 Quartus II 软件的 Assignments 菜单中，找到 Settings，在 Analysis & Synthesis 部分，点击 More Settings。

![Quartus 软件 Analysis & Synthesis 设置](/images/systemverilog-with-quartus-ii/quartus-analysis-and-synthesis.png)

向下滚动到 State Machine Processing，该选项的设置默认为 Auto，工具会确定状态机变量的状态编码，可以修改为其他选项，例如 Gray、Johnson、Minimal Bits、One-Hot、Sequential 和 User-Encoded。

![Quartus 软件 State Machine Processing 设置](/images/systemverilog-with-quartus-ii/state-machine-processing.png)

### 状态机编码类型

下面是一个使用 SystemVerilog 结构状态机的例子。

```verilog
enum logic [2:0] {IDLE, SOP, DATA_PYLD, CRC, EOP} pckt_state,
   nxt_pckt_state;

always_ff @ (posedge clk, posedge rst)
   if (rst)
      pckt_state <= IDLE;
   else
      pckt_state <= nxt_pckt_state;

always_comb begin
   nxt_pckt_state = pckt_state;
   unique case (pckt_state)
      IDLE      : if (pkt_rdy)     nxt_pckt_state = SOP;
      SOP       :                  nxt_pckt_state = DATA_PYLD;
      DATA_PYLD : if (end_of_data) nxt_pckt_state = CRC;
      CRC       : if (crc_done)    nxt_pckt_state = EOP;
      EOP       :                  nxt_pckt_state = IDLE;
   endcase
end
// output assignments follow
assign sop_state = (pckt_state == SOP);
```

枚举数据类型使用了 `logic` 数据类型定义状态机变量，变量 `pckt_state` 和 `nxt_pckt_state` 可以取值 `IDLE`、`SOP`、`DATA_PYLD`、`CRC` 和 `EOP`。

状态机的时钟部分使用了 SystemVerilog 过程块 `always_ff`，告诉综合和仿真工具，设计人员的目的是实现时序逻辑。

状态机的下一状态逻辑使用了过程块 `always_comb`，目的是推断组合逻辑，采用了 `unique` 关键词来修饰 `case` 语句，这告诉综合和仿真工具，无需推断 `case` 声明的优先级。

最后，在状态转移和判断转移条件的组合逻辑之外进行输出赋值。

## 增强端口连接

在本文的最后一部分，我们看一下怎样简单实现端口连接，而且不容易出错。

### 模块端口连接

Verilog 语言提供两种语句类型将模块端口连接起来：顺序端口连接和命名端口连接。

顺序端口连接使用端口在模块声明中的位置，不需要知道名称，简单的由端口位置进行连接。在进行端口连接时，需要知道端口位置是个很大的缺点，该方法比较容易出错，而且如果改变了端口声明，还需要不断进行修改，很难理解设计的目的。

命名端口连接需要模块声明命名的端口以及连接端口的网络名称，使用这一方法，不容易出现连接错误，不需要知道端口位置，只知道端口名称就可以。该方法的缺点是它比较繁琐，必须为每一端口列出端口名称和端口连接。

SystemVerilog 进行了三项改进：`.name` 约定、`.*` 约定和接口，从而简化了网表。

### 隐式 .name 端口连接

SystemVerilog `.name` 约定提供了简明的方法来进行连接，不需要知道端口顺序。它利用了很多端口连接使用与网络相同的名称作为端口连接这一事实，SystemVerilog 语句列出端口名称，推断相同名称的连线进行连接。端口名称和大小必须匹配才能实现正确的连接，当名称与网络名称不匹配时，需要使用 Verilog 的端口命名约定。

```verilog
mem_port my_mem(
   // use systemverilog .name convention
   .clk,
   .rst,
   .addr,
   .data_in,
   .data_out,
   .wr,
   .rd,
   // use verilog port naming convention
   .mem_data1(ram_data),
   .mem_data2(flash_data));
```

在上面的例子中，端口名称 `clk`、`rst`、`addr`、`wr`、`rd` 和 `data_in` 和 `data_out` 在名称和宽度上与网络相匹配，因此，推断出连接。为了将端口 `mem_data1` 和 `mem_data2` 连接至命名为 `ram_data` 和 `flash_data` 的网络，需要使用 Verilog 端口命名约定。

### 隐式 .* 端口连接

SystemVerilog 还提供了 `.*` 端口约定以简化连接模块，使用这一约定，会自动连接在模块声明中定义的具有相同连线名称的所有端口名称，如果名称不一致，使用 Verilog 端口命名约定。

```verilog
mem_port my_mem(
   // use systemverilog .star convention
   .*,
   // use verilog port naming convention
   .mem_data1(ram_data),
   .mem_data2(flash_data));
```

上面的例子中可以看出，进行端口连接非常简单，不容易出错，综合和仿真工具自动连接在名称和宽度上与网络相匹配的模块 `mem_port` 上的所有端口。在这个例子中，使用传统的 Verilog 端口命名约定，确保端口 `mem_data1` 和 `memdata2` 连接至 `ram_data` 和 `flash_data`。

### 通过模块端口传递任意数据类型

Verilog 在端口接收侧只允许 `wire` 数据类型连接，端口的发送侧则只允许 `wire`、`reg` 和 `integer` 类型，通过模块端口传送任何维度的未压缩数组也是非法的。

SystemVerilog 扩展了对其他数据类型的支持，可以通过模块端口进行传送，支持通过模块端口传送任何维度的数组，或者作为变量传送至任务/函数。

```verilog
typedef struct packed {
   logic [11:0] attrib;
   logic [19:0] address;
} tlb;

module tlb_ram (
   output tlb tlb_out,
   input logic [5:0] tlb_addr,
   input logic wr, rd,
   input tlb tlb_in);
```

在这个例子中，建立了一个名为 `tlb` 的结构体，然后将 `tlb` 类型的输出和输入结构定义为 `tlb_out` 和 `tlb_in`，采用 SystemVerilog，可以通过模块端口连接来传递结构体。

### Verilog 总线模块连接

![Verilog 总线模块连接](/images/systemverilog-with-quartus-ii/verilog-bus-module-connections.png)

这一例子中的结构图显示了两个总线主机，以及 4 个从机接口，通过互联架构进行了连接。

顶层的代码片段使用标准 Verilog 端口命名约定进行连接，在其他总线主机以及从机接口上进行连接需要编写相同的冗长代码。使用 SystemVerilog `.name` 端口约定，这要简单一些，不太容易出错。

而 SystemVerilog 为了使连接更方便且不容易出错，引入了一个新端口类型：接口（Interface）。

### SystemVerilog 总线模块连接

![SystemVerilog 总线模块连接](/images/systemverilog-with-quartus-ii/systemverilog-bus-module-connections.png)

采用 SystemVerilog 接口，大大简化了模块连接，将连线集中在一起形成模块之间的一个连接。模块之间的连接被定义为接口，然后使用 SystemVerilog `.name` 端口命名约定，简单的完成模块之间的连接。

### 接口（Interface）

利用接口，可以将多路信号和其他功能绑定在一起，减少了连线代码，避免了与它相关的错误。接口中可以使用任意信号类型，但是强烈建议使用 `logic` 类型，这是因为它与过程赋值和连续赋值相一致。对于双向信号以及具有多个驱动的信号，使用数据类型 `wire`。

当把接口设定为模块端口时，可以选择将其声明为数组，进一步简化了类型，与接口相关的任务和函数这一特性同样适用于测试文件。

### 定义接口

```verilog
interface my_bus; // define interface
   logic wr;
   logic rd;
   logic sel;
   logic [7:0] addr;
   logic [31:0] data_in;
   logic [31:0] data_out;
   logic berr;

   // Add master & slave views to the interface
   modport master (input data_out, berr,
                   output wr, rd, sel, addr, data_in);

   modport slave  (input wr, rd, sel, addr, data_in,
                   output data_out, berr);
endinterface
```

上面的例子定义了 SystemVerilog 接口，总线信号 `wr`、`rd`、`sel`、`addr`、`data_in`、`data_out` 和 `berr` 被定义为接口 `my_bus`，构成接口的信号可以包括任意的 Verilog 或者 SystemVerilog 变量类型、线网类型或自定义类型，正如前文所述，建议的类型是 `logic`。

在这一接口声明中，定义了两种不同视角的接口：主机视角和从机视角。在接口声明中使用关键词 `modport` 定义模块端口连接是主机还是从机，并使用 `input` 和 `output` 定义了端口方向。

在这一例子中，主机将驱动控制信号 `read`、`write`、`select` 和 `address` 以及数据输入 `data_input` 总线，从机接口将驱动数据输出总线以及总线错误信号。

### 在模块端口中使用接口

```verilog
// fabric module
// two slave interfaces connecting to cpu and usb master ports
// four master ports connecting to slave memory and usb slave
// port
module fabric (
   input logic clk,
   my_bus.slave cpu_bus, usb_bus, // slave view

   my_bus.master sram_mbus, dram_mbus, // master view
          flash_mbus, usb_mbus);

// make connections to the sram bus
// reference interface ports
   always_ff @ (posedge clk)
      if (cpu_bus.sel && cpu_bus.addr[7:6] == 2'b00)
         sram_mbus.sel <= '1;
      else
         sram_mbus.sel <= '0;
```

在这个例子中，展示了使用接口的模块架构：在 `my_bus` 从机视角有 `cpu_bus` 和 `usb_bus` 这 2 个总线连接，在 `my_bus` 主机视角有 SRAM、DRAM、Flash 和 USB 控制器这 4 个总线连接。当引用接口中的信号时，使用 `.name` 语句。

代码定义了 `sram_mbus.sel` 信号是接口主机视角的输出，当 CPU 总线接口的输入选择信号有效，相应的地址比特出现在总线接口上时，选择信号出现在连接至 SRAM 的主机端口上。

### 例化接口

```verilog
// top module
// instantiating interfaces and fabric and other modules
module top ( ... );

my_bus cpu_bus();
my_bus usb_sbus();
my_bus sram_bus();
my_bus dram_bus();
my_bus flash_bus();
my_bus usb_mbus();

fabric i1 (.clk, .cpu_bus(cpu_bus.slave), .usb_bus(usb_sbus.slave),
           .sram_bus(sram_bus.master), .dram_bus(dram_bus.master),
           .flash_bus(flash_bus.master), .usb_mbus(usb_mbus.master));

...
...
endmodule
```

现在，让我们看一下怎样例化接口，它们怎样连接至互联模块：

- 在这里的顶层模块中，首先声明并例化了 6 个 `my_bus` 接口，这对应于通过互联模块的 4 个从机和 2 个主机连接。
- 然后，例化互联模块时，对于每一实例，以正确的视角设置端口接口名称（例如 `.cpu_bus`）以及例化的接口（例如 `cpu_bus.slave`）。
- 当然，这一例化并没有完成，我们需要将这些 6 个接口的另一端连接至这些组件相应的模块。

## 参考文档

如果还有其他问题，或者希望详细了解 SystemVerilog，请阅读这些参考文档：

- [Quartus II Help](https://www.intel.com/content/www/us/en/programmable/quartushelp/current/index.htm)
- [IEEE Std 1800-2017: Standard for SystemVerilog](https://ieeexplore.ieee.org/document/8299595)
- *SystemVerilog For Design, Second edition*, Sutherland, Davidmann, & Flake, 2010
- SystemVerilog 3.1a Language Reference Manual（Accellera）
- [Verification Methodology Manual（VMM）](http://vmm-sv.org/universal)
- [Universal Verification Methodology（UVM）](http://uvmworld.org/)

请参考 Quartus II 帮助，了解所支持以及不支持的 SystemVerilog 结构的完整列表。

请咨询 Mentor、Synopsys 或者 Cadence，参考 SystemVerilog 的验证特性。

## 更多培训课程

如果需要有关 FPGA 和系统设计的教师指导课程、虚拟课程或者在线培训课程的详细信息，请访问 [www.altera.com/trainig](https://www.altera.com/trainig)。

## Altera 技术支持

这是 Altera 提供的一些其他资源：

- Quartus II 软件在线帮助
- [Quartus II handbook](https://www.intel.com/content/www/us/en/programmable/products/design-software/fpga-design/quartus-prime/support.html)
- 在 [World-wide Web](http://www.altera.com/) 上查找有关问题的知识库文章，下载文档，浏览设计实例和在线课程
- [MySupport](http://www.altera.com/mysupport)
- 现场技术支持工程师请联系当地的销售部门
- [Altera Wiki](http://www.alterawiki.com/)
- [Altera Forum](http://www.alteraforum.com/)
- [Intellectual Property Support](http://www.altera.com/support/ip/ips-index.html)

其中特别推荐 Altera Wiki 和 Altera Form 网站，在这里可以找到很多用户带来的信息和参考设计，有助于解答可能遇到的问题。

## 参考资料

- [SystemVerilog 和 Quartus II 软件（Chinese Version of SystemVerilog with the Quartus II Software）](https://www.intel.com/content/www/us/en/programmable/support/training/course/ochdl1125.html)
- [Verilog, The Next Generation: Accellera’s SystemVerilog](https://sutherland-hdl.com/papers/2002-HDLCon-paper_SystemVerilog.pdf)
