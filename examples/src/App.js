import React, { Component } from 'react';
import './App.css';
import Tree from './tree';
import { nodes } from './data';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: [],
            expanded: [],
            loading: []
        }
    }

    onCheck = (checked, node) => {
        this.setState({checked});
    }

    onExpand = (expanded, loading, node) => {
        this.setState({expanded});
    }

    render() {
        return (
            <div className="App">
                <Tree
                    noCascade={false}
                    checkable={true}
                    showHiddenFiles={true}
                    nodes={nodes}
                    checked={this.state.checked}
                    expanded={this.state.expanded}
                    loading={this.state.loading}
                    onCheck={this.onCheck}
                    onExpand={this.onExpand}
                    showNodeIcon={false}
                />
            </div>
        );
    }
}

export default App;
