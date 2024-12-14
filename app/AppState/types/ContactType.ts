import { RPCValueTransfersStatusEnum } from '../../rpc/enums/RPCValueTransfersStatusEnum';
import { ValueTransferKindEnum } from '../enums/ValueTransferKindEnum';

export default interface ContactType {
  address: string;

  // last message
  time: number;
  memos: string[];
  confirmations: number;
  status: RPCValueTransfersStatusEnum;
  kind: ValueTransferKindEnum;

  // eslint-disable-next-line semi
}
