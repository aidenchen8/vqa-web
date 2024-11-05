export function parseCSVRow(row: any) {
  const columns = [];
  let currentColumn = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    // 如果遇到引号，且下一个字符也是引号，则视为转义引号
    if (char === '"' && row[i + 1] === '"') {
      currentColumn += '"';
      i++; // 跳过下一个引号
      continue;
    }

    // 开始或结束引号
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    // 如果不在引号内，且遇到逗号，则分割字段
    if (char === "," && !inQuotes) {
      columns.push(currentColumn);
      currentColumn = "";
      continue;
    }

    // 其他字符，直接添加到当前字段
    currentColumn += char;
  }

  // 添加最后一个字段
  columns.push(currentColumn);

  return columns;
}
