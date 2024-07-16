import { PoolEnum } from '../../AppState';
import { RPCValueTransfersStatusEnum } from '../enums/RPCValueTransfersStatusEnum';
import { RPCValueTransfersKindEnum } from '../enums/RPCValueTransfersKindEnum';

export type RPCValueTransferType = {
  txid: string;
  datetime: number;
  status: RPCValueTransfersStatusEnum;
  blockheight: number;
  transaction_fee?: number;
  zec_price?: number;
  kind: RPCValueTransfersKindEnum;
  value: number;
  recipient_address?: string;
  pool_received?: PoolEnum;
  memos?: string[];
};
