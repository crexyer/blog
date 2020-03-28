---
title: 使用 unicode-math 宏包时 \mathbb 黑板体字符的显示问题
date: 2019-06-21T23:16:14+08:00
slug: mathbb-show-different-chars-with-unicode-math-package
aliases: /2019/06/21/mathbb-show-different-char-with-unicode-math-package
categories:
  - LaTeX
tags:
  - LaTeX
  - 宏包
  - 数学
---

最近需要使用实数集数学符号 R 时，注意到在 LaTeX 中的显示方式有些奇怪，如下图所示，符号本应该是右边的空心字，但是却显示成为了左侧字体，经过查阅资料，该问题是由于 `unicode-math` 宏包加载的字体为 lmroman10-regular，该字体中的黑板体 R 确实为左侧字符，在没有使用 `unicode-math` 宏包的情况下，该字体由 `amssymb` 宏包提供，对应的字体文件为 msbm10，由于 Latin Modern 的字体样式与内置的数学字体符号不同导致了显示效果的差异。

<!--more-->

![黑板体字符](/images/mathbb-show-different-chars-with-unicode-math-package/blackboard-math-character.png)

## 解决方案

在未引入 `unicode-math` 宏包前重新定义 `mathbb` 为 `mathbbalt`，缺点是丢失了 Unicode Math 的特性，从 PDF 中复制出的字符为字母 R。

```tex
\documentclass{article}
\usepackage{amssymb}
\let\mathbbalt\mathbb
\usepackage{unicode-math}
% \let\mathbb\mathbbalt % UNIVERSAL RESET TO ORIGINAL \mathbb
\begin{document}
\begin{equation}
    \mathbb{R}\quad\mathbbalt{R} % OR JUST CALL ON INDIVIDUAL ORIGINAL GLYPHS
\end{equation}
\end{document}
```

另一种方案是为 \mathbb 更换字体，TeX Gyre Pagella Math 中提供了黑板体的支持，该方案不会丢失 Unicode Math 的特性。

```tex
\documentclass{article}
\usepackage{unicode-math}
\setmathfont{LatinModernMath-Regular}
\setmathfont[range=\mathbb]{TeXGyrePagellaMath-Regular}
\begin{document}
$\forall x \in \mathbb{R}$
\end{document}
```

上述代码产生下面的效果：

![TeX Gyre Pagella Math 字体](/images/mathbb-show-different-chars-with-unicode-math-package/tex-gyre-pagella-math.png)

## 参考资料

- [xetex - unicode-math but ordinary blackboard bold](https://tex.stackexchange.com/questions/360607/unicode-math-but-ordinary-blackboard-bold)
- [Pandoc 的 LaTeX 模板关于数学公式的设置问题？](https://d.cosx.org/d/419931-pandoc-latex)
- [tools - Is there such a thing as a font viewer](https://tex.stackexchange.com/questions/211959/is-there-such-a-thing-as-a-font-viewer)
