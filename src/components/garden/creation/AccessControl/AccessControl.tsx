import React, { useEffect } from 'react';
import styled from 'styled-components';
import { NumberInput, ToggleInput } from 'components/shared/';
import { GardenCreationAccessDetails } from 'models/';
interface MainDetailsProps {
  details: GardenCreationAccessDetails | undefined;
  setControlDetails: (details: GardenCreationAccessDetails, isValid: boolean) => void;
}

const defaultDetails: GardenCreationAccessDetails = {
  strategistShare: 10,
  stewardsShare: 5,
  publicLP: false,
  publicVoter: false,
  publicStrategist: false,
};

const AccessControl = ({ details, setControlDetails }: MainDetailsProps) => {
  const detailsToRender = details || defaultDetails;

  const onChangeItem = (prop: string, value: number) => {
    const newDetails: GardenCreationAccessDetails = { ...detailsToRender } as GardenCreationAccessDetails;
    newDetails[prop] = value;
    if (prop === 'publicLP' && !value) {
      newDetails.publicVoter = false;
      newDetails.publicStrategist = false;
    }
    setControlDetails(newDetails, isFormValid(newDetails));
  };
  const isValid = (prop: string, value: number): boolean => {
    if (prop === 'strategistShare' && value) {
      return value >= 0 && value <= 15 && value + detailsToRender.stewardsShare <= 15;
    }
    if (prop === 'stewardsShare' && value) {
      return value >= 0 && value <= 15 && value + detailsToRender.strategistShare <= 15;
    }
    if (prop === 'publicVoter' && value) {
      return detailsToRender.publicLP;
    }
    if (prop === 'publicStrategist' && value) {
      return detailsToRender.publicLP;
    }
    return value > 0;
  };

  const isFormValid = (details: GardenCreationAccessDetails) => {
    return isValid('strategistShare', details.strategistShare) && isValid('stewardsShare', details.stewardsShare);
  };

  useEffect(() => setControlDetails(detailsToRender, isFormValid(detailsToRender)), []);

  return (
    <DepositDetailsWrapper>
      <GroupTitle>Profit Sharing (Up to 15% max)</GroupTitle>
      <RowWrapper>
        <NumberInputWrapper>
          <NumberInput
            name={'strategistShare'}
            value={detailsToRender.strategistShare}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              onChangeItem('strategistShare', Number(e.currentTarget.value));
            }}
            noDecimals
            step={'1'}
            label={'Strategist Profit %'}
            required
            valid={isValid('strategistShare', detailsToRender.strategistShare)}
            tooltip={'The % of the profits that the strategy creator will receive upon completion.'}
          />
        </NumberInputWrapper>
        <NumberInputWrapper>
          <NumberInput
            name={'stewardsShare'}
            value={detailsToRender.stewardsShare}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              onChangeItem('stewardsShare', Number(e.currentTarget.value));
            }}
            noDecimals
            step={'1'}
            label={'Voters Profit %'}
            required
            valid={isValid('stewardsShare', detailsToRender.stewardsShare)}
            tooltip={'The % of the profits that the voters will receive upon completion.'}
          />
        </NumberInputWrapper>
      </RowWrapper>
      <GroupTitle>Permissions</GroupTitle>
      <RowWrapper>
        <NumberInputWrapper>
          <ToggleInput
            label="Open Garden"
            tooltip={'If enabled, anyone will be able to deposit and join the garden.'}
            name="publicLP"
            required
            checked={detailsToRender.publicLP}
            onChange={(e: React.ChangeEvent<any>) => {
              onChangeItem('publicLP', e.target.checked);
            }}
          />
        </NumberInputWrapper>
        <NumberInputWrapper>
          <ToggleInput
            label="Open Strategy Creation"
            tooltip={'If enabled, all members will be able to create strategies.'}
            name="publicStrategist"
            required
            checked={detailsToRender.publicStrategist}
            disabled={!detailsToRender.publicLP}
            onChange={(e: React.ChangeEvent<any>) => {
              onChangeItem('publicStrategist', e.target.checked);
            }}
          />
        </NumberInputWrapper>
        <NumberInputWrapper>
          <ToggleInput
            label="Open Votes"
            tooltip={'If enabled, all members will be able to vote on candidate strategies.'}
            name="publicVoter"
            required
            checked={detailsToRender.publicVoter}
            disabled={!detailsToRender.publicLP}
            onChange={(e: React.ChangeEvent<any>) => {
              onChangeItem('publicVoter', e.target.checked);
            }}
          />
        </NumberInputWrapper>
      </RowWrapper>
    </DepositDetailsWrapper>
  );
};

const DepositDetailsWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  color: white;
`;

const GroupTitle = styled.div`
  font-size: 18px;
  color: white;
  margin-top: 40px;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  width: 90%;

  > div {
    width: 45%;
  }
`;

const NumberInputWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  margin: 10px 0;
  color: white;
`;

export default React.memo(AccessControl);
