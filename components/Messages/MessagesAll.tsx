/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from 'react';
import { SendPageStateClass } from '../../app/AppState';
import MessageList from './components/MessageList';
import { SafeAreaView } from 'react-native';
import { ContextAppLoaded } from '../../app/context';
import { useTheme } from '@react-navigation/native';
import { ThemeType } from '../../app/types';
import moment from 'moment';

type MessagesAllProps = {
  doRefresh: () => void;
  setPrivacyOption: (value: boolean) => Promise<void>;
  setSendPageState: (s: SendPageStateClass) => void;
  setScrollToBottom: (value: boolean) => void;
  scrollToBottom: boolean;
  anonymous: boolean;
  closeModal: () => void;
  openModal: () => void;
};

const MessagesAll: React.FunctionComponent<MessagesAllProps> = ({
  doRefresh,
  setPrivacyOption,
  setSendPageState,
  setScrollToBottom,
  scrollToBottom,
  anonymous,
  closeModal,
  openModal,
}) => {
  const context = useContext(ContextAppLoaded);
  const { language } = context;
  const { colors } = useTheme() as unknown as ThemeType;
  moment.locale(language);

  return (
    <SafeAreaView
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        height: '100%',
        backgroundColor: colors.background,
      }}>
      <MessageList
        doRefresh={doRefresh}
        setPrivacyOption={setPrivacyOption}
        setSendPageState={setSendPageState}
        setScrollToBottom={setScrollToBottom}
        scrollToBottom={scrollToBottom}
        anonymous={anonymous}
        closeModal={closeModal}
        openModal={openModal}
      />
    </SafeAreaView>
  );
};

export default React.memo(MessagesAll);
