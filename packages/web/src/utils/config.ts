import { ElMessage } from "element-plus";

export const BASE_URL = import.meta.env.BASE_URL;
export const API_PREFIX = import.meta.env.API;

export const userImageMap: Record<string, string> = {
  a1: "/training-image_2a",
  a2: "/training-image_2a",
  b1: "/training-image_2b",
  b2: "/training-image_2b",
  c1: "/training-image_2c",
  c2: "/training-image_2c",
  val: "/validation-image_2",
};

export const IMG_FOLDER_PATH = BASE_URL + "/Rope3D"; // 全局变量，用于存储文件夹地址

export const BOX_PATH = BASE_URL + "/Rope3D/training/label_2"; // 全局变量，用于存储边界框地址

/**
 * 获取文件路径
 * @param role 用户角色
 * @param type 获取的文件类型 "img" | "box"
 * @returns path 文件夹路径
 */
export function getFilePath(roles: string[], type: "img" | "box") {
  const role = roles.find((e) => Object.keys(userImageMap).includes(e));
  if (!role) {
    console.error("未找到角色");
    ElMessage("未找到角色，请联系管理员");
    return "";
  }
  if (type === "img") {
    return IMG_FOLDER_PATH + userImageMap[role];
  } else if (type === "box") {
    if (role === "val") return BASE_URL + "/Rope3D/validation/label_2";
    return BOX_PATH;
  }
}
