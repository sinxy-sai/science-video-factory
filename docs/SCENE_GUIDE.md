# 场景指南

每个场景由以下内容组成：

- `title`：一句可读的场景标题。
- `claim`：这一场景要让观众记住的知识主张。
- `visual`：已注册的视觉类型。
- `durationInFrames`：整数帧数，和 episode 的 fps 一起决定时长。
- `supportingText`：补充说明，可省略。

可用视觉类型：

- `title`：提出问题或建立概念。
- `spectrum`：组成、范围或连续变化。
- `scattering`：路径、扩散或过程。
- `connection`：节点、连接或网络关系。
- `comparison`：两个状态或两个量的比较。
- `transformer-tokens`：Transformer 的 token 输入和输出。
- `transformer-attention`：Self-Attention 的上下文连接。
- `transformer-parallel`：token 的矩阵化并行计算。
- `transformer-stack`：Attention、前馈网络和多层 block 堆叠。
- `summary`：把前面的关系收束为结论。

新增视觉类型时，同时更新 `content/schema.ts`、`SceneRenderer.tsx` 和本文件。
