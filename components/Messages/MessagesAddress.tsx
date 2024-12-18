/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from 'react';
import { SelectServerEnum, SendPageStateClass, ServerType } from '../../app/AppState';
import MessageList from './components/MessageList';
import { SafeAreaView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { ThemeType } from '../../app/types';
import { ContextAppLoaded } from '../../app/context';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/ru';

type MessagesAddressProps = {
  doRefresh: () => void;
  setPrivacyOption: (value: boolean) => Promise<void>;
  setSendPageState: (s: SendPageStateClass) => void;
  setScrollToBottom: (value: boolean) => void;
  scrollToBottom: boolean;
  address: string;
  closeModal: () => void;
  openModal: () => void;
  sendTransaction: () => Promise<String>;
  clearToAddr: () => void;
  setServerOption: (
    value: ServerType,
    selectServer: SelectServerEnum,
    toast: boolean,
    sameServerChainName: boolean,
  ) => Promise<void>;
};

const MessagesAddress: React.FunctionComponent<MessagesAddressProps> = ({
  doRefresh,
  setPrivacyOption,
  setSendPageState,
  setScrollToBottom,
  scrollToBottom,
  address,
  closeModal,
  openModal,
  sendTransaction,
  clearToAddr,
  setServerOption,
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
        address={address}
        closeModal={closeModal}
        openModal={openModal}
        sendTransaction={sendTransaction}
        clearToAddr={clearToAddr}
        setServerOption={setServerOption}
      />
    </SafeAreaView>
  );
};

export default React.memo(MessagesAddress);
