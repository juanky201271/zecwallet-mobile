/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  Modal,
  RefreshControl,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/ru';

import { useScrollToTop, useTheme } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons';

import {
  ContactType,
  SelectServerEnum,
  SendPageStateClass,
  ServerType,
  ValueTransferType,
} from '../../../app/AppState';
import { ThemeType } from '../../../app/types';
import FadeText from '../../Components/FadeText';
import { ContextAppLoaded } from '../../../app/context';
import Header from '../../Header';
import { MessagesAddress } from '../../Messages';
import Utils from '../../../app/utils';
import ContactLine from './ContactLine';

type ContactListProps = {
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

const ContactList: React.FunctionComponent<ContactListProps> = ({
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
  const context = useContext(ContextAppLoaded);
  const { translate, valueTransfers, language, addLastSnackbar, server } = context;
  const { colors } = useTheme() as unknown as ThemeType;
  moment.locale(language);

  const [isMessagesAddressModalShowing, setMessagesAddressModalShowing] = useState<boolean>(false);
  const [contactDetail, setContactDetail] = useState<ContactType>({} as ContactType);
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [zennyTips, setZennyTips] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  useScrollToTop(scrollViewRef);

  var lastMonth = '';

  const fetchContacts = useMemo(() => {
    if (!valueTransfers) {
      return [] as ContactType[];
    }
    const cont: ContactType[] = [];
    valueTransfers
      .filter((vt: ValueTransferType) => !!vt.memos && vt.memos.length > 0 && !!vt.memos.join(''))
      .forEach((vt: ValueTransferType) => {
        if (vt.memos) {
          const memoTotal = vt.memos.join('\n');
          let memoAddress;
          if (memoTotal.includes('\nReply to: \n')) {
            let memoArray = memoTotal.split('\nReply to: \n');
            memoAddress = memoArray.pop();
          }
          const contactAddress = vt.address || memoAddress || '';
          if (contactAddress) {
            const exists = cont.filter((c: ContactType) => c.address === contactAddress);
            //console.log(contactAddress, exists);
            if (exists.length === 0) {
              cont.push({
                address: contactAddress,
                time: vt.time,
                memos: vt.memos,
                confirmations: vt.confirmations,
                status: vt.status,
                kind: vt.kind,
              });
            }
          }
        }
      });

    return cont;
  }, [valueTransfers]);

  useEffect(() => {
    const fetchZennyTips = async () => {
      const zt: string = await Utils.getZenniesDonationAddress(server.chainName);
      setZennyTips(zt);
    };

    if (valueTransfers !== null) {
      fetchZennyTips();
      const c = fetchContacts;
      setContacts(c);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [fetchContacts, server.chainName, valueTransfers]);

  useEffect(() => {
    if (scrollToTop) {
      handleScrollToTop();
      setScrollToTop(false);
    }
  }, [scrollToTop, setScrollToTop]);

  const handleScrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const isTop = contentOffset.y === 0;
    setIsAtTop(isTop);
  };

  //console.log('render History - 4');

  return (
    <View
      accessible={true}
      accessibilityLabel={translate('history.title-acc') as string}
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        width: '100%',
        height: '100%',
      }}>
      {isMessagesAddressModalShowing && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={isMessagesAddressModalShowing}
          onRequestClose={() => setMessagesAddressModalShowing(false)}>
          <MessagesAddress
            doRefresh={doRefresh}
            toggleMenuDrawer={toggleMenuDrawer}
            syncingStatusMoreInfoOnClick={syncingStatusMoreInfoOnClick}
            setPrivacyOption={setPrivacyOption}
            setUfvkViewModalVisible={setUfvkViewModalVisible}
            setSendPageState={setSendPageState}
            setScrollToBottom={setScrollToBottom}
            scrollToBottom={scrollToBottom}
            address={Utils.messagesAddress(contactDetail)}
            closeModal={() => setMessagesAddressModalShowing(false)}
            openModal={() => setMessagesAddressModalShowing(true)}
            sendTransaction={sendTransaction}
            clearToAddr={clearToAddr}
            setServerOption={setServerOption}
          />
        </Modal>
      )}

      <Header
        toggleMenuDrawer={toggleMenuDrawer}
        syncingStatusMoreInfoOnClick={syncingStatusMoreInfoOnClick}
        title={translate('messages.title') as string}
        noBalance={true}
        setUfvkViewModalVisible={setUfvkViewModalVisible}
        setPrivacyOption={setPrivacyOption}
        addLastSnackbar={addLastSnackbar}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            accessible={true}
            accessibilityLabel={translate('history.list-acc') as string}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={doRefresh}
                tintColor={colors.text}
                title={translate('history.refreshing') as string}
              />
            }
            style={{
              flexGrow: 1,
              marginTop: 10,
              width: '100%',
            }}>
            {contacts &&
              contacts.length > 0 &&
              contacts.flatMap((c, index) => {
                let txmonth = c && c.time ? moment(c.time * 1000).format('MMM YYYY') : '--- ----';

                var month = '';
                if (txmonth !== lastMonth) {
                  month = txmonth;
                  lastMonth = txmonth;
                }

                return (
                  <ContactLine
                    key={`${index}-${c.address}-${c.kind}`}
                    index={index}
                    c={c}
                    month={month}
                    setContactDetail={(ttt: ContactType) => setContactDetail(ttt)}
                    setSendPageState={setSendPageState}
                    setMessagesAddressModalShowing={(bbb: boolean) => setMessagesAddressModalShowing(bbb)}
                    addressProtected={c.address === zennyTips}
                  />
                );
              })}
            {!!contacts && !!contacts.length && (
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginTop: 10,
                  marginBottom: 30,
                }}>
                <FadeText style={{ color: colors.primary }}>{translate('history.end') as string}</FadeText>
              </View>
            )}
          </ScrollView>
          {!isAtTop && (
            <TouchableOpacity onPress={handleScrollToTop} style={{ position: 'absolute', bottom: 30, right: 10 }}>
              <FontAwesomeIcon
                style={{ marginLeft: 5, marginRight: 5, marginTop: 0 }}
                size={50}
                icon={faAnglesUp}
                color={colors.zingo}
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

export default React.memo(ContactList);
