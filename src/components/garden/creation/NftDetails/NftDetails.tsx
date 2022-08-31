import { getInitialGardenImage } from 'models/Nft/SeedIcons';
import { NftService } from 'services';
import { ToggleInput, NumberInput, TextInput } from 'components/shared/';
import { GardenCreationNftDetails, GardenCreationMainDetails } from 'models/';
import React, { useEffect } from 'react';
import styled from 'styled-components';

interface NftDetailsProps {
  gardenDetails: GardenCreationMainDetails;
  details: GardenCreationNftDetails | undefined;
  setNftDetails: (details: GardenCreationNftDetails, isValid: boolean) => void;
  seed?: number;
}

const defaultDetails: GardenCreationNftDetails = {
  image: '',
  mintNftAfter: 0,
  seed: 0,
};

const NftDetails = ({ gardenDetails, details, setNftDetails, seed }: NftDetailsProps) => {
  const detailsToRender = details || defaultDetails;
  const nftService = NftService.getInstance();
  const nftSeed = !seed ? nftService.buildNftSeed(gardenDetails.name, Date.now()) : seed;

  if (detailsToRender.image === '') {
    detailsToRender.image = getInitialGardenImage(nftSeed);
  }

  useEffect(() => setNftDetails({ ...detailsToRender, seed: nftSeed }, isFormValid(detailsToRender)), []);

  const onChangeItem = (prop: string, value: any) => {
    const newDetails: GardenCreationNftDetails = { ...detailsToRender, seed: nftSeed } as GardenCreationNftDetails;
    newDetails[prop] = value;
    setNftDetails(newDetails, isFormValid(newDetails));
  };

  const isValid = (prop: string, value: string): boolean => {
    if (prop === 'image' && value) {
      return value.length > 0;
    }
    if (prop === 'mintNftAfter' && value) {
      return parseInt(value) >= 0;
    }
    return !!value;
  };

  const isFormValid = (details: GardenCreationNftDetails) => {
    return isValid('image', details.image) && isValid('mintNftAfter', details.mintNftAfter.toString());
  };

  return (
    <NftDetailsWrapper>
      <GardenIconTitle>Garden icon</GardenIconTitle>
      <GardenImageSelection>
        <GardenImage>
          <img src={detailsToRender.image} />
        </GardenImage>
        <GardenUploadArea>
          <GardenDescription>
            You can use this pre-generated Babylon icon or enter your image url. Size: 100x100
          </GardenDescription>
          <StyledTextInput
            name={'customImage'}
            value={detailsToRender.image}
            valid={detailsToRender.image.length > 0}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              e.preventDefault();
              onChangeItem('image', e.currentTarget.value);
            }}
            placeholder="Enter image URL"
          />
        </GardenUploadArea>
      </GardenImageSelection>
      <NFTParams>
        <ToggleInput
          label="NFT Membership"
          tooltip={'If enabled, enables members to mint the garden NFT.'}
          name="nftToggle"
          required
          checked={detailsToRender.mintNftAfter > 0}
          onChange={(e: React.ChangeEvent<any>) => {
            e.preventDefault();
            onChangeItem('mintNftAfter', detailsToRender.mintNftAfter === 0 ? 86400 : 0);
          }}
        />
        {detailsToRender.mintNftAfter > 0 && (
          <>
            <NFTRequirements>
              You can configure additional requirements for members to mint the NFT like minimum time spent in the
              garden.
            </NFTRequirements>
            <NumberInput
              name={'mintNftAfter'}
              value={Math.ceil(detailsToRender.mintNftAfter / 86400)}
              onChange={(e: React.FormEvent<HTMLInputElement>) => {
                onChangeItem('mintNftAfter', (parseInt(e.currentTarget.value) * 86400).toString());
              }}
              label={'Minimum Time in Garden'}
              tooltip={'How long a member needs to be in the garden before beinga ble to mint the NFT.'}
              required
              min={'1'}
              max={'500'}
              valid={isValid('mintNftAfter', detailsToRender.mintNftAfter.toString())}
              postSpan="days"
            />
          </>
        )}
      </NFTParams>
    </NftDetailsWrapper>
  );
};

const NftDetailsWrapper = styled.div`
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  color: white;
`;

const GardenIconTitle = styled.div`
  font-size: 15px;
  width: 100%;
  margin-top: 30px;
`;

const GardenImageSelection = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  margin-top: 16px;
`;

const GardenUploadArea = styled.div`
  width: 300px;
  margin-left: 30px;
`;

const GardenDescription = styled.div`
  font-size: 13px;
  color: var(--blue-03);
`;

const GardenImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 6px;
  border: 2px solid var(--blue-05);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
  }
`;

const NFTParams = styled.div`
  width: 100%;
  margin-top: 80px;
  display: flex;
  flex-flow: column nowrap;
  max-width: 440px;
`;

const NFTRequirements = styled.div`
  width: 100%;
  font-size: 16px;
  color: var(--blue-03);
  margin: 10px 0 22px;
`;

const StyledTextInput = styled(TextInput)`
  margin: 10px 0 0;

  input {
    font-size: 12px;
  }

  label > div:first-child {
    display: none;
  }
`;

export default React.memo(NftDetails);
