/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  ScrollView,
  Modal,
  RefreshControl,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  TextInput,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/ru';

import { useTheme } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faAnglesDown,
  faCircleUser,
  faXmark,
  faMagnifyingGlassPlus,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';

import {
  AddressBookFileClass,
  ButtonTypeEnum,
  GlobalConst,
  SelectServerEnum,
  SendPageStateClass,
  ServerType,
  ServerUrisType,
  ToAddrClass,
  ValueTransferType,
} from '../../../app/AppState';
import { ThemeType } from '../../../app/types';
import FadeText from '../../Components/FadeText';
import Button from '../../Components/Button';
import ValueTransferDetail from '../../History/components/ValueTransferDetail';
import MessageLine from './MessageLine';
import { ContextAppLoaded } from '../../../app/context';
import Header from '../../Header';
import AddressItem from '../../Components/AddressItem';
import Memo from '../../Memo';
import { Buffer } from 'buffer';
import RPC from '../../../app/rpc';
import { sendEmail } from '../../../app/sendEmail';
import { createAlert } from '../../../app/createAlert';
import selectingServer from '../../../app/selectingServer';
import { serverUris } from '../../../app/uris';

type MessageListProps = {
  doRefresh: () => void;
  setPrivacyOption: (value: boolean) => Promise<void>;
  setSendPageState: (s: SendPageStateClass) => void;
  setScrollToBottom: (value: boolean) => void;
  scrollToBottom: boolean;
  address?: string;
  closeModal?: () => void;
  openModal?: () => void;
  sendTransaction?: () => Promise<String>;
  clearToAddr?: () => void;
  setServerOption?: (
    value: ServerType,
    selectServer: SelectServerEnum,
    toast: boolean,
    sameServerChainName: boolean,
  ) => Promise<void>;
};

const MessageList: React.FunctionComponent<MessageListProps> = ({
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
  const {
    translate,
    messages,
    language,
    addLastSnackbar,
    addressBook,
    sendPageState,
    uaAddress,
    selectServer,
    netInfo,
    info,
    setBackgroundError,
    server,
  } = context;
  const { colors } = useTheme() as unknown as ThemeType;
  moment.locale(language);

  const [isValueTransferDetailModalShowing, setValueTransferDetailModalShowing] = useState<boolean>(false);
  const [valueTransferDetail, setValueTransferDetail] = useState<ValueTransferType>({} as ValueTransferType);
  const [valueTransferDetailIndex, setValueTransferDetailIndex] = useState<number>(-1);
  const [numVt, setNumVt] = useState<number>(50);
  const [loadMoreButton, setLoadMoreButton] = useState<boolean>(false);
  const [messagesSliced, setMessagesSliced] = useState<ValueTransferType[]>([]);
  const [messagesFiltered, setMessagesFiltered] = useState<ValueTransferType[]>([]);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [firstScrollToBottomDone, setFirstScrollToBottomDone] = useState<boolean>(false);
  const [scrollViewHeight, setScrollViewHeight] = useState<number>(0);
  const [contentScrollViewHeight, setContentScrollViewHeight] = useState<number>(0);
  const [scrollable, setScrollable] = useState<boolean>(false);
  const [memoIcon, setMemoIcon] = useState<boolean>(false);
  const [memoModalVisible, setMemoModalVisible] = useState<boolean>(false);
  const [validMemo, setValidMemo] = useState<number>(0); // 1 - OK, 0 - Empty, -1 - KO
  const [disableSend, setDisableSend] = useState<boolean>(false);
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [memoFieldHeight, setMemoFieldHeight] = useState<number>(90);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);

  var lastMonth = '';

  const dimensions = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  };

  const getIcon = () => {
    return faCircleUser;
  };

  const getLabel = (addr: string) => {
    const label = addressBook.filter((ab: AddressBookFileClass) => ab.address === addr);
    let initials = null;
    if (label.length === 1) {
      const words = label[0].label.split(' ');
      if (words[0]) {
        initials = words[0].charAt(0).toUpperCase();
      }
      if (words[1]) {
        initials = initials + words[1].charAt(0).toUpperCase();
      }
    }
    return initials;
  };

  const addressFilter = useMemo(
    () => (addr: string | undefined, memos: string[] | undefined) => {
      if (!memos) {
        return false;
      }
      const memoTotal = memos.join('\n');
      let memoAddress;
      if (memoTotal.includes('\nReply to: \n')) {
        let memoArray = memoTotal.split('\nReply to: \n');
        memoAddress = memoArray.pop();
      }
      return addr === address || memoAddress === address;
    },
    [address],
  );

  const anonymousFilter = useMemo(
    () => (addr: string | undefined, memos: string[] | undefined) => {
      if (!memos) {
        return false;
      }
      const memoTotal = memos.join('\n');
      let memoAddress;
      if (memoTotal.includes('\nReply to: \n')) {
        let memoArray = memoTotal.split('\nReply to: \n');
        memoAddress = memoArray.pop();
      }
      return !addr && !memoAddress;
    },
    [],
  );

  const fetchMessagesFiltered = useMemo(() => {
    if (!messages) {
      return [] as ValueTransferType[];
    }
    if (address) {
      // filtering for this address
      return messages.filter((a: ValueTransferType) => addressFilter(a.address, a.memos));
    } else if (anonymous) {
      // filtering for anonymous messages
      return messages.filter((a: ValueTransferType) => anonymousFilter(a.address, a.memos));
    } else {
      return messages;
    }
  }, [messages, address, anonymous, addressFilter, anonymousFilter]);

  useEffect(() => {
    if (messages !== null) {
      const vtf = fetchMessagesFiltered;
      setLoadMoreButton(numVt < vtf.length);
      setMessagesFiltered(vtf);
      setMessagesSliced(vtf.slice(-numVt));
      if (loading) {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }
    // if change numVt don't need to apply the filter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressFilter, loading, messages, fetchMessagesFiltered]);

  useEffect(() => {
    setLoadMoreButton(numVt < messagesFiltered.length);
    setMessagesSliced(messagesFiltered.slice(-numVt));
  }, [numVt, messagesFiltered]);

  useEffect(() => {
    if (scrollToBottom) {
      handleScrollToBottom();
      setScrollToBottom(false);
    }
  }, [scrollToBottom, setScrollToBottom]);

  useEffect(() => {
    if (!loading) {
      if (!messagesSliced || !messagesSliced.length) {
        setFirstScrollToBottomDone(true);
      } else {
        //console.log('scroll bottom');
        handleScrollToBottom();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    //console.log(scrollViewHeight, contentScrollViewHeight);
    if (contentScrollViewHeight > 0 && scrollViewHeight > 0) {
      //setIsAtBottom(false);
      if (contentScrollViewHeight >= scrollViewHeight) {
        //console.log('SCROLLABLE >>>>>>>>>>>>>');
        setScrollable(true);
      } else {
        setScrollable(false);
      }
      //console.log('first scroll bottom done');
      setFirstScrollToBottomDone(true);
    }
  }, [contentScrollViewHeight, scrollViewHeight]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      !!keyboardDidShowListener && keyboardDidShowListener.remove();
      !!keyboardDidHideListener && keyboardDidHideListener.remove();
    };
  }, []);

  const countMemoBytes = (memo: string, includeUAMemo: boolean) => {
    const len = Buffer.byteLength(memoTotal(memo, includeUAMemo, uaAddress), 'utf8');
    return len;
  };

  const memoTotal = useCallback((memoPar: string, includeUAMemoPar: boolean, uaAddressPar: string) => {
    return `${memoPar || ''}${includeUAMemoPar ? '\nReply to: \n' + uaAddressPar : ''}`;
  }, []);

  useEffect(() => {
    if (sendPageState.toaddr.memo) {
      const len = Buffer.byteLength(
        memoTotal(sendPageState.toaddr.memo, sendPageState.toaddr.includeUAMemo, uaAddress),
        'utf8',
      );
      if (len > GlobalConst.memoMaxLength) {
        setValidMemo(-1);
      } else {
        setValidMemo(1);
      }
    } else {
      setValidMemo(0);
    }
  }, [memoTotal, sendPageState.toaddr.includeUAMemo, sendPageState.toaddr.memo, uaAddress]);

  const loadMoreClicked = useCallback(() => {
    setNumVt(numVt + 50);
  }, [numVt]);

  const moveValueTransferDetail = (index: number, type: number) => {
    // -1 -> Previous ValueTransfer
    //  1 -> Next ValueTransfer
    if ((index > 0 && type === -1) || (index < messagesSliced.length - 1 && type === 1)) {
      setValueTransferDetail(messagesSliced[index + type]);
      setValueTransferDetailIndex(index + type);
    }
  };

  const handleScrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isBottom =
      Math.round(contentOffset.y) >= Math.round(contentSize.height - layoutMeasurement.height) && scrollable;
    //console.log(Math.round(contentOffset.y), Math.round(contentSize.height - layoutMeasurement.height), isBottom);
    setIsAtBottom(isBottom);
    if (isBottom && !firstScrollToBottomDone) {
      //console.log('first scroll bottom done');
      setFirstScrollToBottomDone(true);
    }
  };

  const updateToField = async (memo: string | null) => {
    // Create the new state object
    const newState = new SendPageStateClass(new ToAddrClass(0));

    const newToAddr = sendPageState.toaddr;
    // Find the correct toAddr
    const toAddr = newToAddr;

    toAddr.to = address ? address : '';
    toAddr.amount = '0';
    toAddr.amountCurrency = '0';
    toAddr.includeUAMemo = true;

    if (memo !== null) {
      toAddr.memo = memo;
    }

    newState.toaddr = newToAddr;
    setSendPageState(newState);
    //console.log(newState);
  };

  const interceptCustomError = (error: string) => {
    // these error are not server related.
    if (
      error.includes('18: bad-txns-sapling-duplicate-nullifier') ||
      error.includes('18: bad-txns-sprout-duplicate-nullifier') ||
      error.includes('18: bad-txns-orchard-duplicate-nullifier')
    ) {
      // bad-txns-xxxxxxxxx-duplicate-nullifier (3 errors)
      return translate('send.duplicate-nullifier-error') as string;
    } else if (error.includes('64: dust')) {
      // dust
      return translate('send.dust-error') as string;
    }
  };

  const confirmSend = async () => {
    if (!sendTransaction || !clearToAddr || !setServerOption) {
      return;
    }
    setDisableSend(true);

    // first interrupt syncing Just in case...
    await RPC.rpcSetInterruptSyncAfterBatch(GlobalConst.true);

    // call the sendTransaction method in a timeout, allowing the modals to show properly
    setTimeout(async () => {
      let error = '';
      let customError: string | undefined;
      try {
        await sendTransaction();

        // Clear the fields
        clearToAddr();

        // scroll to top in history, just in case.
        setScrollToBottom(true);

        // the app send successfully on the first attemp.
        setDisableSend(false);
        return;
      } catch (err1) {
        error = err1 as string;

        customError = interceptCustomError(error);

        // in this point the App is failing, there is two possibilities:
        // 1. Server Error
        // 2. Another type of Error
        // here is worth it to try again with the best working server...
        // if the user selected a `custom` server, then we cannot change it.
        if (!customError && selectServer !== SelectServerEnum.custom) {
          // try send again with a working server
          const serverChecked = await selectingServer(serverUris(translate).filter((s: ServerUrisType) => !s.obsolete));
          let fasterServer: ServerType = {} as ServerType;
          if (serverChecked && serverChecked.latency) {
            fasterServer = { uri: serverChecked.uri, chainName: serverChecked.chainName };
          } else {
            fasterServer = server;
            // likely here there is a internet conection problem
            // all of the servers return an error because they are unreachable probably.
            // the 30 seconds timout was fired.
          }
          console.log(serverChecked);
          console.log(fasterServer);
          if (fasterServer.uri !== server.uri) {
            setServerOption(fasterServer, selectServer, false, true);
            // first interrupt syncing Just in case...
            await RPC.rpcSetInterruptSyncAfterBatch(GlobalConst.true);
          }

          try {
            await sendTransaction();

            // Clear the fields
            clearToAddr();

            // scroll to top in history, just in case.
            setScrollToBottom(true);

            // the app send successfully on the second attemp.
            setDisableSend(false);
            return;
          } catch (err2) {
            error = err2 as string;

            customError = interceptCustomError(error);
          }
        }
      }

      //console.log('sendtx error', error);
      // if the App is in background I need to store the error
      // and when the App come back to foreground shows it to the user.
      createAlert(
        setBackgroundError,
        addLastSnackbar,
        translate('send.sending-error') as string,
        `${customError ? customError : error}`,
        false,
        translate,
        sendEmail,
        info.zingolib,
      );
      setDisableSend(false);
    });
  };

  if (address) {
    console.log(
      'render Messages',
      dimensions.height,
      dimensions.height - memoFieldHeight,
      memoFieldHeight,
      keyboardVisible,
    );
  }

  return (
    <>
      <View
        accessible={true}
        accessibilityLabel={translate('history.title-acc') as string}
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          height: address
            ? `${100 - ((memoFieldHeight + (keyboardVisible ? 40 : -10)) * 100) / dimensions.height}%`
            : '100%',
        }}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={isValueTransferDetailModalShowing}
          onRequestClose={() => setValueTransferDetailModalShowing(false)}>
          <ValueTransferDetail
            index={valueTransferDetailIndex}
            length={messagesSliced.length}
            totalLength={messagesFiltered ? messagesFiltered.length : 0}
            vt={valueTransferDetail}
            closeModal={() => setValueTransferDetailModalShowing(false)}
            openModal={() => setValueTransferDetailModalShowing(true)}
            setPrivacyOption={setPrivacyOption}
            setSendPageState={setSendPageState}
            moveValueTransferDetail={moveValueTransferDetail}
          />
        </Modal>

        <Modal
          animationType="slide"
          transparent={false}
          visible={memoModalVisible}
          onRequestClose={() => setMemoModalVisible(false)}>
          <Memo
            closeModal={() => {
              setMemoModalVisible(false);
            }}
            memoUpdateToField={updateToField}
          />
        </Modal>

        {address && closeModal && openModal ? (
          <>
            <Header
              title={translate('messages.title') as string}
              noBalance={true}
              noSyncingStatus={true}
              noDrawMenu={true}
              setPrivacyOption={setPrivacyOption}
              addLastSnackbar={addLastSnackbar}
              closeScreen={closeModal}
            />
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 10,
                marginTop: 20,
                marginBottom: 10,
              }}>
              <View style={{ minWidth: 50, marginRight: 5 }}>
                {!getLabel(address) ? (
                  <FontAwesomeIcon
                    style={{ marginLeft: 5, marginRight: 5, marginTop: 0 }}
                    size={40}
                    icon={getIcon()}
                    color={colors.text}
                  />
                ) : (
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      backgroundColor: colors.primaryDisabled,
                      borderColor: colors.primary,
                      borderWidth: 2,
                      borderRadius: 22,
                      marginLeft: 5,
                      marginRight: 5,
                      marginTop: 0,
                    }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{`${getLabel(address)}`}</Text>
                  </View>
                )}
              </View>
              <AddressItem
                address={address}
                oneLine={true}
                withIcon={true}
                closeModal={closeModal}
                openModal={openModal}
              />
            </View>
          </>
        ) : (
          <>
            <Header
              title={translate('messages.title') as string}
              noBalance={true}
              noSyncingStatus={true}
              noDrawMenu={true}
              setPrivacyOption={setPrivacyOption}
              addLastSnackbar={addLastSnackbar}
              closeScreen={closeModal}
            />
            <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', margin: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setAnonymous(false);
                  setLoading(true);
                }}>
                <View
                  style={{
                    backgroundColor: !anonymous ? colors.primary : colors.sideMenuBackground,
                    borderRadius: 15,
                    borderColor: !anonymous ? colors.primary : colors.zingo,
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    marginHorizontal: 10,
                  }}>
                  <FadeText
                    style={{
                      color: !anonymous ? colors.sideMenuBackground : colors.zingo,
                      fontWeight: 'bold',
                    }}>
                    {translate('messages.link-all') as string}
                  </FadeText>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setAnonymous(true);
                  setLoading(true);
                }}>
                <View
                  style={{
                    backgroundColor: anonymous ? colors.primary : colors.sideMenuBackground,
                    borderRadius: 15,
                    borderColor: anonymous ? colors.primary : colors.zingo,
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    marginHorizontal: 0,
                  }}>
                  <FadeText
                    style={{
                      color: anonymous ? colors.sideMenuBackground : colors.zingo,
                      fontWeight: 'bold',
                    }}>
                    {translate('messages.link-anonymous') as string}
                  </FadeText>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}
        {(loading || !firstScrollToBottomDone) && (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
        )}
        <ScrollView
          ref={scrollViewRef}
          onScroll={handleScroll}
          onLayout={e => {
            const { height } = e.nativeEvent.layout;
            //console.log('layout HEIGHT >>>>>>>>>>>>>', height);
            setScrollViewHeight(height);
          }}
          onContentSizeChange={(_w: number, h: number) => {
            //console.log('content HEIGHT >>>>>>>>>>>>>', h);
            setContentScrollViewHeight(h);
          }}
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
            opacity: loading || !firstScrollToBottomDone ? 0 : 1,
          }}>
          {loadMoreButton ? (
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                marginTop: 10,
                marginBottom: 10,
              }}>
              <Button
                type={ButtonTypeEnum.Secondary}
                title={translate('history.loadmore') as string}
                onPress={loadMoreClicked}
              />
            </View>
          ) : (
            <>
              {!!messagesSliced && !!messagesSliced.length ? (
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginTop: 10,
                    marginBottom: 10,
                  }}>
                  <FadeText style={{ color: colors.primary }}>{translate('history.end') as string}</FadeText>
                </View>
              ) : (
                <View
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginTop: 10,
                    marginBottom: 10,
                  }}>
                  <FadeText style={{ color: colors.primary }}>{translate('messages.empty') as string}</FadeText>
                </View>
              )}
            </>
          )}

          {messagesSliced.flatMap((vt, index) => {
            let txmonth = vt.time ? moment(vt.time * 1000).format('MMM YYYY') : '--- ----';

            var month = '';
            if (txmonth !== lastMonth) {
              month = txmonth;
              lastMonth = txmonth;
            }

            return (
              <MessageLine
                key={`${index}-${vt.txid}-${vt.kind}`}
                index={index}
                vt={vt}
                month={month}
                setValueTransferDetail={(ttt: ValueTransferType) => setValueTransferDetail(ttt)}
                setValueTransferDetailIndex={(iii: number) => setValueTransferDetailIndex(iii)}
                setValueTransferDetailModalShowing={(bbb: boolean) => setValueTransferDetailModalShowing(bbb)}
                messageAddress={address}
              />
            );
          })}
          <View style={{ marginBottom: 30 }} />
        </ScrollView>
        {!isAtBottom && scrollable && !loading && firstScrollToBottomDone && (
          <TouchableOpacity onPress={handleScrollToBottom} style={{ position: 'absolute', bottom: 30, right: 10 }}>
            <FontAwesomeIcon
              style={{ marginLeft: 5, marginRight: 5, marginTop: 0 }}
              size={50}
              icon={faAnglesDown}
              color={colors.border}
            />
          </TouchableOpacity>
        )}
      </View>
      {!loading && firstScrollToBottomDone && address && selectServer !== SelectServerEnum.offline && (
        <View style={{ height: `${((memoFieldHeight + (keyboardVisible ? 40 : -10)) * 100) / dimensions.height}%` }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-start',
              margin: 10,
            }}>
            <View
              accessible={true}
              accessibilityLabel={translate('send.memo-acc') as string}
              style={{
                flexGrow: 1,
                flexDirection: 'row',
                borderWidth: 2,
                borderRadius: 5,
                borderColor: colors.text,
                minWidth: 48,
                minHeight: 48,
                maxHeight: 100,
              }}>
              <TextInput
                placeholder={translate('messages.message-placeholder') as string}
                placeholderTextColor={colors.placeholder}
                multiline
                style={{
                  flex: 1,
                  color: colors.text,
                  fontWeight: '600',
                  fontSize: 14,
                  minWidth: 48,
                  minHeight: 48,
                  marginLeft: 5,
                  backgroundColor: 'transparent',
                  textAlignVertical: 'top',
                }}
                value={sendPageState.toaddr.memo}
                onChangeText={(text: string) => updateToField(text)}
                onEndEditing={(e: any) => {
                  updateToField(e.nativeEvent.text);
                }}
                editable={!disableSend}
                onContentSizeChange={(e: any) => {
                  console.log(e.nativeEvent.contentSize.height);
                  if (e.nativeEvent.contentSize.height < (Platform.OS === GlobalConst.platformOSandroid ? 106 : 53)) {
                    setMemoFieldHeight(
                      e.nativeEvent.contentSize.height + (Platform.OS === GlobalConst.platformOSandroid ? 52 : 26),
                    );
                  }
                  if (
                    e.nativeEvent.contentSize.height > (Platform.OS === GlobalConst.platformOSandroid ? 70 : 35) &&
                    !memoIcon
                  ) {
                    setMemoIcon(true);
                  }
                  if (
                    e.nativeEvent.contentSize.height <= (Platform.OS === GlobalConst.platformOSandroid ? 70 : 35) &&
                    memoIcon
                  ) {
                    setMemoIcon(false);
                  }
                }}
                maxLength={GlobalConst.memoMaxLength}
              />
              {disableSend && (
                <ActivityIndicator style={{ marginTop: 7, marginRight: 7 }} size={25} color={colors.primaryDisabled} />
              )}
              {sendPageState.toaddr.memo && !disableSend && (
                <TouchableOpacity
                  onPress={() => {
                    updateToField('');
                  }}>
                  <FontAwesomeIcon
                    style={{ marginTop: 7, marginRight: memoIcon ? 0 : 7 }}
                    size={25}
                    icon={faXmark}
                    color={colors.primaryDisabled}
                  />
                </TouchableOpacity>
              )}
              {memoIcon && !disableSend && (
                <TouchableOpacity
                  onPress={() => {
                    setMemoModalVisible(true);
                  }}>
                  <FontAwesomeIcon style={{ margin: 7 }} size={30} icon={faMagnifyingGlassPlus} color={colors.border} />
                </TouchableOpacity>
              )}
            </View>
            {validMemo === 1 && !disableSend && (
              <View style={{ alignSelf: 'center', marginLeft: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    if (!netInfo.isConnected) {
                      addLastSnackbar({ message: translate('loadedapp.connection-error') as string });
                      return;
                    }
                    confirmSend();
                  }}>
                  <FontAwesomeIcon size={30} icon={faPaperPlane} color={colors.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginRight: validMemo === 1 ? 50 : 10,
              marginTop: -11,
            }}>
            <FadeText
              style={{
                marginTop: 0,
                fontWeight: 'bold',
                fontSize: 12.5,
                color: validMemo === -1 ? 'red' : colors.text,
              }}>{`${countMemoBytes(sendPageState.toaddr.memo, sendPageState.toaddr.includeUAMemo)} `}</FadeText>
            <FadeText style={{ marginTop: 0, fontSize: 12.5 }}>{translate('loadedapp.of') as string}</FadeText>
            <FadeText style={{ marginTop: 0, fontSize: 12.5 }}>
              {' ' + GlobalConst.memoMaxLength.toString() + ' '}
            </FadeText>
          </View>
        </View>
      )}
    </>
  );
};

export default React.memo(MessageList);
