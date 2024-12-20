/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Modal,
  RefreshControl,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/ru';

import { useScrollToTop, useTheme } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAnglesUp, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';

import {
  AddressBookFileClass,
  ContactType,
  FilterEnum,
  SelectServerEnum,
  SendPageStateClass,
  ServerType,
  ValueTransferType,
} from '../../../app/AppState';
import { ThemeType } from '../../../app/types';
import FadeText from '../../Components/FadeText';
import { ContextAppLoaded } from '../../../app/context';
import Header from '../../Header';
import { MessagesAddress, MessagesAll } from '../../Messages';
import Utils from '../../../app/utils';
import ContactLine from './ContactLine';
import RegText from '../../Components/RegText';

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
  const { translate, valueTransfers, language, addLastSnackbar, server, addressBook } = context;
  const { colors } = useTheme() as unknown as ThemeType;
  moment.locale(language);

  const [isMessagesAddressModalShowing, setMessagesAddressModalShowing] = useState<boolean>(false);
  const [isMessagesAllModalShowing, setMessagesAllModalShowing] = useState<boolean>(false);
  const [contactDetail, setContactDetail] = useState<ContactType>({} as ContactType);
  const [contacts, setContacts] = useState<ContactType[]>([]);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [zennyTips, setZennyTips] = useState<string>('');
  const [filter, setFilter] = useState<FilterEnum>(FilterEnum.all);
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchTextField, setSearchTextField] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  useScrollToTop(scrollViewRef);

  var lastMonth = '';

  const fetchContacts = () => {
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
            const isContact = addressBook.filter((ab: AddressBookFileClass) => ab.address === contactAddress);
            //console.log(contactAddress, exists);
            let pushAddress = false;
            if (exists.length === 0) {
              if (filter === FilterEnum.all) {
                pushAddress = true;
              } else {
                if (filter === FilterEnum.contacts && isContact.length === 1) {
                  pushAddress = true;
                } else if (filter === FilterEnum.noContacts && isContact.length === 0) {
                  pushAddress = true;
                }
              }
            }
            if (pushAddress) {
              // search if needed
              let found = false;
              if (searchText) {
                if (
                  contactAddress.toLowerCase().includes(searchText.toLowerCase()) ||
                  (isContact.length === 1 && isContact[0].label.toLowerCase().includes(searchText.toLowerCase()))
                ) {
                  found = true;
                }
              } else {
                found = true;
              }
              if (found) {
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
        }
      });

    return cont;
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressBook, server.chainName, valueTransfers, searchMode, loading, filter]);

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

  //console.log('render Contacts', filter, searchMode);
  //console.log('search text:', searchText, 'field:', searchTextField);

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
            setPrivacyOption={setPrivacyOption}
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

      {isMessagesAllModalShowing && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={isMessagesAllModalShowing}
          onRequestClose={() => setMessagesAllModalShowing(false)}>
          <MessagesAll
            doRefresh={doRefresh}
            setPrivacyOption={setPrivacyOption}
            setSendPageState={setSendPageState}
            setScrollToBottom={setScrollToBottom}
            scrollToBottom={scrollToBottom}
            closeModal={() => setMessagesAllModalShowing(false)}
            openModal={() => setMessagesAllModalShowing(true)}
          />
        </Modal>
      )}
      <Header
        toggleMenuDrawer={toggleMenuDrawer}
        syncingStatusMoreInfoOnClick={syncingStatusMoreInfoOnClick}
        title={translate('messages.title-chats') as string}
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
            keyboardShouldPersistTaps="handled"
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
            {searchMode && (
              <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    margin: 10,
                  }}>
                  <View
                    accessible={true}
                    style={{
                      flexGrow: 1,
                      flexDirection: 'row',
                      width: '90%',
                      borderWidth: 2,
                      borderRadius: 15,
                      borderColor: colors.text,
                    }}>
                    <TextInput
                      placeholder={translate('messages.search-placeholder') as string}
                      placeholderTextColor={colors.placeholder}
                      style={{
                        flex: 1,
                        color: colors.text,
                        fontWeight: '600',
                        fontSize: 14,
                        marginLeft: 5,
                        backgroundColor: 'transparent',
                        textAlignVertical: 'top',
                      }}
                      value={searchTextField}
                      onChangeText={(text: string) => setSearchTextField(text.trim())}
                      onEndEditing={(e: any) => {
                        setSearchTextField(e.nativeEvent.text.trim());
                      }}
                      editable={true}
                      returnKeyLabel={translate('messages.search-placeholder') as string}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        if (searchTextField) {
                          setSearchText(searchTextField);
                          setSearchMode(false);
                          setLoading(true);
                        }
                      }}
                    />
                    {loading && (
                      <ActivityIndicator
                        style={{ marginTop: 7, marginRight: 7 }}
                        size={25}
                        color={colors.primaryDisabled}
                      />
                    )}
                    {!loading && (
                      <TouchableOpacity
                        onPress={() => {
                          setSearchTextField('');
                          setSearchMode(false);
                        }}>
                        <FontAwesomeIcon
                          style={{ marginTop: 7, marginRight: 7 }}
                          size={25}
                          icon={faXmark}
                          color={colors.primaryDisabled}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginHorizontal: 10,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    // call the screen
                    setMessagesAllModalShowing(true);
                  }}>
                  <View
                    style={{
                      paddingHorizontal: 5,
                      marginHorizontal: 0,
                    }}>
                    <RegText
                      style={{
                        color: colors.primary,
                        textDecorationLine: 'underline',
                        fontWeight: 'bold',
                      }}>
                      {translate('messages.link-all') as string}
                    </RegText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFilter(FilterEnum.all);
                    setLoading(true);
                  }}>
                  <View
                    style={{
                      backgroundColor: filter === FilterEnum.all ? colors.primary : colors.sideMenuBackground,
                      borderRadius: 15,
                      borderColor: filter === FilterEnum.all ? colors.primary : colors.zingo,
                      borderWidth: 1,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      marginHorizontal: 10,
                    }}>
                    <FadeText
                      style={{
                        color: filter === FilterEnum.all ? colors.sideMenuBackground : colors.zingo,
                        fontWeight: 'bold',
                      }}>
                      {translate('messages.filter-all') as string}
                    </FadeText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFilter(FilterEnum.contacts);
                    setLoading(true);
                  }}>
                  <View
                    style={{
                      backgroundColor: filter === FilterEnum.contacts ? colors.primary : colors.sideMenuBackground,
                      borderRadius: 15,
                      borderColor: filter === FilterEnum.contacts ? colors.primary : colors.zingo,
                      borderWidth: 1,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      marginHorizontal: 0,
                    }}>
                    <FadeText
                      style={{
                        color: filter === FilterEnum.contacts ? colors.sideMenuBackground : colors.zingo,
                        fontWeight: 'bold',
                      }}>
                      {translate('messages.filter-contacts') as string}
                    </FadeText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFilter(FilterEnum.noContacts);
                    setLoading(true);
                  }}>
                  <View
                    style={{
                      backgroundColor: filter === FilterEnum.noContacts ? colors.primary : colors.sideMenuBackground,
                      borderRadius: 15,
                      borderColor: filter === FilterEnum.noContacts ? colors.primary : colors.zingo,
                      borderWidth: 1,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      marginHorizontal: 10,
                    }}>
                    <FadeText
                      style={{
                        color: filter === FilterEnum.noContacts ? colors.sideMenuBackground : colors.zingo,
                        fontWeight: 'bold',
                      }}>
                      {translate('messages.filter-no-contacts') as string}
                    </FadeText>
                  </View>
                </TouchableOpacity>
                {!searchMode && !searchText && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchMode(true);
                    }}>
                    <FontAwesomeIcon style={{ margin: 0 }} size={30} icon={faMagnifyingGlass} color={colors.zingo} />
                  </TouchableOpacity>
                )}
                {!searchMode && searchText && (
                  <TouchableOpacity
                    onPress={() => {
                      setLoading(true);
                      setSearchText('');
                      setSearchTextField('');
                    }}>
                    <View
                      style={{
                        backgroundColor: colors.zingo,
                        borderRadius: 15,
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                        marginHorizontal: 0,
                      }}>
                      <FadeText
                        style={{
                          color: colors.sideMenuBackground,
                          fontWeight: 'bold',
                        }}>
                        {(translate('messages.clear-filter') as string) +
                          ' ' +
                          (searchText.length < 4 ? searchText : searchText.slice(0, 3) + '...')}
                      </FadeText>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
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
            {!!contacts && !!contacts.length ? (
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
            ) : (
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginBottom: 30,
                }}>
                <FadeText style={{ color: colors.primary }}>{translate('messages.contacts-empty') as string}</FadeText>
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
