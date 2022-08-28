import { Box, Link, Text } from '@chakra-ui/react';
import { Context } from '../../../context/store';
import { getSize } from '../../../types/constants';
import MobilePageHeader from '../../../components/mobilePageHeader/MobilePageHeader';
import React, { useContext } from 'react';
import Separator from '../../../components/separator/Separator';
import SettingsCard from '../settingsCard/SettingsCard';
import VersionFooter from '../../../components/versionFooter/VersionFooter';

const AboutSettings = () => {
  const [store] = useContext(Context);

  const { isMobile } = store;
  const size = getSize(isMobile);

  return (
    <>
      {isMobile ? <MobilePageHeader title={'About'} /> : null}
      <Box style={{ padding: isMobile ? 12 : 0 }}>
        <SettingsCard title={'About'}>
          <Text fontSize="md">
            Bloben is calendar web application for interacting with your CalDav
            servers.
          </Text>
          <Separator height={8} />
          <Text fontSize={size}>
            <Link
              _focus={{ boxShadow: 'none' }}
              target={'_blank'}
              color={store.isDark ? 'pink.300' : 'pink.500'}
              href={'https://bloben.com/docs'}
              onClick={() => window.open('https://bloben.com/docs', '_blank')}
            >
              Documentation
            </Link>{' '}
          </Text>
          <Separator height={48} />
          <VersionFooter />
        </SettingsCard>
      </Box>
    </>
  );
};

export default AboutSettings;
