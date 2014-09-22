var React = require('react');

module.exports = function(emitter) {
  var Track = React.createClass({
    getInitialState: function() {
      return {
        options: false
      };
    },
    previewTrack: function(ev) {
      // Gaa-rooss
      var id = ev.target.parentElement.parentElement.attributes['data-id'].value;
      emitter.emit('sequence:preview', {id: id});
    },
    removeTrack: function(ev){},
    showOptions: function(ev){
      this.setState({visible: true});
    },
    hideOptions: function(ev) {
      this.setState({visible: false});
    },
    render: function() {
      var track;
      var optChildren = [
          React.DOM.span({onClick: this.previewTrack}, "►"),
          React.DOM.span({onClick: this.removeTrack}, "X")
      ];

      var options = React.DOM.div({
        className: "track-opts" + (this.state.visible ? " showing" : "")
      }, optChildren);

      if (this.props.initial) {
        track = React.DOM.li({
          className: "track-title"
        }, this.props.track.title);
      } else {
        track = React.DOM.li({
          className: "track",
          onMouseOut: this.hideOptions,
          onMouseOver: this.showOptions,
          "data-id": this.props.track.id
        }, this.props.track.title, options);
      }

      return track;
    }
  });

  return Track;
};