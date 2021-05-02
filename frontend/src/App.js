import { useState } from 'react';
import './App.css';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ContactlessIcon from '@material-ui/icons/Contactless';
import PeopleIcon from '@material-ui/icons/People';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import { withStyles } from '@material-ui/core/styles';
import Post from './Post';
import { blue } from '@material-ui/core/colors';
import axios from 'axios';


const styles = (theme) => ({
  app: {
    alignItems: 'center',
    fontSize: '40px'
  },
  paper: {
    marginTop: theme.spacing(2),
    minWidth: "50%",
    margin: 'auto',
    overflow: 'hidden',
  },
  searchBar: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  searchInput: {
    fontSize: theme.typography.fontSize,
    margin: '10px'
  },
  block: {
    display: 'block',
  },
  execute: {
    display: 'block',
    marginRight: theme.spacing(1)
  },
  contentWrapper: {
    margin: '40px 16px'
  },
  img_wrapper: {
    marginTop: theme.spacing(8)
  }
});

function App(props) {
  const { classes } = props;

  // function
  function execute_io() {
    let agents = 5; // default number

    if(word.trim() === "") {
      alert("ใส่หัวข้อด้วย อย่าหลอน")
      return
    }
    if(word_number.trim() === "") {
      alert("จะให้สร้างประโยคยาวแค่ไหนก็บอกมาดิ")
      return
    }
    if(!isInteger(word_number.trim())) {
      alert("อ่านบ้างปะเนี่ย จำนวนคำที่สร้างเค้าให้ใส่ตัวเลข")
      return
    }

    if(agent.trim() !== "") {
      agents = parseInt(agent.trim(),10)
    }

    let word_format = parseInt(word.trim(),10)
    let wordnumber_format = parseInt(word_number.trim(),10)

    axios.get(`http://localhost:8000/api/textgen?seedtext=${word_format}&n_outputs=${wordnumber_format}&max_len=${agents}`)
    .then(res => {
      console.log(res.data)
    })

    console.log('executed:',word,word_number,agents)
    setAllContents(["test sentence 1","test sentence 2"])
  }

  function handleWordChange(e) {
    setWord(e.target.value)
  }

  function handleWordNumberChange(e) {
    setWordNumber(e.target.value)
  }

  function handleAgentChange(e) {
    setAgent(e.target.value)
  }

  function isInteger(value) {
    return /^\d+$/.test(value);
  }
  
  // state
  const [allContents, setAllContents] = useState([]);
  const [word, setWord] = useState("");
  const [word_number, setWordNumber] = useState("");
  const [agent, setAgent] = useState("");

  return (
    <Box display="flex" flexDirection="column" className={classes.app}>
      <Box display="flex" flexDirection="row" className={classes.img_wrapper}>
        <b>Kuberta-IO </b>
        <div id='img_logo'>
          <img src='kubertaIO_logo.png' width='80px' />
          <div class="circle" style={{animationDelay: '0s'}}></div>
          <div class="circle" style={{animationDelay: '1s'}}></div>
          <div class="circle" style={{animationDelay: '2s'}}></div>
        </div>
      </Box>
      <Paper className={classes.paper}>
        <AppBar className={classes.searchBar} position="static" style={{background:blue[200]}} elevation={0}>
          <Toolbar>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <ContactlessIcon className={classes.block} color="inherit" fontSize="large" />
              </Grid>
              <Grid item xs>
                <Box display="flex" flexDirection="row" justifyContent="flex-start">
                  <TextField
                    value={word}
                    onChange={handleWordChange}
                    placeholder="ใส่หัวข้อการยุยงที่ท่านต้องการ"
                    InputProps={{
                      disableUnderline: false,
                      className: classes.searchInput,
                    }}
                    style={{ verticalAlign: 'middle', flexGrow: 4 }}
                  />
                  <SettingsEthernetIcon className={classes.block} style={{ padding: '8px' }} color="inherit" fontSize="large" />
                  <TextField
                    value={word_number}
                    onChange={handleWordNumberChange}
                    placeholder="จำนวนคำที่สร้าง"
                    InputProps={{
                      disableUnderline: false,
                      className: classes.searchInput,
                    }}
                    style={{width: '20%', verticalAlign: 'middle'}}
                  />
                  <PeopleIcon className={classes.block} style={{ padding: '8px' }} color="inherit" fontSize="large" />
                  <TextField
                    value={agent}
                    onChange={handleAgentChange}
                    placeholder="agents"
                    InputProps={{
                      disableUnderline: false,
                      className: classes.searchInput,
                    }}
                    style={{width: '10%', verticalAlign: 'middle'}}
                  />
                </Box>
              </Grid>
              <Grid item>
                <Button variant="contained" style={{color:"#ffffff",backgroundColor:blue[500]}} className={classes.execute} onClick={execute_io} >
                  ปฏิบัติการ
                </Button>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <div className={classes.contentWrapper}>{
          (allContents.length === 0) ?
          <Typography color="textSecondary" align="center">ไม่มีข้อมูลการยุยง</Typography> : 
          allContents.map((it,idx) => {
            return <Post text={it} number={idx} />
          })
        }
        </div>
      </Paper>
    </Box>
  );
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);