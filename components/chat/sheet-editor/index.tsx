"use client";

import { parse, unparse } from "papaparse";
import { DataGrid, textEditor } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import React, { memo, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface SheetEditorProps {
  content: string;
  onSaveContent?: (content: string, isCurrentVersion: boolean) => void;
  status?: string;
  isCurrentVersion?: boolean;
  currentVersionIndex?: number;
}

const MIN_ROWS = 6;
const MIN_COLS = 3;

const PureSheetEditor = (props: SheetEditorProps) => {
  const { content, onSaveContent } = props;
  const { theme } = useTheme();

  const parseData = useMemo(() => {
    if (!content) return Array(MIN_ROWS).fill(Array(MIN_COLS).fill(""));
    const result = parse<string[]>(content, { skipEmptyLines: true });

    const maxCols = Math.max(MIN_COLS, ...result.data.map((row) => row.length));

    const paddedData = result.data.map((row: string[]) => {
      const paddedRow = [...row];
      while (paddedRow.length < maxCols) {
        paddedRow.push("");
      }
      return paddedRow;
    });

    while (paddedData.length < MIN_ROWS) {
      paddedData.push(Array(maxCols).fill(""));
    }

    return paddedData;
  }, [content]);

  const columns = useMemo(() => {
    const maxCols = Math.max(MIN_COLS, ...parseData.map((row) => row.length));

    const rowNumberColumn = {
      key: "rowNumber",
      name: "",
      frozen: true,
      width: 50,
      renderCell: ({ rowIdx }: { rowIdx: number }) => rowIdx + 1,
      cellClass: "border-t border-r dark:bg-zinc-950 dark:text-zinc-50",
      headerCellClass: "border-t border-r dark:bg-zinc-900 dark:text-zinc-50",
    };

    const dataColumns = Array.from({ length: maxCols }, (_, i) => ({
      key: i.toString(),
      name: String.fromCharCode(65 + i),
      editable: !!onSaveContent,
      renderEditCell: textEditor,
      width: 120,
      cellClass: cn(`border-t dark:bg-zinc-950 dark:text-zinc-50`, {
        "border-l": i !== 0,
      }),
      headerCellClass: cn(`border-t dark:bg-zinc-900 dark:text-zinc-50`, {
        "border-l": i !== 0,
      }),
    }));

    return [rowNumberColumn, ...dataColumns];
  }, [parseData, onSaveContent]);

  const initialRows = useMemo(() => {
    return parseData.map((row: string[], rowIndex: number) => {
      const rowData: any = {
        id: rowIndex,
        rowNumber: rowIndex + 1,
      };

      columns.slice(1).forEach((col, colIndex) => {
        rowData[col.key] = row[colIndex] || "";
      });

      return rowData;
    });
  }, [parseData, columns]);

  const [localRows, setLocalRows] = useState(initialRows);

  useEffect(() => {
    setLocalRows(initialRows);
  }, [initialRows]);

  const generateCsv = (data: any[][]) => {
    return unparse(data);
  };

  const handleRowsChange = (newRows: any[]) => {
    setLocalRows(newRows);

    const updatedData = newRows.map((row) => {
      return columns.slice(1).map((col) => row[col.key] || "");
    });

    const newCsvContent = generateCsv(updatedData);
    onSaveContent?.(newCsvContent, true);
  };

  return (
    <DataGrid
      className={theme === "dark" ? "rdg-dark" : "rdg-light"}
      columns={columns}
      rows={localRows}
      enableVirtualization
      onRowsChange={handleRowsChange}
      onCellClick={(args: any) => {
        if (args.column.key !== "rowNumber") {
          args.selectCell(true);
        }
      }}
      style={{ height: "100%" }}
      defaultColumnOptions={{
        resizable: true,
        sortable: true,
      }}
    />
  );
};

function areEqual(prevProps: SheetEditorProps, nextProps: SheetEditorProps) {
  return (
    prevProps.currentVersionIndex === nextProps.currentVersionIndex &&
    prevProps.isCurrentVersion === nextProps.isCurrentVersion &&
    !(prevProps.status === "streaming" && nextProps.status === "streaming") &&
    prevProps.content === nextProps.content &&
    prevProps.onSaveContent === nextProps.onSaveContent
  );
}

export const SheetEditor = memo(PureSheetEditor, areEqual);
