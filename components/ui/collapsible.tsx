"use client"

import { Collapsible as CollapsiblePrimitive } from "radix-ui"

const Collapsible = CollapsiblePrimitive.Root //  顶层组件，用来包裹整个折叠组件

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger  //是折叠组件的 触发按钮

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent //  是 折叠的内容区域

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
