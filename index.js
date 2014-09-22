var React = require('react');
var CanvasGrid = require('canvas-grid');
var clock = require('audio-clock');

module.exports = function(emitter) {
  var Track = require('./components/track')(emitter);

  var Sequencer = React.createClass({
    getInitialState: function() {
      var bpm = 60000 / 180;
      return {bpm: bpm, activeIndex: 16, crate:{}};
    },
    updateSequence: function() {
      console.warn('Not Implemented');
    },
    setBPM: function(bpm) {
      var bpm = 1000 / (parseInt(bpm, 10) / 60);
      clock.setBPM(bpm);
      this.setState({bpm: bpm});
    },
    drawRowNumber: function(idx) {
      var d = idx > 8 ? 2.75 : 2.25;
      var x = idx*this.canvasGrid.rowWidth + (this.canvasGrid.rowWidth / d);
      this.canvasGrid.ctx.fillStyle = '#000000';
      this.canvasGrid.ctx.fillText(idx+1, x, this.canvasGrid.columnHeight / 1.75);
    },
    renderStep: function() {
      var index = this.state.activeIndex,
      lastIndex = index === 0 ? 16 : index - 1;

      this.canvasGrid.fillSection(index, 0, this.props.activeColor);
      this.drawRowNumber(index);

      this.canvasGrid.clearSection(lastIndex, 0);
      this.drawRowNumber(lastIndex);
    },
    updateStep: function(reset) {
      if (this.state.activeIndex === 16 || reset) {
        this.setState({activeIndex: 0});
      } else {
        this.setState({activeIndex: this.state.activeIndex + 1});
      }
      console.log('update: ', this.state.activeIndex);

      this.renderStep();
      emitter.emit('sequence:step', {x: this.state.activeIndex});
    },
    play: function() {
      clock.start();
    },
    pause: function() {
      var currentIndex = this.state.activeIndex;
      clock.stop();
      this.setState({activeIndex: currentIndex});
    },
    stop: function() {
      this.setState({activeIndex: -1});
      clock.stop();
    },
    componentWillUnmount: function() {
      if (this.interval) clearInterval(this.interval);
      this.interval = undefined;
    },
    componentDidMount: function() {
      if (this.props.bpm) this.setBPM(this.props.bpm);
      this.canvasEl = this.refs.grid.getDOMNode();
      var grid = this.canvasGrid = new CanvasGrid(this.canvasEl);
      this.canvasGrid.drawMatrix({y: this.props.tracks.length, x: 16});

      var activeColor = this.props.activeColor || 'pink';
      this.canvasEl.addEventListener('click', function(ev) {
        if (ev.gridInfo.y === 0) return;

        if (ev.gridInfo.color.hex !== this.props.activeColor) {
          grid.fillSection(ev.gridInfo.x, ev.gridInfo.y, this.props.activeColor);
        } else {
          grid.clearSection(ev.gridInfo.x, ev.gridInfo.y);
        }

        emitter.emit('sequence:set', ev.gridInfo);
      }.bind(this));

      // draw numbers for top row
      var i = 0;
      grid.ctx.font = '14px sans-serif';

      while (i < 16) {
        this.drawRowNumber(i);
        i++;
      }

      clock.onTick(this.updateStep);

      emitter.on('sequence:bpm', function(ev) {
        this.setBPM(ev.bpm);
      }, this);

      emitter.on('sequence:play', function(ev) {
        this.play();
      }, this);

      emitter.on('sequence:pause', function(ev) {
        this.pause();
      }, this);

      emitter.on('sequence:stop', function(ev) {
        this.stop();
      }, this);

      emitter.on('sequence:remove', function() {
        if (this.interval) clearInterval(this.interval);
        this.interval = undefined;
      }, this);

      emitter.on('__sequence:track:remove', function(ev) {
        grid.removeRow(ev.index);
      });
    },
    drawRow: function() {
      // debugger;
    },
    componentWillUnmount: function() {
      clearInterval(this.interval);
    },
    render: function() {
      var addTrack = function(track) {
        var initial = track.header ? true : false;
        this.drawRow(initial);
        return Track({track: track, initial: initial});
      };

      var tracks = this.props.tracks.map(addTrack, this);

      var tracklist = React.DOM.ul({
        className: 'tracks'
      }, tracks);

      var container = React.DOM.div(null, tracklist, React.DOM.canvas({
        width: 700,
        ref: 'grid',
        className: 'grid'
      }));

      var sequence = React.DOM.section({
        className: 'sequencer-component',
        bpm: this.props.bpm,
        muted: this.props.muted || false
      }, container);

      return sequence;
    }
  });

  return Sequencer;
}