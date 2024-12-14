import React from 'react';
import { SendPageStateClass } from '../../app/AppState';
import MessageList from './components/MessageList';

type MessagesAllProps = {
  doRefresh: () => void;
  toggleMenuDrawer: () => void;
  syncingStatusMoreInfoOnClick: () => void;
  setPrivacyOption: (value: boolean) => Promise<void>;
  setUfvkViewModalVisible?: (v: boolean) => void;
  setSendPageState: (s: SendPageStateClass) => void;
  setScrollToBottom: (value: boolean) => void;
  scrollToBottom: boolean;
};

const MessagesAll: React.FunctionComponent<MessagesAllProps> = ({
  doRefresh,
  toggleMenuDrawer,
  syncingStatusMoreInfoOnClick,
  setPrivacyOption,
  setUfvkViewModalVisible,
  setSendPageState,
  setScrollToBottom,
  scrollToBottom,
}) => {
  return (
    <MessageList
      doRefresh={doRefresh}
      toggleMenuDrawer={toggleMenuDrawer}
      syncingStatusMoreInfoOnClick={syncingStatusMoreInfoOnClick}
      setPrivacyOption={setPrivacyOption}
      setUfvkViewModalVisible={setUfvkViewModalVisible}
      setSendPageState={setSendPageState}
      setScrollToBottom={setScrollToBottom}
      scrollToBottom={scrollToBottom}
    />
  );
};

export default React.memo(MessagesAll);
