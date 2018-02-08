var functions = {
  initial: function(){
    return {total: 0, weekend: 0, weekday: 0, ratio: 0}
  },
  
  map: function(props) {
    props.total = 1;
    
    if (props.reporteddayofweek.trim() == "Saturday" || props.reporteddayofweek.trim() == "Sunday")
    {
      props.weekend = 1;
      props.weekday = 0;
    } else {
      props.weekend = 0;
      props.weekday = 1;
    }
    return props;
  },
  
  reduce: function(accumulated, props) {
    accumulated.total += props.total;
    accumulated.weekend += props.weekend;
    accumulated.weekday += props.weekday;
    accumulated.ratio = accumulated.weekday > 0 ? accumulated.weekend / accumulated.weekday : 0;
  }
}