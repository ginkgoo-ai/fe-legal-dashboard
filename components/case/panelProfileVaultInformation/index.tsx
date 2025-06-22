import { Button } from '@/components/ui/button';
import { IconAvatar, IconEdit } from '@/components/ui/icon';
import { ICaseProfileChecklistType, ICaseProfileMissingField } from '@/types/case';
import { cn } from '@/utils';
import { memo, useState } from 'react';

const StatusMap: Record<string, string> = {
  NOT_PROVIDED: 'Not Provided yet',
};

// const TypeMap: Record<string, string> = {
//   PERSONAL_INFORMATION: 'Personal Information',
// };

const PurePanelProfileVaultInformationItem = (props: ICaseProfileMissingField) => {
  const [editMode, setEditMode] = useState(false);

  const handleEdit = () => {
    setEditMode(!editMode);
  };

  return (
    <div className="w-full bg-[#FFF9EA] rounded-xl p-2 tracking-wide">
      <div className="w-full py-2 px-4 flex gap-4">
        <div className="flex-1">
          <h2 className="font-semibold text-base mb-2 text-primary-label inline-flex items-center">
            {props.displayName}
            <div className="w-fit bg-white rounded px-2 py-1 mx-4 text-[10px] font-thin text-[#FFA800] inline-flex items-center gap-1">
              <IconAvatar />
              {props.category}
            </div>
          </h2>
          {/* <p>{props.description}</p> */}
        </div>
        <div className="flex-none inline-flex items-start gap-4">
          <div className="h-9 leading-9 text-[#98A1B7] text-xs">
            {StatusMap.NOT_PROVIDED}
          </div>
          <Button
            variant={editMode ? 'default' : 'secondary'}
            size={editMode ? 'default' : 'icon'}
            className={cn(editMode ? null : 'p-1', 'group/edit')}
            onClick={handleEdit}
          >
            {editMode ? (
              'Save'
            ) : (
              <IconEdit
                size={24}
                className="group-hover/edit:[&>.path-pen]:fill-primary"
              />
            )}
          </Button>
        </div>
      </div>
      <div className="w-full bg-white"></div>
    </div>
  );
};

export const PanelProfileVaultInformationItem = memo(
  PurePanelProfileVaultInformationItem
);

export const PanelProfileVaultInformationChecklist = (
  props: ICaseProfileChecklistType & { caseId: string }
) => {
  return (
    <div>
      <h2 className="font-semibold text-base inline-flex items-center w-full gap-2 mb-2">
        <span className="flex-1 tracking-wide">Information checklist</span>
      </h2>
      <div className="flex flex-col gap-4">
        {(props.missingFields ?? []).map((item, index) => {
          return <PanelProfileVaultInformationItem {...item} key={index} />;
        })}
      </div>
    </div>
  );
};
