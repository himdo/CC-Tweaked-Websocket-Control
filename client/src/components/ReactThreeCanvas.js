import React from 'react';
import ThreeCanvas from './ThreeCanvas';
import "./ReactThreeCanvas.css"

class ThreeComponent extends React.Component {
//   static contextType = AppState;

  constructor(props) {
    super(props);
    this.state = {
      initialized: false,
    };

    this.threeCanvasEl = React.createRef();
  }

  componentDidUpdate() {
    // const { SOME_VAR } = this.context; // get a var from React Context
  }

  componentDidMount() {
    if (!this.state.initialized) {
      this.init();
    }
  }

  init = () => {
    // const appState = this.context; // access to the React Context store

    const threeCanvas = new ThreeCanvas({
      mountPoint: this.threeCanvasEl.current,
      width: this.threeCanvasEl.current.clientWidth,
      height: this.threeCanvasEl.current.clientHeight,
    });

    // start draw loop
    this.startDrawing(threeCanvas);
    this.setState({initialized: true});
  }

  startDrawing(threeCanvas) {
    const renderLoop = () => {
      threeCanvas.render();
    };

    threeCanvas.setAnimationLoop(renderLoop);
  }

  render() {
    return (
      <div
        className="threeComponent"
        // initialized={this.state.initialized}
      >
        <div className="visualizationMount" ref={this.threeCanvasEl}>
        </div>
      </div>
    );
  }
}

export default ThreeComponent;