import Papa from "papaparse";

export interface TableRow {
  question: string;
  questionTranslation: string;
  answer: string;
  vgGuide: string;
  vgGuideTranslation: string;
}
export function parseCSVRow(
  file: File,
  callback: (dataMap: Record<string, TableRow[]>, indexArray: string[]) => void
) {
  Papa.parse(file, {
    complete: (results: any) => {
      const rows = results.data as string[][];
      const dataMap: Record<string, TableRow[]> = {};
      const indexArray: string[] = [];

      // 跳过表头，处理每一行
      rows.slice(1).forEach((columns) => {
        if (columns.length < 2) return; // 跳过空行

        const fileName = columns[1]; // file_name 在第二列
        indexArray.push(fileName);

        const fileQuestions: TableRow[] = [];
        // 处理5个问题
        for (let i = 0; i < 5; i++) {
          fileQuestions[i] = {
            question: columns[2 + i * 5] || "",
            questionTranslation: columns[3 + i * 5] || "",
            answer: columns[4 + i * 5] || "",
            vgGuide: columns[5 + i * 5] || "",
            vgGuideTranslation: columns[6 + i * 5] || "",
          };
        }

        dataMap[fileName] = fileQuestions;
      });
      callback(dataMap, indexArray);
    },
    error: (error: any) => {
      console.error("CSV解析错误:", error);
    },
  });
}
