---
title: 使用 CircuiTikZ 绘制电路图
date: 2016-09-17T23:01:20+08:00
slug: draw-circuits-with-circuitikz
aliases: /2016/09/17/use-circuitikz-to-draw-circuits/
categories:
  - LaTeX
tags:
  - LaTeX
  - TikZ
  - CircuiTikZ
  - 电路
---

众所周知，LaTeX 中拥有强大的绘图宏包 [TikZ](https://www.ctan.org/pkg/pgf)，但是其并不能很好的支持电路图的绘制，而基于 TikZ 的 [CircuiTikZ](https://www.ctan.org/pkg/circuitikz) 宏包则包含了各种元器件的定义，并且样式和种类都非常丰富，使用它可以方便地绘制出各种电路图。

<!--more-->

## 一个简单的例子

首先在导言区引入宏包 circuitikz

```tex
\usepackage{circuitikz}
```

然后在正文加入

```tex
\begin{circuitikz}
    \draw (0,0) to[V=1V] (0,2)
        to[R=$1\Omega$] (2,2)
        to[C=1F] (2,0) -- (0,0);
\end{circuitikz}
```

生成 PDF 的效果

![我的第一个电路](/images/draw-circuits-with-circuitikz/my-first-circuit.png)

代码中使用 `\draw` 来表示绘制的开始，注意不要忘记最后的 `;`；`(0,0) to[V=1V] (0,2)` 表示绘制一个从点 `(0,0)` 到点 `(0,2)` 的电压源，`1V` 表示元件的标签，绘制后的元件会处于给定的两点的中央位置；`--` 表示直接用线将两点连接即短路，也可以用 `to[short]` 来代替。

总结起来，绘制的语法是 `(<坐标>) [<元件>] (<坐标>) [<元件>] (<坐标>) ...`，短路也可以看作是一种元件。

## 多个回路的情况

观察下面的例子

```tex
\begin{circuitikz}
    \draw (0,0) to[V=1V] (0,2)
        to[R=$1\Omega$] (2,2) -- (4,2)
        to[C=1F] (4,0) -- (0,0);
    \draw (2,2) to[L=1H, *-*] (2,0);
\end{circuitikz}
```

![两个回路](/images/draw-circuits-with-circuitikz/two-loops.png)

代码首先绘制了“电压源-电阻-电容”这条回路，然后再重新使用一个 `\draw` 命令绘制了电感，当然，也可以先绘制“电压源-电阻-电感”这条回路再绘制电容。

`(2,2) to[L=1H, *-*] (2,0)` 与上面的例子有些不同，连线变成了 `*-*`，这条命令可以绘制连接处的黑点。试试 `-*` 和 `*-`，它们分别表示只在起点和只在终点的黑点，而 `-o`、`o-` 和 `o-o` 则是空心点。

## 更多元器件和标注方式

```tex
\begin{circuitikz}
    \draw (0,0) to[I] (0,2);
    \draw (2,0) to[D] (2,2);
    \draw (4,0) to[vR] (4,2);
    \draw (6,0) to[lamp] (6,2);
    \draw (8,0) to[eC] (8,2);
\end{circuitikz}
```

![更多元件](/images/draw-circuits-with-circuitikz/more-components.png)

如上面所展示的，CircuiTikZ 宏包还提供了各种各样的元器件，这些都可以在[参考手册](http://mirrors.ctan.org/graphics/pgf/contrib/circuitikz/doc/circuitikzmanual.pdf)中找到。

对于元件的标注方式，下面的几种写法都是基本一致的

```tex
\draw (0,0) to[R=$1\Omega$] (0,2);
\draw (0,0) to[R, l=$1\Omega$] (0,2);
\draw (0,0) to[R, a=$1\Omega$] (0,2);
```

如果想让标签到另一侧，可以将 `l` 改成 `l_`，或者 `a` 改成 `a^`。而如果想在元件上添加两个标签，则可以用

```tex
\draw (0,0) to[R, l=$R_1$, a=$1\Omega$] (0,2);
```

![元件标签](/images/draw-circuits-with-circuitikz/component-labels.png)

这样标签就会分别位于元件的两侧，那么问题来了：如果我想让标签都在一侧怎么办？你可能会想到使用断行 `\\`

```tex
\draw (0,0) to[R, l={$R_1$\\$1\Omega$}] (0,2);

```

但是这样会报错，因为 CircuiTikZ 的 Label 并不支持多行，在这里推荐一种方法，用pbox宏包来解决这个问题。

在导言区加入

```tex
\usepackage{pbox}
\newcommand{\ctikzlabel}[2]{\pbox{\textwidth}{#1\\#2}} % 元件多行标签
```

上面的代码表示定义了 `\ctikzlabel` 命令，`\pbox` 具有两个参数，的第一个是指定盒子的最大宽度，使用当前的文本行宽 `\textwidth` 可以保证绝对够用，第二个参数是 `#1\\#2`，为标签两行的内容。与`\pbox` 类似的还有 parbox 宏包的 `\parbox` 命令，不过它的第一个参数定义的是盒子宽度而不是最大宽度，有时候会不好确定，因此推荐使用自动宽度的 `\pbox`。

这样我们就可以使用 `\ctikzlabel` 来定义在一侧的多行标签了，下面的代码就实现了这个效果

```tex
\begin{circuitikz}
    \draw (0,0) to[R, l=\ctikzlabel{$R_1$}{$1\Omega$}] (0,2);
\end{circuitikz}
```

![两侧元件标签](/images/draw-circuits-with-circuitikz/component-labels-on-both-sides.png)

如果想在某个指定的节点加入文字，可以使用

```tex
\begin{circuitikz}
    \draw (0,0) node[below]{Start}
        to[R, l=$R_1$]
        (0,2) node[above]{End};
\end{circuitikz}
```

![添加节点文字](/images/draw-circuits-with-circuitikz/add-node-name.png)

在坐标后添加 `node[<样式>]{<文字>}`，其中 `<样式>` 可以是位置（包括 left、right、above、below，它们可以组合使用）、颜色等，也可以省略，`<文字>` 是必选的。

## 多端元件

这里以典型的三端元件NPN三极管为例，通过下面的代码可以绘制出一个三极管

```tex
\begin{circuitikz}
    \draw (2,0) node[npn](transistor){};
    \draw (transistor.E) node[below]{E};
    \draw (transistor.C) node[above]{C};
    \draw (transistor.B) node[left]{B};
\end{circuitikz}
```

![NPN 三极管](/images/draw-circuits-with-circuitikz/npn-transistor.png)

通过 `node[npn](transistor){}` 来绘制一个三极管，`{}` 内的空白可以填写器件的名称，`(transistor)` 是为了方便调用元件坐标而设置的唯一名称，`\draw (transistor.E) node[below]{E}` 中的 `(transistor.E)` 是发射极E的坐标，`.E` 的名称是宏包已经定义的，不可以修改，这条命令只有起点没有终点，因此相当于在该点处添加了描述文字。如果想将元件连接某个引脚，把 `(transistor.E)` 当成坐标处理即可。

## 芯片的绘制

CircuiTikZ 只是提供了一些基本元件的模型，并没有绘制芯片的命令，因此，我们需要手工去完成这项工作

在导言区加入下面的代码用来调整字体大小和基准长度大小。基准长度为双极元件 bipole 的长度，其他元件的大小都是根据该长度缩放而来的，修改这个参数可以等比例改变所有元器件的大小。使用 relsize 红包来设置字体大小，在 LaTeX 中有 `\tiny, \scriptsize, \footnotesize, \small, \normalsize, \large, \Large, \LARGE, \huge, \Huge` 这几种字体大小，默认为 `\normalsize`，而参数 `-1` 和 `-2` 则是从 `\normalsize` 向左数的 `\small` 和 `\footnotesize`。

```tex
\usepackage{relsize} % 用于调整字体大小
\tikzset{
    pin/.style = {font = \relsize{-2}} % 引脚字体大小
}
\ctikzset{
    bipoles/length = 2em, % 基准元件大小
    font = \relsize{-1}, % 默认字体大小
}
```

下面是绘制NE555芯片的例子

```tex
\begin{circuitikz}
% U1 NE555
\draw [thick] (5.5,2) coordinate (u1) rectangle ++(2,3); % 外形
\draw [pin] (u1) ++ (0,0.5) coordinate (u1 con)
    node[right]{CON}
    node[above left]{5}; % CON
\draw [pin] (u1) ++ (0,1) coordinate (u1 tri)
    node[right]{TRI}
    node[above left]{2}; % TRI
\draw [pin] (u1) ++ (0,1.5) coordinate (u1 thr)
    node[right]{THR}
    node[above left]{6}; % THR
\draw [pin] (u1) ++ (0,2) coordinate (u1 dis)
    node[right]{DIS}
    node[above left]{7}; % DIS
\draw [pin] (u1) ++ (0,2.5) coordinate (u1 rst)
    node[right]{RST}
    node[above left]{4}; % RST
\draw [pin] (u1) ++ (1,3) coordinate (u1 vcc)
    node[below]{VCC}
    node[above left]{8}; % VCC
\draw [pin] (u1) ++ (1,0) coordinate (u1 gnd)
    node[above]{GND}
    node[below left]{1}; % GND
\draw [pin] (u1) ++ (2,2.5) coordinate (u1 out)
    node[left]{OUT}
    node[above right]{3}; % GND
\draw (u1) ++ (2,0)
    node[right]{\ctikzlabel{$U_1$}{NE555}}; % NE555P

% U1 NE555 引脚连接
\draw (u1 con) -- ++ (-1,0); % CON
\draw (u1 tri) -- ++ (-1,0); % TRI
\draw (u1 thr) -- ++ (-1,0); % THR
\draw (u1 dis) -- ++ (-1,0); % DIS
\draw (u1 rst) -- ++ (-1,0); % RST
\draw (u1 vcc) -- ++ (0,1); % VCC
\draw (u1 gnd) -- ++ (0,-1); % GND
\draw (u1 out) -- ++ (1,0); % OUT
\end{circuitikz}
```

![NE555](/images/draw-circuits-with-circuitikz/ne555.png)

首先，使用 `\draw [thick] (5.5,2) coordinate (u1) rectangle ++(2,3)` 来绘制芯片的矩形外框，`(5.5,2)` 为起点，`++(2,3)` 是相对坐标，在上一次的坐标基础上进行运算，因此最终坐标是 `(7.5,5)`，`coordinate (u1)` 相当于将 `(5.5,2)` 赋值给 `u1`，方便之后的相对坐标运算。

然后使用 `\draw [pin] (u1) ++ (0,0.5) coordinate (u1 con) node[right]{CON} node[above left]{5}` 来绘制一个引脚，我们将这条命令分开来看，`[pin]` 是在导言区中设置的字体大小样式，这样使得绘制出的芯片更加美观，`(u1) ++ (0,0.5)` 依然为相对坐标运算，计算的结果赋值给 `u1 con`，`node[]{}` 则是用于添加引脚名称，使用两条命令在不同的位置添加了两个标签。

`\draw (u1) ++ (2,0) node[right]{\ctikzlabel{$U_1$}{NE555}}` 同理，在芯片右下角添加了序号和型号。

`\draw (u1 con) -- ++ (-1,0)` 用来绘制引脚的引线，起点为 `(u1 con)`，终点为 `(u1 con)` 的坐标加上 `(-1,0)`，也是相对坐标运算。

由此可见，使用相对坐标的好处是如果需要变动芯片的位置，只需要改变 `(5.5,2)` 这个点就可以实现移动了，而不需要逐个修改引脚，大大提高了效率。
