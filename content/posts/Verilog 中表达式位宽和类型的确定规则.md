---
title: Verilog 中表达式位宽和类型的确定规则
date: 2020-04-16T12:17:11+08:00
slug: expression-size-and-type-in-verilog
toc: true
categories:
  - SystemVerilog
tags:
  - SystemVerilog
  - Verilog HDL
  - 硬件描述语言
  - FPGA
---

本文主要转述和翻译了 [SystemVerilog 语言参考手册](https://ieeexplore.ieee.org/document/8299595)中 11.6 至 11.8 章节中的内容，以解释表达式的位宽和类型是如何确定和参与运算的，与 C 语言不同，Verilog 中的表达式在运算中必须考虑位宽与类型，同时还存在中间结果，其中又包含各种扩位和类型转换规则，深入的学习 Verilog 语言有必要了解这些以规避语法陷阱。本文主要针对 SystemVerilog，但对于 Verilog HDL，大部分规则也同样适用。

<!--more-->

## 背景知识

对于一个简单的运算，例如 `c = a + b`，`c` 称为左值（left-hand side，LHS），即被赋值的对象，而 `a + b` 为右值（right-hand side，RHS），这里 `+` 为操作符（operator），`a` 和 `b` 为操作数（operand），由于 `+` 连接了 `a` 和 `b` 两操作个数，因此 `+` 为二元运算符（binary operator），相应的，在表达式 `~a` 中，操作数只有一个 `a`，因此 `~` 为一元运算符（unary operator）。

## 表达式的位宽

表达式的位宽由操作数和语境决定，类型转换操作（`'`）可以被用来改变中间结果的位宽。控制表达式计算结果的位宽非常重要，有时计算结果很简单，例如两个 16 bit 变量进行与 `&` 操作，结果为 16 bit，然而，有时计算时采用的位宽和结果的位宽却不这么明确，例如 `a`、`b` 和 `c` 的位宽均不相同时 `c = a << b` 的结果。

### 表达式位宽的确定规则

表达式的位宽由操作数和表达式所在的上下文决定。

在 Verilog 中，表达式按照位宽的确定方式分为两类：

1. 第一类表达式为**自身决定**（self-determined）表达式，即表达式的位宽仅与自身有关，例如一个表示延迟值的表达式；
2. 第二类表达式为**语境决定**（context-determined）表达式，即表达式的位宽不仅由自身决定，还由包含了该表达式的整体表达式决定，例如赋值操作的右侧表达式位宽由其自身和左侧被复制变量的位宽决定。

下表中给出了自身决定表达式的位宽，表中 `i`、`j` 和 `k` 表示一个操作数的表达式，`L(i)` 表示表达式 `i` 的位宽，没有注明的操作数的位宽均为语境决定。

| 表达式                                                           | 位宽                                           |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| 无位宽常数                                                       | 与 `integer` 相同                              |
| 有位宽常数                                                       | 与给定位宽相同                                 |
| `i op j`，其中 `op` 为 `+` `-` `*` `/` `%` `&` `|` `^` `^~` `~^` | `max(L(i),L(j))`                               |
| `op i`，其中 `op` 为 `+` `-` `~`                                 | `L(i)`                                         |
| `i op j`，其中 `op` 为 `===` `!==` `==` `!=` `>` `>=` `<` `<=`   | 1 bit，运算前操作数位宽扩展到 `max(L(i),L(j))` |
| `i op j`，其中 `op` 为 `&&` `||` `–>` `<->`                      | 1 bit，所有操作数为自身决定                    |
| `op i`，其中 `op` 为 `&` `~&` `|` `~|` `^` `~^` `^~` `!`         | 1 bit，所有操作数为自身决定                    |
| `i op j`，其中 `op` 为 `>>` `<<` `**` `>>>` `<<<`                | `L(i)`， `j` 为自身决定                        |
| `i ? j : k`                                                      | `max(L(j),L(k))`，`i` 为自身决定               |
| `{i,...,j}`                                                      | `L(i)+..+L(j)`，所有操作数为自身决定           |
| `{i{j,..,k}}`                                                    | `i * (L(j)+..+L(k))`，所有操作数为自身决定     |

通过将乘法的结果赋值给足够宽度的变量，可以不丢失进位。严格来讲，赋值操作 `=` 不属于操作数，位宽的处理规则稍后进行介绍。

### 位宽的举例分析

在表达式的计算中，暂时的结果将会采用最大的操作数位宽（在赋值操作中，考虑最大位宽时包括了左侧被赋值变量），同时需要注意避免计算时的截断。

#### 例子 1

下面是一个操作数导致计算结果被截断的例子。

我们定义几个变量：

```verilog
logic [15:0] a, b, answer; // 16-bit variables
```

考虑下面的计算结果：

```verilog
answer = (a + b) >> 1; // will not work properly
```

我们的意图是当 `a` 和 `b` 相加时产生了溢出，为了在 16 bit 的结果中保留进位，整体右移一位。

但是此时出现了问题，由于所有的操作数都是 16 bit 位宽，因此表达式 `(a + b)` 的中间结果只有 16 bit，在进行移位操作之前就已经丢失了进位。

为了避免上述问题，需要在计算表达式 `(a + b)` 时至少使用 17 bit，例如在表达式中加入常数 `0`，这样表达式在计算时将会使用 `integer` 类型的位宽。下面的例子给出了符合预期的结果：

```verilog
answer = (a + b + 0) >> 1; // will work correctly
```

#### 例子 2

```verilog
module bitlength();
   logic [3:0] a, b, c;
   logic [4:0] d;

   initial begin
      a = 9;
      b = 8;
      c = 1;
      $display("answer = %b", c ? (a & b) : d);
   end
endmodule
```

`$display` 将会输出

```none
answer = 01000
```

表达式 `a & b` 本身的位宽为 4 bit，但是它又属于条件表达式的一部分，因此 `a & b` 的结果会使用最大位宽 5 bit，即 `d` 的位宽。

#### 例子 3

这是一个语境决定的例子：

```verilog
logic [3:0] a;
logic [5:0] b;
logic [15:0] c;
initial begin
   a = 4'hF;
   b = 6'hA;
   $display("a * b = %h", a * b); // expression size is self-determined
   c = {a ** b};                  // expression a**b is self-determined
                                  // due to concatenation operator {}
   $display("a ** b = %h", c);
   c = a ** b;                    // expression size is determined by c
   $display("c = %h", c);
end
```

仿真结果为：

```none
a * b = 16 // 'h96 was truncated to 'h16 since expression size is 6
a ** b = 1 // expression size is 4 bits (size of a)
c = ac61   // expression size is 16 bits (size of c)
```

## 有符号表达式

类型转换操作符 `'` 可以改变表达式的符号类型（有符号数或无符号数），除此以外，系统函数 `$signed` 和 `$unsigned` 也可以实现同样的效果，将输入表达式转换为符号类型不同，与输入相同宽度的一维压缩数组。

`$signed` 返回有符号值，`$unsigned` 返回无符号值，例如：

```verilog
logic [7:0] regA, regB;
logic signed [7:0] regS;

regA = $unsigned(-4);                 // regA = 8'b11111100
regB = $unsigned(-4'sd4);             // regB = 8'b00001100
regS = $signed (4'b1100);             // regS = -4
regA = unsigned'(-4);                 // regA = 8'b11111100
regS = signed'(4'b1100);              // regS = -4

regS = regA + regB;                   // will do unsigned addition
regS = byte'(regA) + byte'(regB);     // will do signed addition
regS = signed'(regA) + signed'(regB); // will do signed addition
regS = $signed(regA) + $signed(regB); // will do signed addition
```

## 表达式计算规则

### 表达式类型确定规则

下面是确定表达式结果类型的规则：

- 表达式类型只取决于操作数，与赋值操作左侧的被赋值变量无关（如果存在赋值操作）。
- 十进制数为有符号数。
- 进制表示的数字是无符号的，除非在进制（`b`、`d`、`h`、`o`）之前加 `s` 记号（例如 `4'sd12`）。
- 位选（bit-select）结果是无符号的，不论操作数是什么（例如 `a[0]`）。
- 部分选择（part-select）结果是无符号的，不论操作数是什么，即使选择了整个向量也是如此，例如：

```verilog
logic [15:0] a;
logic signed [7:0] b;

initial
   a = b[7:0]; // b[7:0] is unsigned and therefore zero-extended
```

- 连接结果是无符号的，不论操作数是什么（例如 `{a, b}`）。
- 比较和缩减运算符的结果是无符号的，不论操作数是什么（例如 `a < b`、`&a`）。
- 实数强制转换为整数的结果是有符号的。
- 自身决定操作数的符号和位宽由操作数自身决定，与表达式的其他部分无关。
- 对于语境决定操作数，采用下面的规则：
  - 如果任何操作数的类型为实数 `real`，那么结果为 `real`。
  - 如果任何操作数为无符号数，那么结果为无符号数，不论操作符是什么。
  - 如果所有的操作数都是有符号数，那么结果为有符号数，不论操作数是什么，除非另行指定（例如使用类型转换操作符 `'`）。

### 计算表达式的步骤

下面是计算表达式的步骤：

- 根据规则确定整体表达式位宽。
- 根据规则确定整体表达式符号。
- 向下传递整体表达式（或自身决定的子表达式）的类型和位宽到下层的语境决定操作数。通常，任何语境决定的操作数，和运算结果有相同的类型和宽度，但是有两个例外：
  - 如果运算结果的类型为 `real`，且其中有语境决定操作数的类型不是 `real`，该操作数将会被视作自身决定类型，然后在操作符执行前转换为 `real` 类型。
  - 关系和相等操作符中，有既不是全部自身决定，也不是全部是语境决定的操作数，那么这些操作数会被视为语境决定操作数，其类型和位宽（两个操作数的最大位宽）由他们的共同决定。然而，实际的结果类型永远是 1 bit 无符号数，操作数的类型和位宽与表达式的其他部分无关，反之亦然。
- 当传递到简单操作数时，该操作数将会被转换为传递的类型和位宽。如果操作数需要扩位，那么只有当传递的类型为有符号数时才会执行有符号扩位。

### 赋值操作的执行步骤

下面是赋值操作的执行过程:

- 通过上述规则确定表达式右值的位宽。
- 如果需要，扩展右值的位宽，当且仅当右值的类型为有符号数时执行有符号扩展。

### 有符号表达式中 X 和 Z 的处理

如果有符号操作数被扩位为更大位宽，并且符号位为 `x`，结果将会用 `x` 填充。如果符号位为 `z`，结果将会用 `z` 填充。如果有符号数的任何比特位为 `x` 或 `z`，那么非逻辑运算的结果将会为 `x`，符号类型和表达式类型一致。

### 计算规则的举例分析

```verilog
module demo();
   logic [2:0] regC;
   logic [3:0] regD;
   logic [7:0] regE;
   logic [15:0] regF;

   initial begin
      regC = 3'd7;
      regD = 4'b0001;
      regE = 8'b1000_0000;
      regF = 16'b0000_0000_0000_0000;
      regF = regF + ((regD << regC) & {16{regE[regC]}});
      $display("answer = %b", regF);
   end
endmodule
```

代码的输出结果为

```none
answer = 0000000010000000
```

上述例子来自 [Stack Overflow](https://stackoverflow.com/questions/23322737/verilog-shift-extending-result)，下面我们来分析上述表达式的结果，首先我们来确定整体表达式的位宽，就像剥洋葱一样，我们从表达式的最小单元进行分析。

参照上述表格中的规则，首先是移位运算 `regD << regC`，其结果的位宽由左操作数决定，即 `regD` 的位宽 8 bit，然后，考虑表达式 `((regD << regC) & {16{regE[regC]}}`，显然 `{16{regE[regC]}}` 的位宽为 16 bit，因此执行的结果为两侧操作数的最大位宽 16 bit，同样的，最后是 `regF + ((regD << regC) & {16{regE[regC]}})`，执行结果为两侧操作数的最大位宽，也是 16 bit，最后是赋值操作，由于左值和右值位宽一致，因此右值无需进行扩位。至此，我们得到了整体表达式位宽为 16 bit。

下一步，将整体表达式位宽 16 bit 向下传递到语境决定操作数，即对语境决定操作数进行扩为处理，在这里，唯一的自身决定操作数是移位运算中的右值 `regC`，它将不会被扩位。

类似地，表达式的符号也可以确定下来，按照相同的规则向下传递。由于存在至少一个无符号操作数，因此整个表达式的符号为无符号数，所有的有符号数会转换为无符号数处理，然后再进行运算。

因此，我们得到了实际的表达式计算过程：移位表达式 `regD << regC` 中 `regD` 会先扩展至 16 bit，然后进行移位（这里之所以是 16 bit，是由于整体表达式的位宽为 16 bit，而不是 `&` 操作符的右操作数为 16 bit），然后，进行 `&` 运算，再进行 `+` 运算，最后进行赋值操作。

如果你学习过其他主流语言，那么上述规则非常的复杂并且反直觉的，因此在实际的应用中，并不建议这样的写法，相反地，应该把复杂的表达式分割为子表达式，然后再合成最终结果。

## 参考资料

- [IEEE Standard for SystemVerilog–Unified Hardware Design, Specification, and Verification](https://ieeexplore.ieee.org/document/8299595)
- [hdl - Verilog shift extending result? - Stack Overflow](https://stackoverflow.com/questions/23322737/verilog-shift-extending-result)
