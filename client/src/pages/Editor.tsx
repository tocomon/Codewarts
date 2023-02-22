import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { openGame } from '../stores/modeSlice';
import YjsCodeMirror from './editor/YjsCodeMirror';
import UserForm from './editor/UserForm';
import { RootState } from '../stores';
import Voice from 'pages/Voice';

const Editor = () => {
  const { roomId } = useSelector((state: RootState) => state.editor);
  const dispatch = useDispatch();
  return (
    <EditorDiv>
      <h1>Do Codeuk!</h1>
      {roomId ? (
        <div>
          <Voice roomKey={roomId} />
          <YjsCodeMirror />
        </div>
      ) : (
        <div>
          <UserForm />
        </div>
      )}
      <BtnDiv>
        <button type="button" onClick={() => dispatch(openGame())}>
          돌아가기
        </button>
      </BtnDiv>
    </EditorDiv>
  );
};

export default Editor;

const EditorDiv = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  position: absolute;
  top: 0;
  left: 0;
`;
const BtnDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: absolute;
  right: 10px;
  bottom: 10px;
`;
