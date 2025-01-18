/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState, ReactNode, useEffect } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { TabView, TabBar, SceneRendererProps, Route, NavigationState, TabBarItem } from 'react-native-tab-view';
import { useTheme } from '@react-navigation/native';

import SingleAddress from '../Components/SingleAddress';
import { ThemeType } from '../../app/types';
import { ContextAppLoaded } from '../../app/context';
import Header from '../Header';
import RegText from '../Components/RegText';
import { Scene } from 'react-native-tab-view/lib/typescript/src/types';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/pt';
import 'moment/locale/ru';

import { AddressClass, AddressKindEnum, ModeEnum } from '../../app/AppState';
import FadeText from '../Components/FadeText';
import { ShieldedEnum } from '../../app/AppState/enums/ShieldedEnum';

type ReceiveProps = {
  toggleMenuDrawer: () => void;
  syncingStatusMoreInfoOnClick: () => void;
  setUfvkViewModalVisible?: (v: boolean) => void;
  alone: boolean;
};

const Receive: React.FunctionComponent<ReceiveProps> = ({
  toggleMenuDrawer,
  syncingStatusMoreInfoOnClick,
  setUfvkViewModalVisible,
  alone,
}) => {
  const context = useContext(ContextAppLoaded);
  const { translate, addresses, uOrchardAddress, mode, addLastSnackbar, language } = context;
  const { colors } = useTheme() as unknown as ThemeType;
  moment.locale(language);

  const [index, setIndex] = useState<number>(0);
  const [routes, setRoutes] = useState<{ key: string; title: string }[]>([]);

  const [uFullAddr, setUFulladdr] = useState<AddressClass>({} as AddressClass);
  const [uOrchardAddr, setUOrchardAddr] = useState<AddressClass>({} as AddressClass);
  const [zAddr, setZAddr] = useState<AddressClass>({} as AddressClass);
  const [tAddr, setTAddr] = useState<AddressClass>({} as AddressClass);
  const [shielded, setShielded] = useState<ShieldedEnum>(ShieldedEnum.orchard);

  const dimensions = {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  };

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const uFullAdd = addresses.filter(a => a.addressKind === AddressKindEnum.u && a.receivers.length === 3) || [];
      const uOrchardAdd = addresses.filter(a => a.addressKind === AddressKindEnum.u && a.receivers.length === 1) || [];
      const zAdd = addresses.filter(a => a.addressKind === AddressKindEnum.z) || [];
      const tAdd = addresses.filter(a => a.addressKind === AddressKindEnum.t) || [];
      setUFulladdr(uFullAdd[0]);
      setUOrchardAddr(uOrchardAdd[0]);
      setZAddr(zAdd[0]);
      setTAddr(tAdd[0]);
    }
  }, [addresses]);

  useEffect(() => {
    const basicModeRoutes = [{ key: 'uorchardaddr', title: translate('receive.u-title') as string }];
    const advancedModeRoutes = [
      { key: 'uorchardaddr', title: translate('receive.u-title') as string },
      { key: 'taddr', title: translate('receive.t-title') as string },
    ];
    setRoutes(mode === ModeEnum.basic ? basicModeRoutes : advancedModeRoutes);
  }, [mode, translate]);

  const renderScene: (
    props: SceneRendererProps & {
      route: Route;
    },
  ) => ReactNode = ({ route }) => {
    switch (route.key) {
      case 'uorchardaddr': {
        let uOrchard = translate('receive.noaddress') as string;
        if (uOrchardAddr) {
          uOrchard = uOrchardAddr.address;
        }
        let sapling = translate('receive.noaddress') as string;
        if (zAddr) {
          sapling = zAddr.address;
        }
        let uFull = translate('receive.noaddress') as string;
        if (uFullAddr) {
          uFull = uFullAddr.address;
        }

        return (
          <>
            {!!addresses && !!uOrchardAddress && (
              <>
                {shielded === ShieldedEnum.orchard && (
                  <SingleAddress address={uOrchard} index={0} total={1} prev={() => {}} next={() => {}} />
                )}
                {shielded === ShieldedEnum.full && (
                  <SingleAddress address={uFull} index={0} total={1} prev={() => {}} next={() => {}} />
                )}
                {shielded === ShieldedEnum.sapling && (
                  <SingleAddress address={sapling} index={0} total={1} prev={() => {}} next={() => {}} />
                )}
              </>
            )}
            {mode === ModeEnum.advanced && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'auto',
                  marginHorizontal: 5,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setShielded(ShieldedEnum.orchard);
                  }}>
                  <View
                    style={{
                      backgroundColor: shielded === ShieldedEnum.orchard ? colors.primary : colors.sideMenuBackground,
                      borderRadius: 15,
                      borderColor: shielded === ShieldedEnum.orchard ? colors.primary : colors.zingo,
                      borderWidth: 1,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      marginHorizontal: 5,
                    }}>
                    <FadeText
                      style={{
                        color: shielded === ShieldedEnum.orchard ? colors.sideMenuBackground : colors.zingo,
                        fontWeight: 'bold',
                      }}>
                      {translate('receive.shielded-orchard') as string}
                    </FadeText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShielded(ShieldedEnum.full);
                  }}>
                  <View
                    style={{
                      backgroundColor: shielded === ShieldedEnum.full ? colors.primary : colors.sideMenuBackground,
                      borderRadius: 15,
                      borderColor: shielded === ShieldedEnum.full ? colors.primary : colors.zingo,
                      borderWidth: 1,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      marginHorizontal: 5,
                    }}>
                    <FadeText
                      style={{
                        color: shielded === ShieldedEnum.full ? colors.sideMenuBackground : colors.zingo,
                        fontWeight: 'bold',
                      }}>
                      {translate('receive.shielded-full') as string}
                    </FadeText>
                  </View>
                </TouchableOpacity>
                {false && (
                  <TouchableOpacity
                    onPress={() => {
                      setShielded(ShieldedEnum.sapling);
                    }}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        marginHorizontal: 15,
                      }}>
                      <FadeText
                        style={{
                          color: shielded === ShieldedEnum.sapling ? colors.primary : colors.zingo,
                          opacity: shielded === ShieldedEnum.sapling ? 1 : undefined,
                          textDecorationLine: 'underline',
                          fontWeight: 'bold',
                        }}>
                        {translate('receive.shielded-sapling') as string}
                      </FadeText>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        );
      }
      case 'taddr': {
        let taddr = translate('receive.noaddress') as string;
        if (tAddr) {
          taddr = tAddr.address;
        }

        return (
          !!addresses &&
          !!uOrchardAddress && <SingleAddress address={taddr} index={0} total={1} prev={() => {}} next={() => {}} />
        );
      }
    }
  };

  const renderLabelCustom: (
    scene: Scene<Route> & {
      focused: boolean;
      color: string;
    },
  ) => ReactNode = ({ route, focused, color }) => {
    const w = (dimensions.width - 50) / (mode === ModeEnum.basic ? 1 : 2);
    //const w = route.key === 'uaddr' ? '40%' : '30%';
    return (
      <View
        style={{
          width: w,
          alignItems: 'center',
          justifyContent: 'center',
          height: 50,
        }}>
        <RegText
          style={{
            fontWeight: mode === ModeEnum.basic ? 'normal' : focused ? 'bold' : 'normal',
            fontSize: mode === ModeEnum.basic ? 14 : focused ? 15 : 14,
            color: color,
          }}>
          {route.title ? route.title : ''}
        </RegText>
        {route.key === 'uaddr' && mode === ModeEnum.basic && (
          <RegText style={{ fontSize: 11, color: focused ? colors.primary : color }}>(e.g. zingo)</RegText>
        )}
        {route.key === 'zaddr' && mode === ModeEnum.basic && (
          <RegText style={{ fontSize: 11, color: focused ? colors.primary : color }}>
            (e.g. ledger, old wallets)
          </RegText>
        )}
        {route.key === 'taddr' && mode === ModeEnum.basic && (
          <RegText style={{ fontSize: 11, color: focused ? colors.primary : color }}>(e.g. coinbase, gemini)</RegText>
        )}
      </View>
    );
  };

  const renderTabBarPage: (
    props: SceneRendererProps & {
      navigationState: NavigationState<Route>;
    },
  ) => ReactNode = props => {
    return (
      <View
        accessible={true}
        accessibilityLabel={translate('receive.title-acc') as string}
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
        }}>
        <Header
          toggleMenuDrawer={toggleMenuDrawer}
          syncingStatusMoreInfoOnClick={syncingStatusMoreInfoOnClick}
          title={
            alone
              ? (translate('receive.title-basic-alone') as string)
              : mode === ModeEnum.basic
              ? (translate('receive.title-basic') as string)
              : (translate('receive.title-advanced') as string)
          }
          noBalance={true}
          noPrivacy={true}
          setUfvkViewModalVisible={setUfvkViewModalVisible}
          addLastSnackbar={addLastSnackbar}
        />

        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: colors.primary }}
          style={{ backgroundColor: colors.background }}
          renderLabel={renderLabelCustom}
          renderTabBarItem={p => <TabBarItem {...p} key={p.route.key} />}
        />
      </View>
    );
  };

  const returnPage = (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBarPage}
      onIndexChange={setIndex}
    />
  );

  //console.log('render Receive - 4');

  return returnPage;
};

export default Receive;
