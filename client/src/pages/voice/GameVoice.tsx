import React, { useState, useEffect, useMemo } from 'react';
import GameVoiceBox from 'components/GameVoiceBox';
import { LoadingOutlined } from '@ant-design/icons';
import { GameVoiceType } from 'types';
import FloatingIcon from 'components/FloatingIcon';
import Drawer from 'components/Drawer';
import PeopleIcon from '@mui/icons-material/People';
import CurrentPlayer from 'components/CurrentPlayer';
import FloatingBox from 'components/FloatingBox';
import SimplePopper from 'components/SimplePopper';

const GameVoice = (props: GameVoiceType) => {
  const { session, joinSession } = props;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <FloatingIcon
        icon={PeopleIcon}
        handleClick={() => handleDrawer()}
        top="1%"
        right="1%"
      />
      <Drawer anchor="right" isOpen={drawerOpen} handleDrawer={handleDrawer}>
        <CurrentPlayer handleDrawer={handleDrawer} {...props} />
      </Drawer>
      {!!session ? (
        <GameVoiceBox {...props} />
      ) : (
        <FloatingBox>
          <LoadingOutlined />
          오디오 연결 중...
          <SimplePopper />
        </FloatingBox>
      )}
    </>
  );
};

export default GameVoice;
