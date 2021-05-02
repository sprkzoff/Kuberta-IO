import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  paper: {
    marginTop: theme.spacing(2),
    margin: 'auto',
    overflow: 'hidden',
    maxWidth: 500
  },
  block: {
    display: 'block',
  },
  avatar: {
    backgroundColor: blue[500],
  },
});

function Post(props) {
  const { classes } = props;

  return (
      <Paper className={classes.paper}>
        <CardHeader
        style={{backgroundColor: blue[100] }}
        avatar={
          <Avatar aria-label="recipe" className={classes.avatar}>io</Avatar>
        }
        title={
            <Typography variant="body2" color="textSecondary" component="p">
                {`Kuberta-IO หมายเลข ${props.number + 1}`}
            </Typography>
        }
      />
      <CardMedia
        className={classes.media}
        image="/static/images/cards/paella.jpg"
        title="Paella dish"
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.text}
        </Typography>
      </CardContent>
      </Paper>
  );
}

Post.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Post);