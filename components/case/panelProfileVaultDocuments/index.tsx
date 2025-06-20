import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconFace, IconRefresh, IconTrash, IconUpload } from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils';
import { Ellipsis } from 'lucide-react';

type PanelProfileVaultDocumentsProps = {
  documentItems: any[];
  documentsWithIssues: number;
  totalRequiredDocuments: number;
  uploadedDocuments: number;
};

export const PanelProfileVaultDocuments = ({
  documentItems,
  documentsWithIssues,
}: PanelProfileVaultDocumentsProps) => {
  return (
    <div>
      <h2 className="font-semibold text-base inline-flex items-center w-full gap-2 mb-2">
        <span className="tracking-wide w-fit">Document checklist</span>
        <span className="size-4 block bg-red-500 rounded-full px-2 text-white">
          {documentsWithIssues}
        </span>
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
          {(documentItems ?? []).map(doc => (
            <TableRow key={doc.id}>
              <TableCell>{doc.documentType}</TableCell>
              <TableCell>--</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <span
                      className={cn(
                        buttonVariants({
                          variant: 'secondary',
                          size: 'icon',
                          className: 'size-8 bg-[#F9F9F9] text-[#98A1B7]',
                        })
                      )}
                    >
                      <Ellipsis />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                      <IconFace size={24} className="size-6" />
                      Mark as Valid
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconRefresh size={24} className="size-6" />
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconUpload size={24} className="size-6" />
                      Upload
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconTrash size={24} className="size-6" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
