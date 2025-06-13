import { Button } from '@/components/ui/button';
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
import { Ellipsis } from 'lucide-react';
import { memo } from 'react';
import { PanelProfileVaultDashboard } from '../panelProfileVaultDashboard';

type PurePanelProfileVaultOverviewProps = {
  documents: any[];
};

function PurePanelProfileVaultOverview({
  documents,
}: PurePanelProfileVaultOverviewProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <PanelProfileVaultDashboard />
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F9F9F9] hover:bg-[#F9F9F9]">
            <TableHead className="w-4"></TableHead>
            <TableHead>Document Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Issue Detected</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(documents ?? []).map(doc => (
            <TableRow key={doc.id}>
              <TableCell className="w-4">{}</TableCell>
              <TableCell>{doc.title}</TableCell>
              <TableCell>{doc.documentType}</TableCell>
              <TableCell>--</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-8 bg-[#F9F9F9] text-[#98A1B7]"
                    >
                      <Ellipsis />
                    </Button>
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
}

export const PanelProfileVaultOverview = memo(PurePanelProfileVaultOverview);
