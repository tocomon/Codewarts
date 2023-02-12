import React, { useRef, useEffect } from 'react';
import { OpenVidu, Session, StreamManager } from 'openvidu-browser';

type AudioType = null | MediaStreamTrack;

const Audio = (props: { streamManager: StreamManager }) => {
  const { streamManager } = props;
  const audioRef = useRef();

  useEffect(() => {
    if (!!streamManager && !!audioRef) {
      streamManager.addVideoElement(audioRef.current);
    }
  }, [props]);

  return <video autoPlay={true} ref={audioRef} />;
};

export default Audio;
