import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconArrowRightTop,
  IconCheckGreen,
  IconFace,
  IconIssueCheck,
  IconIssueCircle,
  IconRefresh,
  IconTrash,
  IconUpload,
} from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { markValid, removeDocument, uploadDocumentSingle } from '@/service/api';
import {
  ICaseDocumentChecklistType,
  ICaseDocumentItemType,
  ICaseDocumentTypeMap,
} from '@/types/case';
import { cn } from '@/utils';
import { Ellipsis } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type PanelProfileVaultDocumentsProps = ICaseDocumentChecklistType & { caseId: string };

const DocumentStatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'NOT_UPLOADED':
      return <IconIssueCircle />;
    case 'REJECTED':
      return <IconIssueCheck />;
    case 'COMPLETED':
      return <IconCheckGreen />;
    default:
      return <IconCheckGreen />;
  }
};

export const PanelProfileVaultDocuments = ({
  documentItems,
  documentsWithIssues,
  caseId,
}: PanelProfileVaultDocumentsProps) => {
  const [loadingMap, setLoadingMap] = useState(new Map<number, boolean>([]));
  const [currentOperation, setCurrentOperation] = useState<{
    type: 'upload' | 'update' | null;
    doc: ICaseDocumentItemType | null;
    index: number;
  }>({ type: null, doc: null, index: -1 });
  const uploadRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    (documentItems ?? []).forEach((item, index) => {
      if (item.documentType) {
        setLoadingMap(prevMap => new Map(prevMap).set(index, false));
      }
    });
  }, [documentItems]);

  const handleMarkAsValid = async (doc: ICaseDocumentItemType, index: number) => {
    setLoading(index, true);
    await markValid(caseId, doc.documentId, {
      markAsValid: true,
      documentId: doc.documentId,
    });
    setLoading(index, false);
  };

  const handleUpdate = (doc: ICaseDocumentItemType, index: number) => {
    setCurrentOperation({
      type: 'update',
      doc,
      index,
    });
    uploadRef.current?.click();
  };

  const handleUpload = (doc: ICaseDocumentItemType, index: number) => {
    setCurrentOperation({
      type: 'upload',
      doc,
      index,
    });
    uploadRef.current?.click();
  };

  const handleRemove = (doc: ICaseDocumentItemType, index: number) => {
    setLoading(index, true);
    removeDocument(caseId, doc.documentId).then(() => {
      setLoading(index, false);
    });
  };

  const getDocIssues = (doc: ICaseDocumentItemType) => {
    return (doc.issues ?? []).reduce((acc, issue, index) => {
      return acc + issue.description + (index === doc.issues.length - 1 ? '' : ' / ');
    }, '');
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    currentOperation: {
      type: 'upload' | 'update' | null;
      doc: ICaseDocumentItemType | null;
      index: number;
    }
  ) => {
    const files = e.target.files;
    const { type } = currentOperation;
    if (!files || !files?.[0]) {
      return;
    }
    if (['upload', 'update'].includes(type as string)) {
      await uploadDocumentSingle(caseId, { file: files[0] });
    }
    setCurrentOperation({
      type: null,
      doc: null,
      index: -1,
    });
  };

  const setLoading = (index: number, status: boolean) => {
    setLoadingMap(prevMap => new Map(prevMap).set(index, status));
  };

  return (
    <div>
      <h2 className="font-semibold text-base inline-flex items-center w-full gap-2 mb-2">
        <span className="tracking-wide w-fit">Document checklist</span>
        {documentsWithIssues && documentsWithIssues > 0 && (
          <span className="block bg-red-500 rounded-sm size-5 text-white text-sm font-normal flex-none text-center">
            {documentsWithIssues}
          </span>
        )}
      </h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9F9F9] hover:bg-[#F9F9F9]">
            <TableHead>Document</TableHead>
            <TableHead>Issue Detected</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(documentItems ?? []).map((doc, docIndex) => (
            <TableRow key={docIndex}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DocumentStatusIcon status={doc.uploadStatus} />
                  <Select defaultValue={doc.documentType}>
                    <SelectTrigger className="w-[220px] border-transparent shadow-none hover:border-input hover:shadow-xs">
                      <SelectValue placeholder="Document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      {Object.entries(ICaseDocumentTypeMap).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
              <TableCell>
                {doc.issues.length === 0 ? (
                  <span className="px-5">--</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <IconArrowRightTop className="flex-none" />
                    <Tooltip delayDuration={1500}>
                      <TooltipTrigger>
                        <p className="mb-0 line-clamp-2 max-w-4xl whitespace-pre-wrap">
                          {getDocIssues(doc)}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xl">
                        <p className="mb-0">{getDocIssues(doc)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    disabled={loadingMap.get(docIndex) ?? false}
                    className={cn(
                      buttonVariants({
                        variant: 'secondary',
                        size: 'icon',
                        className:
                          'size-8 bg-[#F9F9F9] text-[#98A1B7] not-[data-disabled]:hover:text-primary not-[data-disabled]:hover:bg-primary/5',
                      })
                    )}
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {doc.uploadStatus !== 'NOT_UPLOADED' && (
                      <DropdownMenuItem
                        className="focus:text-primary group/menu focus:bg-primary/5"
                        onClick={() => handleMarkAsValid(doc, docIndex)}
                      >
                        <IconFace
                          size={24}
                          className="size-6 text-[#98A1B7] group-focus/menu:text-primary"
                        />
                        Mark as Valid
                      </DropdownMenuItem>
                    )}
                    {doc.uploadStatus !== 'NOT_UPLOADED' && (
                      <DropdownMenuItem
                        className="focus:text-primary group/menu focus:bg-primary/5"
                        onClick={() => handleUpdate(doc, docIndex)}
                      >
                        <IconRefresh
                          size={24}
                          className="size-6 text-[#98A1B7] group-focus/menu:text-primary"
                        />
                        Update
                      </DropdownMenuItem>
                    )}
                    {doc.uploadStatus === 'NOT_UPLOADED' && (
                      <DropdownMenuItem
                        className="focus:text-primary group/menu focus:bg-primary/5"
                        onClick={() => handleUpload(doc, docIndex)}
                      >
                        <IconUpload
                          size={24}
                          className="size-6 text-[#98A1B7] group-focus/menu:text-primary"
                        />
                        Upload
                      </DropdownMenuItem>
                    )}
                    {doc.uploadStatus !== 'NOT_UPLOADED' && (
                      <DropdownMenuItem
                        className="focus:text-primary group/menu focus:bg-primary/5"
                        onClick={() => handleRemove(doc, docIndex)}
                      >
                        <IconTrash
                          size={24}
                          className="size-6 text-[#98A1B7] group-focus/menu:text-primary"
                        />
                        Remove
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <input
        ref={uploadRef}
        hidden
        type="file"
        max={50}
        accept="application/pdf,image/jpeg,image/png,image/gif,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
        onChange={e => handleFileChange(e, currentOperation)}
      />
    </div>
  );
};
