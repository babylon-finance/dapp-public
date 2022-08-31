import React from 'react';
import styled from 'styled-components';
import CustomIcon from './icons/custom.svg';
import IndexIcon from './icons/index.svg';
import LendIcon from './icons/lend.svg';
import LiquidityIcon from './icons/liquidity.svg';
import LongIcon from './icons/long.svg';
import ShortIcon from './icons/short.svg';
import NftIcon from './icons/nft.svg';
import YieldIcon from './icons/yield.svg';

interface OperationIconProps {
  name: string;
  size: number;
}

const icons = {
  custom: CustomIcon,
  index: IndexIcon,
  lend: LendIcon,
  liquidity: LiquidityIcon,
  long: LongIcon,
  borrow: ShortIcon,
  nft: NftIcon,
  yield: YieldIcon,
};

const OperationIcon = ({ name, size }: OperationIconProps) => {
  return (
    <StrategyIconWrapper>
      <img src={icons[name]} width={size} height={size} />
    </StrategyIconWrapper>
  );
};

const StrategyIconWrapper = styled.div`
  display: flex;
`;

export default React.memo(OperationIcon);
