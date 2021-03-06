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
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';


const styles = (theme) => ({
  app: {
    alignItems: 'center',
    fontSize: '40px'
  },
  paper: {
    marginTop: theme.spacing(2),
    minWidth: "50%",
    margin: '4.5em auto',
    overflow: 'hidden',
  },
  searchBar: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    padding: '0em 0em 0.2em 0em'
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
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  }
});

function App(props) {
  const { classes } = props;

  // function
  function execute_io() {
    let agents = 5; // default number

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

    console.log('executing:',word,word_number,agents)
    handleToggle()

    axios.get(`http://localhost:8000/api/textgen?seed_text=${word}&n_outputs=${agents}&max_len=${word_number}`)
    .then(res => {
      console.log(res.data)
      setAllContents(res.data)
      setOpen(false)
      console.log('executed:',word,word_number,agents)
    })
    
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

  const handleToggle = () => {
    setOpen(!open);
  };

  function isInteger(value) {
    return /^\d+$/.test(value);
  }
  
  // state
  const [allContents, setAllContents] = useState([]);
  const [word, setWord] = useState("");
  const [word_number, setWordNumber] = useState("");
  const [agent, setAgent] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Box display="flex" flexDirection="column" className={classes.app}>
      <Box display="flex" flexDirection="row" className={classes.img_wrapper}>
        <b>Kuberta-IO </b>
        <div id='img_logo'>
          <img src='kubertaIO_logo.png' alt='' width='80px' />
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
                <Box display="flex" flexDirection="row" justifyContent="flex-start" flexWrap="wrap" >
                  <Box display="flex" flexDirection="row">
                    <ContactlessIcon className={classes.block} style={{ padding: '8px' }} color="inherit" fontSize="large" />
                    <TextField
                      value={word}
                      onChange={handleWordChange}
                      placeholder="ใส่หัวข้อการยุยงที่ท่านต้องการ"
                      InputProps={{
                        disableUnderline: false,
                        className: classes.searchInput,
                      }}
                      style={{ verticalAlign: 'middle', flexGrow: 4, minWidth: '200px', maxWidth: '250px' }}
                    />
                  </Box>
                  <Box display="flex" flexDirection="row">
                    <SettingsEthernetIcon className={classes.block} style={{ padding: '8px' }} color="inherit" fontSize="large" />
                    <TextField
                      value={word_number}
                      onChange={handleWordNumberChange}
                      placeholder="จำนวนคำที่สร้าง"
                      InputProps={{
                        disableUnderline: false,
                        className: classes.searchInput,
                      }}
                      style={{width: '20%', verticalAlign: 'middle', width: '120px'}}
                    />
                  </Box>
                  <Box display="flex" flexDirection="row">
                    <PeopleIcon className={classes.block} style={{ padding: '8px' }} color="inherit" fontSize="large" />
                    <TextField
                      value={agent}
                      onChange={handleAgentChange}
                      placeholder="agents"
                      InputProps={{
                        disableUnderline: false,
                        className: classes.searchInput,
                      }}
                      style={{width: '10%', verticalAlign: 'middle', width: '70px'}}
                    />
                  </Box>
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
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);