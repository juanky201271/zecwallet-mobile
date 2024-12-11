/* eslint-disable react-native/no-inline-styles */
import React, { useContext } from 'react';
import { SendPageStateClass } from '../../app/AppState';
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
  toggleMenuDrawer: () => void;
  syncingStatusMoreInfoOnClick: () => void;
  setPrivacyOption: (value: boolean) => Promise<void>;
  setUfvkViewModalVisible?: (v: boolean) => void;
  setSendPageState: (s: SendPageStateClass) => void;
  setScrollToBottom: (value: boolean) => void;
  scrollToBottom: boolean;
  address: string;
  closeModal: () => void;
  openModal: () => void;
};

const MessagesAddress: React.FunctionComponent<MessagesAddressProps> = ({
  doRefresh,
  toggleMenuDrawer,
  syncingStatusMoreInfoOnClick,
  setPrivacyOption,
  setUfvkViewModalVisible,
  setSendPageState,
  setScrollToBottom,
  scrollToBottom,
  address,
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
        toggleMenuDrawer={toggleMenuDrawer}
        syncingStatusMoreInfoOnClick={syncingStatusMoreInfoOnClick}
        setPrivacyOption={setPrivacyOption}
        setUfvkViewModalVisible={setUfvkViewModalVisible}
        setSendPageState={setSendPageState}
        setScrollToBottom={setScrollToBottom}
        scrollToBottom={scrollToBottom}
        address={address}
        closeModal={closeModal}
        openModal={openModal}
      />
    </SafeAreaView>
  );
};

export default React.memo(MessagesAddress);
