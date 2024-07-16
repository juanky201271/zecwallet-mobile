import { ChainNameEnum } from '../enums/ChainNameEnum';
import { CurrencyNameEnum } from '../enums/CurrencyNameEnum';

export default interface InfoType {
  chainName: ChainNameEnum;
  serverUri: string;
  latestBlock: number;
  connections: number;
  version: string;
  verificationProgress: number;
  currencyName: CurrencyNameEnum;
  solps: number;
  zingolib: string;
  // eslint-disable-next-line semi
}
