import AaveIcon from './icons/aave.svg';
import AaveLargeIcon from './icons/aave_large.svg';
import AladdinIcon from './icons/aladdin.svg';
import AladdinLargeIcon from './icons/aladdin_large.svg';
import BalancerIcon from './icons/balancer.svg';
import BalancerLargeIcon from './icons/balancer_large.svg';
import BabylonIcon from './icons/babylon.svg';
import BabylonLargeIcon from './icons/babylon.svg';
import CompoundIcon from './icons/compound.svg';
import CompoundLargeIcon from './icons/compound_large.svg';
import CustomIcon from './icons/custom.svg';
import CustomLargeIcon from './icons/custom.svg';
import CoinGeckoIcon from './icons/coingecko.svg';
import CoinMarketCapIcon from './icons/coinmarketcap.svg';
import CurveIcon from './icons/curve.svg';
import CurveLargeIcon from './icons/curve_large.svg';
import ConvexIcon from './icons/convex.svg';
import ConvexLargeIcon from './icons/convex_large.svg';
import EtherscanIcon from './icons/etherscan.svg';
import HarvestIcon from './icons/harvest.svg';
import HarvestLargeIcon from './icons/harvest_large.svg';
import MessariIcon from './icons/messari.svg';
import NexusIcon from './icons/nexus.svg';
import NexusLargeIcon from './icons/nexus_large.svg';
import OneInchIcon from './icons/oneinch.svg';
import OneInchLargeIcon from './icons/oneinch_large.svg';
import OpenSeaIcon from './icons/opensea.svg';
import OpenSeaLargeIcon from './icons/opensea_large.svg';
import PaladinIcon from './icons/paladin.svg';
import PaladinLargeIcon from './icons/paladin_large.svg';
import PickleIcon from './icons/pickle.svg';
import PickleLargeIcon from './icons/pickle_large.svg';
import StakewiseIcon from './icons/stakewise.svg';
import StakewiseLargeIcon from './icons/stakewise_large.svg';
import RariIcon from './icons/rari.svg';
import SushiswapIcon from './icons/sushiswap.svg';
import SushiswapLargeIcon from './icons/sushiswap_large.svg';
import UniswapIcon from './icons/uniswap.svg';
import UniswapLargeIcon from './icons/uniswap_large.svg';
import YearnLargeIcon from './icons/yearn_large.svg';
import YearnIcon from './icons/yearn.svg';
import LidoIcon from './icons/lido.svg';
import ZapperIcon from './icons/zapper.svg';
import ZerionIcon from './icons/zerion.svg';

import React from 'react';
import styled from 'styled-components';

interface ProtocolIconProps {
  name: string;
  size: number;
  large?: boolean;
  className?: string;
}

const icons = {
  aave: AaveIcon,
  aave_large: AaveLargeIcon,
  aladdin: AladdinIcon,
  aladdin_large: AladdinLargeIcon,
  balancer: BalancerIcon,
  balancer_large: BalancerLargeIcon,
  babylon: BabylonIcon,
  babylon_large: BabylonLargeIcon,
  compound: CompoundIcon,
  compound_large: CompoundLargeIcon,
  coingecko: CoinGeckoIcon,
  coinmarketcap: CoinMarketCapIcon,
  curve: CurveIcon,
  curve_large: CurveLargeIcon,
  custom: CustomIcon,
  custom_large: CustomLargeIcon,
  convex: ConvexIcon,
  convex_large: ConvexLargeIcon,
  etherscan: EtherscanIcon,
  harvest: HarvestIcon,
  harvest_large: HarvestLargeIcon,
  messari: MessariIcon,
  nexus: NexusIcon,
  nexus_large: NexusLargeIcon,
  lido: LidoIcon,
  lido_large: LidoIcon,
  oneinch: OneInchIcon,
  oneinch_large: OneInchLargeIcon,
  opensea: OpenSeaIcon,
  opensea_large: OpenSeaLargeIcon,
  paladin: PaladinIcon,
  paladin_large: PaladinLargeIcon,
  pickle: PickleIcon,
  picke_large: PickleLargeIcon,
  stakewise: StakewiseIcon,
  stakewise_large: StakewiseLargeIcon,
  rari: RariIcon,
  sushiswap: SushiswapIcon,
  sushiswap_large: SushiswapLargeIcon,
  uniswap: UniswapIcon,
  uniswap_large: UniswapLargeIcon,
  yearn_large: YearnLargeIcon,
  yearn: YearnIcon,
  zapper: ZapperIcon,
  zerion: ZerionIcon,
};

const ProtocolIcon = ({ name, size, large, className }: ProtocolIconProps) => {
  let icon = icons[`${name}${large ? '_large' : ''}`];
  if (!icon) {
    icon = icons[`babylon${large ? '_large' : ''}`];
  }
  return (
    <ProtocolIconWrapper className={className}>
      <img src={icon} width={size} height={size} alt={name} />
    </ProtocolIconWrapper>
  );
};

const ProtocolIconWrapper = styled.div`
  display: flex;
`;

export default React.memo(ProtocolIcon);
