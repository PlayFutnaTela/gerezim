main.js?ts=1764005591050:1175 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
index.js:591 Uncaught Error: Module not found: Can't resolve '@radix-ui/react-select'
  2 |
  3 | import * as React from "react"
> 4 | import * as SelectPrimitive from "@radix-ui/react-select"
  5 | import { Check, ChevronDown, ChevronUp } from "lucide-react"
  6 |
  7 | import { cn } from "@/lib/utils"

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./src/components/opportunities-store.tsx
    at <unknown> (https://nextjs.org/docs/messages/module-not-found)
    at getNotFoundError (file://C:\Projects\GEREZIM\frontend\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\parseNotFoundError.js:120:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async getModuleBuildError (file://C:\Projects\GEREZIM\frontend\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\webpackModuleError.js:102:27)
    at async (file://C:\Projects\GEREZIM\frontend\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\index.js:29:49)
    at async (file://C:\Projects\GEREZIM\frontend\node_modules\next\dist\build\webpack\plugins\wellknown-errors-plugin\index.js:27:21)
getServerError @ client.js:417
eval @ index.js:591
setTimeout
hydrate @ index.js:579
await in hydrate
pageBootrap @ page-bootstrap.js:24
eval @ next-dev.js:25
Promise.then
eval @ next-dev.js:23
./node_modules/next/dist/client/next-dev.js @ main.js?ts=1764005591050:192
options.factory @ webpack.js?ts=1764005591050:648
__webpack_require__ @ webpack.js?ts=1764005591050:37
__webpack_exec__ @ main.js?ts=1764005591050:1279
(anonymous) @ main.js?ts=1764005591050:1280
webpackJsonpCallback @ webpack.js?ts=1764005591050:1196
(anonymous) @ main.js?ts=1764005591050:9
websocket.js:46 [HMR] connected
client.js:2 ./src/components/ui/select.tsx:4:0
Module not found: Can't resolve '@radix-ui/react-select'
  2 |
  3 | import * as React from "react"
> 4 | import * as SelectPrimitive from "@radix-ui/react-select"
  5 | import { Check, ChevronDown, ChevronUp } from "lucide-react"
  6 |
  7 | import { cn } from "@/lib/utils"

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./src/components/opportunities-store.tsx
console.error @ client.js:2
window.console.error @ setup-hydration-warning.js:18
handleErrors @ hot-dev-client.js:141
processMessage @ hot-dev-client.js:214
eval @ hot-dev-client.js:55
handleMessage @ websocket.js:52
client.js:2 ./src/components/ui/separator.tsx:4:0
Module not found: Can't resolve '@radix-ui/react-separator'
  2 |
  3 | import * as React from "react"
> 4 | import * as SeparatorPrimitive from "@radix-ui/react-separator"
  5 |
  6 | import { cn } from "@/lib/utils"
  7 |

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./src/components/opportunities-store.tsx
console.error @ client.js:2
window.console.error @ setup-hydration-warning.js:18
handleErrors @ hot-dev-client.js:141
processMessage @ hot-dev-client.js:214
eval @ hot-dev-client.js:55
handleMessage @ websocket.js:52

Failed to compile
./src/components/ui/select.tsx:4:0
Module not found: Can't resolve '@radix-ui/react-select'
  2 |
  3 | import * as React from "react"
> 4 | import * as SelectPrimitive from "@radix-ui/react-select"
  5 | import { Check, ChevronDown, ChevronUp } from "lucide-react"
  6 |
  7 | import { cn } from "@/lib/utils"

https://nextjs.org/docs/messages/module-not-found

Import trace for requested module:
./src/components/opportunities-store.tsx
This error occurred during the build process and can only be dismissed by fixing the error.