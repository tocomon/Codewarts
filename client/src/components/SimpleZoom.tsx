import * as React from 'react';
import Box from '@mui/material/Box';
import Zoom from '@mui/material/Zoom';
import { Button } from '@mui/material';
import { SimpleZoomProps } from 'types';

export default function SimpleZoom(props: SimpleZoomProps) {
  const checked = true;
  const { clickEmoji, emojies } = props;

  return (
    <Box sx={{ height: 53.7 }}>
      <Box sx={{ display: 'flex' }}>
        {emojies.map((item, index) => {
          return (
            <Zoom
              in={checked}
              style={{
                transitionDelay: checked ? `${100 * (index + 1)}ms` : '0ms',
              }}
            >
              <Button
                onClick={() => clickEmoji(item)}
                variant="contained"
                color="error"
                sx={{
                  fontSize: '28px',
                  backgroundColor: 'white',
                  minWidth: '50px',
                }}
              >
                {item}
              </Button>
            </Zoom>
          );
        })}
      </Box>
    </Box>
  );
}
