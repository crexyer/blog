---
title: 在 TeXstudio 中显示正确的中文括号
date: 2016-10-01T15:25:18+08:00
slug: show-correct-chinese-brackets-in-texstudio
aliases: /2016/10/01/show-correct-chinese-brackets-in-texstudio
categories:
  - LaTeX
tags:
  - LaTeX
  - TeXstudio
  - 编辑器
---

在 TeXstudio 中有一个 BUG，当一行里面存在中文括号的时候会使得光标和选中的文字变得不正常，这个问题已经有人[提出](http://bbs.pku.edu.cn/fox/bbs/bbstcon.php?board=MathTools&threadid=15632242)，但是并没有解决方案。经过查证，该问题是 TeXstudio 编辑器默认的 QCE 渲染模式导致的，修改渲染方式可以解决该问题。

<!--more-->

下面的示例文字，直接显示是没有问题的：

![TeXstudio QCE 渲染模式](/images/show-correct-chinese-brackets-in-texstudio/texstudio-qce-render-mode.png)

但是如果选择文字或者改变光标位置，则会出现各种光标错位，例如：

![TeXstudio 中文文本](/images/show-correct-chinese-brackets-in-texstudio/texstudio-chinese-text.png)

![TeXstudio 英文文本](/images/show-correct-chinese-brackets-in-texstudio/texstudio-english-text.png)

## 解决方案

这个 BUG 虽然不影响内容的输入，但是在选择文字的时候会造成一定的不便，可以按照下面的步骤修改渲染方式：

1. 菜单选择“选项”>“设置 TeXstudio”
2. 在弹出的窗口里面点击“显示高级选项”
3. 在左侧选择“高级编辑器”
4. 取消勾选“自动选择最佳显示选项”，并将渲染模式改为“单个字母”
5. 点击“确定”保存设置

![TeXstudio 设置](/images/show-correct-chinese-brackets-in-texstudio/texstudio-settings.png)

## 几种渲染方式的区别

默认的 QCE 渲染方式，存在光标位置的 BUG：

![TeXstudio 设置](/images/show-correct-chinese-brackets-in-texstudio/texstudio-chinese-text.png)

Qt 渲染模式，没有 QCE 模式的 BUG，但是本来设置的是 Consolas 字体变成了 Courier New：

![TeXstudio Qt 渲染模式](/images/show-correct-chinese-brackets-in-texstudio/texstudio-qt-render-mode.png)

单个字母渲染模式看起来和 QCE 模式一样，并且没有 QCE 模式的 BUG：

![TeXstudio 单个字母渲染模式](/images/show-correct-chinese-brackets-in-texstudio/texstudio-single-letter-render-mode.png)

因此，单个字母渲染模式是最佳的选项。
