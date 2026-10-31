/**
 * dsh-knj-menu Host 端（no-op）
 * ---------------------------------------------------------------
 * 本插件是纯 client bundle：菜单管理器完全运行在浏览器端（见 lib/client.js）。
 * Host 端无需任何逻辑；此文件只为让 cordis loader 能成功 import 本包的 "." 入口
 * （package.json 的 exports["."] 指向这里），否则会报
 * `ERR_PACKAGE_PATH_NOT_EXPORTED: No "exports" main defined`。
 */
export function apply() {}
