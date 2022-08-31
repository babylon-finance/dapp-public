import { Markdown, TabbedNavigation, TextArea, TurquoiseButton } from 'components/shared';

import { GardenNFTMeta, Tab } from 'models';
import { NftService } from 'services';

import { Box, Loader } from 'rimble-ui';
import styled from 'styled-components';
import React, { useState } from 'react';

interface DescriptionPanelProps {
  gardenAddress: string;
  gardenNFT: GardenNFTMeta;
  seed: number;
  refetch(): void;
}

const DESCRIPTION_TABS = [
  { display: 'Edit', metric: undefined, value: Tab.EDIT },
  { display: 'Preview', metric: undefined, value: Tab.PREVIEW },
];

const DescriptionPanel = ({ gardenAddress, gardenNFT, refetch, seed }: DescriptionPanelProps) => {
  const [formIsDirty, setFormIsDirty] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [descriptionTab, setDescriptionTab] = useState<string>(Tab.EDIT);
  const [description, setDescription] = useState(gardenNFT.description);
  const [valid, setValid] = useState<boolean>(true);

  const nftService = NftService.getInstance();

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const doUpdateDescription = async () => {
    if (valid) {
      setSubmitting(true);
      try {
        await nftService.updateGardenNft(gardenAddress, seed, { description: description });
        refetch();
        toggleModal();
      } catch (err) {
        console.error(err);
      }
    }
    setSubmitting(false);
  };

  const onDescriptionChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setFormIsDirty(e.currentTarget.value !== gardenNFT.description);
    setDescription(e.currentTarget.value);
    setValid(descriptionValid(e.currentTarget.value));
  };

  const descriptionValid = (value: string) => {
    return value.length > 0 && value.length <= 2000;
  };

  return (
    <StyledBox className="DescriptionPanel">
      <TabWrapper>
        <TabbedNavigation tabs={DESCRIPTION_TABS} setActiveTab={(tab) => setDescriptionTab(tab)} />
      </TabWrapper>
      {descriptionTab === Tab.EDIT && (
        <EditContainer>
          <InputContainer>
            <TextArea
              name={'description'}
              value={description}
              rows={10}
              height={'600px'}
              lineHeight={22}
              onChange={onDescriptionChange}
              label={'Description (Markdown supported)'}
              placeholder={'Enter the Garden description. Include anything Garden Members may want to know.'}
              required
              valid={valid}
            />
          </InputContainer>
          <PanelButtonRow>
            <TurquoiseButton disabled={!valid || !formIsDirty || submitting} onClick={doUpdateDescription}>
              {submitting ? <Loader size={12} color="var(--blue)" /> : 'Update'}
            </TurquoiseButton>
          </PanelButtonRow>
        </EditContainer>
      )}
      {descriptionTab === Tab.PREVIEW && (
        <DescriptionPreview>
          <Markdown content={description} />
        </DescriptionPreview>
      )}
    </StyledBox>
  );
};

const EditContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
`;

const PanelButtonRow = styled.div`
  margin-top: 30px;
  margin-left: auto;
`;

const InputContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
`;

const StyledBox = styled(Box)`
  margin-top: -40px;
`;

const DescriptionPreview = styled.div`
  color: var(--white);
  height: 600px;
  width: 100%;
  overflow-y: auto;
`;

const TabWrapper = styled.div`
  padding: 10px 0;
`;

export default React.memo(DescriptionPanel);
