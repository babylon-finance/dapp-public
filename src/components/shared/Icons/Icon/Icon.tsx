import { ReactComponent as AdminIcon } from './icons/admin_icon.svg';
import { ReactComponent as ArrowDownIcon } from './icons/arrow_down.svg';
import { ReactComponent as BabylonianFemaleIcon } from './icons/babylonianfemale_icon.svg';
import { ReactComponent as BabylonianNeutralIcon } from './icons/babylonian_icon.svg';
import { ReactComponent as BabylonianMaleIcon } from './icons/babylonianmale_icon.svg';
import { ReactComponent as BablTokenIcon } from './icons/babl_token.svg';
import { ReactComponent as BackArrowIcon } from './icons/back_arrow.svg';
import { ReactComponent as BarsIcon } from './icons/bars.svg';
import { ReactComponent as BearIcon } from './icons/bear_icon.svg';
import { ReactComponent as BellActiveIcon } from './icons/bell_active_icon.svg';
import { ReactComponent as BellDisabledIcon } from './icons/bell_disabled_icon.svg';
import { ReactComponent as BoltIcon } from './icons/bolt_icon.svg';
import { ReactComponent as BookIcon } from './icons/book_icon.svg';
import { ReactComponent as BowIcon } from './icons/bow.svg';
import { ReactComponent as BullIcon } from './icons/bull_icon.svg';
import { ReactComponent as CancelIcon } from './icons/cancel_icon.svg';
import { ReactComponent as ChatIcon } from './icons/chat_icon.svg';
import { ReactComponent as ChartUpIcon } from './icons/chart_up_icon.svg';
import { ReactComponent as CheckIcon } from './icons/check_icon.svg';
import { ReactComponent as ChevronDownIcon } from './icons/chevron_down.svg';
import { ReactComponent as ChevronUpIcon } from './icons/chevron_up.svg';
import { ReactComponent as ClipboardIcon } from './icons/clipboard_icon.svg';
import { ReactComponent as ControlsIcon } from './icons/controls_icon.svg';
import { ReactComponent as CoinIcon } from './icons/coin_icon.svg';
import { ReactComponent as CoinStackIcon } from './icons/coin_stack.svg';
import { ReactComponent as CreatorIcon } from './icons/creator_icon.svg';
import { ReactComponent as CompoundIcon } from './icons/compound_icon.svg';
import { ReactComponent as CustomGardenIcon } from './icons/custom_garden.svg';
import { ReactComponent as DialogueIcon } from './icons/dialogue_icon.svg';
import { ReactComponent as DiscordIcon } from './icons/discord_icon.svg';
import { ReactComponent as EditIcon } from './icons/edit_icon.svg';
import { ReactComponent as ErrorIcon } from './icons/error_icon.svg';
import { ReactComponent as ExitIcon } from './icons/exit_icon.svg';
import { ReactComponent as ExternalLinkIcon } from './icons/external_link.svg';
import { ReactComponent as FailureIcon } from './icons/failure_icon.svg';
import { ReactComponent as FlameIcon } from './icons/flame_icon.svg';
import { ReactComponent as GardenIcon } from './icons/garden_icon.svg';
import { ReactComponent as GateIcon } from './icons/gate_icon.svg';
import { ReactComponent as GearIcon } from './icons/gear_icon.svg';
import { ReactComponent as HeartFullIcon } from './icons/heart_icon_full.svg';
import { ReactComponent as HeartHalfIcon } from './icons/heart_icon_half.svg';
import { ReactComponent as Immunefi } from './icons/immunefi.svg';
import { ReactComponent as IdentityIcon } from './icons/identity_icon.svg';
import { ReactComponent as LinkIcon } from './icons/link.svg';
import { ReactComponent as LockIcon } from './icons/lock_icon.svg';
import { ReactComponent as Lock2Icon } from './icons/lock2_icon.svg';
import { ReactComponent as ManagementIcon } from './icons/management_icon.svg';
import { ReactComponent as MermanIcon } from './icons/merman_icon.svg';
import { ReactComponent as MemberIcon } from './icons/member_icon.svg';
import { ReactComponent as MembersIcon } from './icons/members_icon.svg';
import { ReactComponent as NewBadgeIcon } from './icons/new_badge_icon.svg';
import { ReactComponent as NoCodeIcon } from './icons/no_code_icon.svg';
import { ReactComponent as NumberDownIcon } from './icons/numberdown_icon.svg';
import { ReactComponent as NumberUpIcon } from './icons/numberup_icon.svg';
import { ReactComponent as OpenseaIcon } from './icons/opensea.svg';
import { ReactComponent as PendingIcon } from './icons/pending_icon.svg';
import { ReactComponent as PermissionIcon } from './icons/permission_icon.svg';
import { ReactComponent as PlusIcon } from './icons/plus_icon.svg';
import { ReactComponent as QuestionIcon } from './icons/question_icon.svg';
import { ReactComponent as RightArrowIcon } from './icons/right_arrow.svg';
import { ReactComponent as RocketIcon } from './icons/rocket_icon.svg';
import { ReactComponent as ScheduleIcon } from './icons/schedule_icon.svg';
import { ReactComponent as ShieldIcon } from './icons/shield_icon.svg';
import { ReactComponent as StarCrashingIcon } from './icons/starcrashing_icon.svg';
import { ReactComponent as StarShootingIcon } from './icons/starshooting_icon.svg';
import { ReactComponent as StewardIcon } from './icons/steward_icon.svg';
import { ReactComponent as StewardPublicIcon } from './icons/steward_public_icon.svg';
import { ReactComponent as StewardPrivateIcon } from './icons/steward_private_icon.svg';
import { ReactComponent as StopIcon } from './icons/stop_icon.svg';
import { ReactComponent as StrategistIcon } from './icons/strategist_icon.svg';
import { ReactComponent as StrategistPublicIcon } from './icons/strategist_public_icon.svg';
import { ReactComponent as StrategistPrivateIcon } from './icons/strategist_private_icon.svg';
import { ReactComponent as SuccessIcon } from './icons/success_icon.svg';
import { ReactComponent as SwitchIcon } from './icons/switch_icon.svg';
import { ReactComponent as TrashIcon } from './icons/trash_icon.svg';
import { ReactComponent as TransferIcon } from './icons/transfer_icon.svg';
import { ReactComponent as UploadIcon } from './icons/upload_icon.svg';
import { ReactComponent as WarningIcon } from './icons/warning.svg';
import { ReactComponent as VideoIcon } from './icons/video.svg';
import { ReactComponent as XLargeIcon } from './icons/xlarge_icon.svg';

import { IconName } from 'models';

import React from 'react';
import styled from 'styled-components';

interface IconProps {
  color?: string;
  name: IconName;
  size?: number;
  className?: string;
  rotate?: number;
}

const Icons = {
  admin: AdminIcon,
  arrowDown: ArrowDownIcon,
  babToken: BablTokenIcon,
  babFemale: BabylonianFemaleIcon,
  babMale: BabylonianMaleIcon,
  babNeutral: BabylonianNeutralIcon,
  backArrow: BackArrowIcon,
  bars: BarsIcon,
  bear: BearIcon,
  bellActive: BellActiveIcon,
  bellDisabled: BellDisabledIcon,
  bolt: BoltIcon,
  book: BookIcon,
  bow: BowIcon,
  bull: BullIcon,
  cancel: CancelIcon,
  chat: ChatIcon,
  chartUp: ChartUpIcon,
  check: CheckIcon,
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,
  clipboard: ClipboardIcon,
  coin: CoinIcon,
  coinStack: CoinStackIcon,
  compound: CompoundIcon,
  controls: ControlsIcon,
  creator: CreatorIcon,
  customGarden: CustomGardenIcon,
  dialogue: DialogueIcon,
  discord: DiscordIcon,
  edit: EditIcon,
  error: ErrorIcon,
  exit: ExitIcon,
  external: ExternalLinkIcon,
  failure: FailureIcon,
  flame: FlameIcon,
  garden: GardenIcon,
  gate: GateIcon,
  gear: GearIcon,
  heartFull: HeartFullIcon,
  heartHalf: HeartHalfIcon,
  identity: IdentityIcon,
  immunefi: Immunefi,
  link: LinkIcon,
  lock: LockIcon,
  lock2: Lock2Icon,
  management: ManagementIcon,
  merman: MermanIcon,
  member: MemberIcon,
  members: MembersIcon,
  newBadge: NewBadgeIcon,
  nocode: NoCodeIcon,
  numberDown: NumberDownIcon,
  numberUp: NumberUpIcon,
  opensea: OpenseaIcon,
  pending: PendingIcon,
  permission: PermissionIcon,
  plus: PlusIcon,
  question: QuestionIcon,
  rightArrow: RightArrowIcon,
  rocket: RocketIcon,
  schedule: ScheduleIcon,
  shield: ShieldIcon,
  starCrashing: StarCrashingIcon,
  starShooting: StarShootingIcon,
  steward: StewardIcon,
  stewardPrivate: StewardPrivateIcon,
  stewardPublic: StewardPublicIcon,
  stop: StopIcon,
  strategist: StrategistIcon,
  strategistPrivate: StrategistPrivateIcon,
  strategistPublic: StrategistPublicIcon,
  success: SuccessIcon,
  switch: SwitchIcon,
  trash: TrashIcon,
  transfer: TransferIcon,
  upload: UploadIcon,
  video: VideoIcon,
  warning: WarningIcon,
  xLarge: XLargeIcon,
};

const getIconByName = (name: IconName) => {
  return Icons[name];
};

const Icon = ({ color, name, size, rotate, className }: IconProps) => {
  const Comp = getIconByName(name);
  if (!Comp) {
    return <div />;
  }
  return (
    <IconWrapper color={color} size={size || 24} className={className} rotate={rotate}>
      <Comp />
    </IconWrapper>
  );
};

const IconWrapper = styled.div<{ color?: string; size: number; rotate: number | undefined }>`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;

  svg {
    ${(p) => (p.rotate ? `transform: rotate(${p.rotate}deg);` : '')}
    width: ${(p) => p.size}px;
    height: ${(p) => p.size}px;

    path {
      fill: ${(p) => p.color};
    }
  }
`;

export default React.memo(Icon);
