
import React from 'react';
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Material UI

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Styles

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '16px',
    marginRight: '8px',
    marginBottom: '0px',
    marginLeft: '8px'
  },

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	Function

function PreferenceItem(props) {
  const { classes } = props;
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6">
         {props.title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {props.content}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={props.action}>{("Edit")}</Button>
      </CardActions>
    </Card>
  );
}


export default withStyles(styles)(PreferenceItem);
