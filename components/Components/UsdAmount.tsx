/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Utils from '../../app/utils';

type UsdAmountProps = {
  price?: number | null;
  amtZec?: number;
  style?: any;
};

const UsdAmount: React.FunctionComponent<UsdAmountProps> = ({ price, style, amtZec }) => {
  const { colors } = useTheme();
  var usdString;

  if (!price || typeof amtZec === 'undefined') {
    usdString = '--';
  } else {
    const usdAmount = price * amtZec;
    usdString = usdAmount.toFixed(2);
    if (usdString === '0.00' && amtZec > 0) {
      usdString = '< 0.01';
    }
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <Text style={{ color: colors.money, fontSize: 20, ...style }}>$</Text>
      <Text style={{ color: colors.money, fontSize: 20, fontWeight: '700', ...style }}>
        {' ' + Utils.toLocaleFloat(usdString)}
      </Text>
      <Text style={{ color: colors.money, fontSize: 20, ...style }}>{' USD'}</Text>
    </View>
  );
};

export default UsdAmount;