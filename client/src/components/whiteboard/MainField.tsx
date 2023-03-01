import React from 'react';
import Drawer from '@mui/material/Drawer';
import CloseButton from './CloseButton';
import MemoDump from './MemoDump';
import AppBar from '@mui/material/AppBar';
import AddButton from './AddButton';
import { RootState } from 'stores';
import { useSelector } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const drawerWidth = 55;

const APPLICATION_DB_URL =
  process.env.REACT_APP_DB_URL || 'http://localhost:3003';

/* Left side main field of whiteboard */
function MainField(props: any) {
  const { handleClose } = props;
  const [memos, setMemos] = useState<any[]>([]);

  const currentUserId = useSelector(
    (state: RootState) => state.user.userLoginId
  );
  const currentUserNickname = useSelector(
    (state: RootState) => state.user.playerId
  );

  /* Get all memos in DB */
  const getMemos = async (justAdded: boolean) => {
    try {
      let response = await axios.get(APPLICATION_DB_URL + '/get-memos');
      let newArray = response.data;
      response.data.forEach((memo: any) => {
        if (memo.content === '' && !justAdded) {
          deleteMemo(memo._id);
          newArray.filter((memo: any) => memo.content !== '');
        }
      });
      setMemos([...newArray]);
    } catch (e) {
      console.error(e);
    }
  };

  /* Add a new memo */
  const addMemo = async () => {
    try {
      let response = await axios.post(APPLICATION_DB_URL + '/add-memo', {
        authorId: currentUserId,
        authorNickname: currentUserNickname,
      });
      await getMemos(true);
    } catch (e) {
      console.error(e);
    }
  };

  /* Update memo content */
  const updateMemo = async (id: any, content: string | undefined) => {
    try {
      let response = await axios.post(APPLICATION_DB_URL + '/update-memo', {
        _id: id,
        content: content,
      });
      // getMemos();
    } catch (e) {
      console.error(e);
    }
  };
  console.log('리렌더링');

  /* Change and save memo position */
  const changeMemoPos = async (id: any, x: number, y: number) => {
    try {
      let response = await axios.post(APPLICATION_DB_URL + '/change-memo-pos', {
        _id: id,
        x: x,
        y: y,
      });
      // getMemos();
    } catch (e) {
      console.error(e);
    }
  };
  /* Delete a memo */
  const deleteMemo = async (id: any) => {
    try {
      await axios.post(APPLICATION_DB_URL + `/delete-memo`, { _id: id });
      await getMemos(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    (async () => {
      await getMemos(false);
    })();
  }, []);

  return (
    <>
      <Drawer
        sx={{
          width: `${drawerWidth}%`,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: `${drawerWidth}%`,
            boxSizing: 'border-box',
            background: 'transparent',
            // overflow: 'hidden',
          },
        }}
        variant="permanent"
        anchor="right"
      >
        <div>
          <CloseButton handleClose={handleClose} />
        </div>
        {/* </AppBar> */}
        <MemoDump
          memos={memos}
          getMemos={getMemos}
          addMemo={addMemo}
          updateMemo={updateMemo}
          changeMemoPos={changeMemoPos}
          deleteMemo={deleteMemo}
          currentUserNickname={currentUserNickname}
        />

        <AddButton addMemo={addMemo} />
      </Drawer>
    </>
  );
}

export default React.memo(MainField);
