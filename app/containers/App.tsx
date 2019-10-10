import * as React from "react";
import DevTools from "mobx-react-devtools";

export default class App extends React.Component {
  render() {
    return (
      <div>
        <DevTools
          position={{
            bottom: 0,
            right: 20
          }}
        />
        <div>{this.props.children}</div>
      </div>
    );
  }
}
