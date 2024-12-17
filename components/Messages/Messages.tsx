import React from 'react';
import { SelectServerEnum, SendPageStateClass, ServerType } from '../../app/AppState';
import ContactList from './components/ContactList';

type MessagesProps = {
  doRefresh: () => void;
  toggleMenuDrawer: () => void;
  syncingStatusMoreInfoOnClick: () => void;
  setPrivacyOption: (value: boolean) => Promise<void>;
  setUfvkViewModalVisible?: (v: boolean) => void;
  setSendPageState: (s: SendPageStateClass) => void;
  setScrollToTop: (value: boolean) => void;
  scrollToTop: boolean;
  setScrollToBottom: (value: boolean) => void;
  scrollToBottom: boolean;
  sendTransaction: () => Promise<String>;
  clearToAddr: () => void;
  setServerOption: (
    value: ServerType,
    selectServer: SelectServerEnum,
    toast: boolean,
    sameServerChainName: boolean,
  ) => Promise<void>;
};

const Messages: React.FunctionComponent<MessagesProps> = ({
  doRefresh,
  toggleMenuDrawer,
  syncingStatusMoreInfoOnClick,
  setPrivacyOption,
  setUfvkViewModalVisible,
  setSendPageState,
  setScrollToTop,
  scrollToTop,
  setScrollToBottom,
  scrollToBottom,
  sendTransaction,
  clearToAddr,
  setServerOption,
}) => {
  return (
    <ContactList
      doRefresh={doRefresh}
      toggleMenuDrawer={toggleMenuDrawer}
      syncingStatusMoreInfoOnClick={syncingStatusMoreInfoOnClick}
      setPrivacyOption={setPrivacyOption}
      setUfvkViewModalVisible={setUfvkViewModalVisible}
      setSendPageState={setSendPageState}
      setScrollToTop={setScrollToTop}
      scrollToTop={scrollToTop}
      setScrollToBottom={setScrollToBottom}
      scrollToBottom={scrollToBottom}
      sendTransaction={sendTransaction}
      clearToAddr={clearToAddr}
      setServerOption={setServerOption}
    />
  );
};

export default React.memo(Messages);
