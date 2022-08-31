import {
  BidAnimation,
  CoinSpin,
  GlobalLoader1,
  GlobalLoader2,
  Heart,
  LanderHero,
  LanderHero2,
  TransactionDeposit,
  TransactionGeneric,
  TeaserFull,
  TeaserMobile,
  ProphetBg2,
  ProphetBg2Mobile,
  MintSuccess,
} from './animations';

import { Player } from '@lottiefiles/react-lottie-player';
import React from 'react';

export enum AnimationName {
  bid = 'bid',
  coinSpin = 'coinSpin',
  deposit = 'deposit',
  generic = 'generic',
  gloader1 = 'gloader1',
  gloader2 = 'gloader2',
  heart = 'heart',
  landerHero = 'landerHero',
  landerHero2 = 'landerHero2',
  mintSuccess = 'mintSuccess',
  prophetBg2 = 'prophetBg2',
  prophetBg2Mobile = 'prophetBg2Mobile',
  teaserFull = 'teaserFull',
  teaserMobile = 'teaserMobile',
}

interface AnimationProps {
  loop?: boolean;
  autoplay?: boolean;
  keepLast?: boolean;
  size?: number | string;
  speed?: number;
  hover?: boolean;
  setRef?(ref): void;
  name: AnimationName;
}

const Animations = {
  bid: BidAnimation,
  coinSpin: CoinSpin,
  deposit: TransactionDeposit,
  generic: TransactionGeneric,
  gloader1: GlobalLoader1,
  gloader2: GlobalLoader2,
  heart: Heart,
  landerHero: LanderHero,
  landerHero2: LanderHero2,
  mintSuccess: MintSuccess,
  prophetBg2: ProphetBg2,
  prophetBg2Mobile: ProphetBg2Mobile,
  teaserFull: TeaserFull,
  teaserMobile: TeaserMobile,
};

const getAnimationByName = (name: AnimationName) => {
  return Animations[name];
};

const Animation = ({
  speed = 1,
  autoplay = true,
  keepLast = true,
  loop = false,
  name,
  setRef,
  size = 300,
  hover = false,
}: AnimationProps) => {
  return (
    <Player
      speed={speed}
      autoplay={autoplay}
      loop={loop}
      lottieRef={(instance) => (setRef ? setRef(instance) : null)}
      hover={hover}
      src={getAnimationByName(name)}
      keepLastFrame={keepLast}
      style={{ width: size, height: size }}
    ></Player>
  );
};

export default React.memo(Animation);
