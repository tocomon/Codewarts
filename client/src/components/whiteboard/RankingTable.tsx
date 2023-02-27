import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useSelector } from 'react-redux';
import { RootState } from 'stores';
import RankingTableContent from './RankingTableContent';

const colNames = [
  '순위',
  '닉네임',
  '백준아이디',
  '티어',
  '최장스트릭',
  '맞힌문제',
];

interface InfoType {
  nickname: string;
  bojId: string;
  tier: number;
  maxStreak: number;
  solved: number;
}

export default function RankingTable(props: any) {
  const { bojInfos } = props;
  const myNickname = useSelector((state: RootState) => state.user.playerId);
  console.log(myNickname);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: '40%' }} aria-label="simple table">
        <TableHead>
          <TableRow sx={{ background: 'darkred' }}>
            {colNames.map((colName: string) => (
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: '700', fontSize: '0.9em' }}
              >
                {colName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {bojInfos.map((info: InfoType, index: number) => (
            <RankingTableContent index={index} info={info} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}