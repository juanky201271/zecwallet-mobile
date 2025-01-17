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
} from 'react-native';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/ru';

import { useScrollToTop, useTheme } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons';

import { ButtonTypeEnum, SendPageStateClass, ValueTransferType } from '../../app/AppState';
import { ThemeType } from '../../app/types';
import FadeText from '../Components/FadeText';
import Button from '../Components/Button';
import ValueTransferDetail from './components/ValueTransferDetail';
import ValueTransferLine from './components/ValueTransferLine';
import { ContextAppLoaded } from '../../app/context';
import Header from '../Header';
import { MessagesAddress } from '../Messages';
import Utils from '../../app/utils';

type HistoryProps = {
  doRefresh: () => void;
  toggleMenuDrawer: () => void;
  poolsMoreInfoOnClick: () => void;
  syncingStatusMoreInfoOnClick: () => void;
  setZecPrice: (p: number, d: number) => void;
  setComputingModalVisible: (visible: boolean) => void;
  setPrivacyOption: (value: boolean) => Promise<void>;
  setUfvkViewModalVisible?: (v: boolean) => void;
  setSendPageState: (s: SendPageStateClass) => void;
  setShieldingAmount: (value: number) => void;
  setScrollToTop: (value: boolean) => void;
  scrollToTop: boolean;
  setScrollToBottom: (value: boolean) => void;
  scrollToBottom: boolean;
};

const History: React.FunctionComponent<HistoryProps> = ({
  doRefresh,
  toggleMenuDrawer,
  poolsMoreInfoOnClick,
  syncingStatusMoreInfoOnClick,
  setZecPrice,
  setComputingModalVisible,
  setPrivacyOption,
  setUfvkViewModalVisible,
  setSendPageState,
  setShieldingAmount,
  setScrollToTop,
  scrollToTop,
  setScrollToBottom,
  scrollToBottom,
}) => {
  const context = useContext(ContextAppLoaded);
  const { translate, valueTransfers, language, setBackgroundError, addLastSnackbar, server } = context;
  const { colors } = useTheme() as unknown as ThemeType;
  moment.locale(language);

  const [isValueTransferDetailModalShowing, setValueTransferDetailModalShowing] = useState<boolean>(false);
  const [isMessagesAddressModalShowing, setMessagesAddressModalShowing] = useState<boolean>(false);
  const [valueTransferDetail, setValueTransferDetail] = useState<ValueTransferType>({} as ValueTransferType);
  const [valueTransferDetailIndex, setValueTransferDetailIndex] = useState<number>(-1);
  const [numVt, setNumVt] = useState<number>(50);
  const [loadMoreButton, setLoadMoreButton] = useState<boolean>(false);
  const [valueTransfersSliced, setValueTransfersSliced] = useState<ValueTransferType[]>([]);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [zennyTips, setZennyTips] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  useScrollToTop(scrollViewRef);

  var lastMonth = '';

  const fetchValueTransfersSliced = useMemo(() => {
    if (!valueTransfers) {
      return [] as ValueTransferType[];
    }
    return valueTransfers.slice(0, numVt);
  }, [valueTransfers, numVt]);

  useEffect(() => {
    const fetchZennyTips = async () => {
      const zt: string = await Utils.getZenniesDonationAddress(server.chainName);
      setZennyTips(zt);
    };

    if (valueTransfers !== null) {
      fetchZennyTips();
      setLoadMoreButton(numVt < (valueTransfers ? valueTransfers.length : 0));
      const vts = fetchValueTransfersSliced;
      setValueTransfersSliced(vts);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  }, [fetchValueTransfersSliced, numVt, valueTransfers, server.chainName]);

  useEffect(() => {
    if (scrollToTop) {
      handleScrollToTop();
      setScrollToTop(false);
    }
  }, [scrollToTop, setScrollToTop]);

  const loadMoreClicked = useCallback(() => {
    setNumVt(numVt + 50);
  }, [numVt]);

  const moveValueTransferDetail = (index: number, type: number) => {
    // -1 -> Previous ValueTransfer
    //  1 -> Next ValueTransfer
    if ((index > 0 && type === -1) || (index < valueTransfersSliced.length - 1 && type === 1)) {
      setValueTransferDetail(valueTransfersSliced[index + type]);
      setValueTransferDetailIndex(index + type);
    }
  };

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
      <Modal
        animationType="slide"
        transparent={false}
        visible={isValueTransferDetailModalShowing}
        onRequestClose={() => setValueTransferDetailModalShowing(false)}>
        <ValueTransferDetail
          index={valueTransferDetailIndex}
          length={valueTransfersSliced.length}
          totalLength={valueTransfers !== null ? valueTransfers.length : 0}
          vt={valueTransferDetail}
          closeModal={() => setValueTransferDetailModalShowing(false)}
          openModal={() => setValueTransferDetailModalShowing(true)}
          setPrivacyOption={setPrivacyOption}
          setSendPageState={setSendPageState}
          moveValueTransferDetail={moveValueTransferDetail}
        />
      </Modal>

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
            address={Utils.messagesAddress(valueTransferDetail)}
            closeModal={() => setMessagesAddressModalShowing(false)}
            openModal={() => setMessagesAddressModalShowing(true)}
          />
        </Modal>
      )}

      <Header
        testID="valuetransfer text"
        poolsMoreInfoOnClick={poolsMoreInfoOnClick}
        syncingStatusMoreInfoOnClick={syncingStatusMoreInfoOnClick}
        toggleMenuDrawer={toggleMenuDrawer}
        setZecPrice={setZecPrice}
        title={translate('history.title') as string}
        setComputingModalVisible={setComputingModalVisible}
        setBackgroundError={setBackgroundError}
        setPrivacyOption={setPrivacyOption}
        setUfvkViewModalVisible={setUfvkViewModalVisible}
        addLastSnackbar={addLastSnackbar}
        setShieldingAmount={setShieldingAmount}
        setScrollToTop={setScrollToTop}
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
            {valueTransfersSliced &&
              valueTransfersSliced.length > 0 &&
              valueTransfersSliced.flatMap((vt, index) => {
                let txmonth = vt && vt.time ? moment(vt.time * 1000).format('MMM YYYY') : '--- ----';

                var month = '';
                if (txmonth !== lastMonth) {
                  month = txmonth;
                  lastMonth = txmonth;
                }

                return (
                  <ValueTransferLine
                    key={`${index}-${vt.txid}-${vt.kind}`}
                    index={index}
                    vt={vt}
                    month={month}
                    setValueTransferDetail={(ttt: ValueTransferType) => setValueTransferDetail(ttt)}
                    setValueTransferDetailIndex={(iii: number) => setValueTransferDetailIndex(iii)}
                    setValueTransferDetailModalShowing={(bbb: boolean) => setValueTransferDetailModalShowing(bbb)}
                    nextLineWithSameTxid={
                      index >= valueTransfersSliced.length - 1
                        ? false
                        : valueTransfersSliced[index + 1].txid === vt.txid
                    }
                    setSendPageState={setSendPageState}
                    setMessagesAddressModalShowing={(bbb: boolean) => setMessagesAddressModalShowing(bbb)}
                    addressProtected={vt.address === zennyTips}
                  />
                );
              })}
            {loadMoreButton ? (
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  marginTop: 10,
                  marginBottom: 30,
                }}>
                <Button
                  type={ButtonTypeEnum.Secondary}
                  title={translate('history.loadmore') as string}
                  onPress={loadMoreClicked}
                />
              </View>
            ) : (
              <>
                {!!valueTransfersSliced && !!valueTransfersSliced.length && (
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
              </>
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

export default React.memo(History);
