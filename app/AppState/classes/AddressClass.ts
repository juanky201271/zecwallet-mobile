import { AddressKindEnum } from '../enums/AddressKindEnum';

export default class AddressClass {
  uaOrchardAddress: string;
  address: string;
  addressKind: AddressKindEnum;
  receivers: string;

  constructor(uaOrchardAddress: string, address: string, addressKind: AddressKindEnum, receivers: string) {
    this.uaOrchardAddress = uaOrchardAddress;
    this.address = address;
    this.addressKind = addressKind;
    this.receivers = receivers;
  }
}
