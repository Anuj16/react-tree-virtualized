# react-tree-virtualized
A react tree component which can handle huge number of nodes using builtin virtualisation. It also supports asynchronous data fetching.

- Demo :-

![](react-virtualized-tree-checkable.gif)

# Usage
### Installation
Using npm

```
npm install react-tree-virtualized --save
```

Using yarn
```
yarn add react-tree-virtualized
```

### Include css

```
import 'react-tree-virtualized/src/tree.css'
```

### Sample Usage
Note - react-tree-virtualized is stateless, so you must update its `checked`, `expanded` and `loading` properties whenever any changes occur.

```
import React, { Component } from 'react';
import Tree from 'react-tree-virtualized';
import { nodes } from './data';
import 'react-tree-virtualized/src/tree.css';

class App extends Component {
    constructor() {
        super();
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
        const { checked, expanded, loading } = this.state;
        
        return (
            <div className="app-container">
                <Tree
                    nodes={nodes}
                    checked={checked}
                    expanded={expanded}
                    loading={loading}
                    onCheck={this.onCheck}
                    onExpand={this.onExpand}
                />
            </div>
        );
    }
}

export default App;

```

# Properties

### Tree Props

| prop | type | description | default value |
| ------ | ------ | ------ | ------ |
| nodes | `array` | **Required**. Array of tree nodes and its children. | 
| checked | `array` | Array of node values which are checked | `[]`
| expanded | `array` | Array of node values which are expanded | `[]`
| loading | `array` | Array of node values of which are in loading state. Can be used when the node's children needs to be **fetched from an API** | `[]`
| noCascade | `boolean` | If `true`, changing a children node's state will not affect the parent nodes. | `false`
| optimisticToggle | `boolean` | If `true`, changing a partially checked node's state will select all children. If `false`, it will deselect. | `true`
| showNodeIcon | `boolean` | If `false`, node's icon will not be displayed. | `true`
| onCheck | `function` | A function which will be called on selecting/deselecting any node. The function will get two parameters, `checked` and `node`. `checked` is the array of all the node values which are checked and `node` is the clicked node object. | `() => {}`
| onExpand | `function` | A function which will be called on expanding any node. The function will get three parameters, `expanded`, `loading` and `node`. `expanded` is the array of all the node values which are expanded. `loading` is the array of all the node values which are in loading state. `node` is the expanded node object. | `() => {}`

### Node props
Every node object of above `nodes` prop can have following props.

| prop | type | description | default value |
| ------ | ------ | ------ | ------ |
| label | `string` | **Required**. The display name of a node.
| value | `string` | **Required** A unique value for the node.
| level | `number` | **Required**. The level of nesting that the node has to be at. Ex - for root node the level will be 0 and for all the immediate children of the root, the level will be 1. | 
| children | `array` | An array of children nodes. | `null`
| isLeaf | `boolean` | If `true` expand/collapse icon will not be displayed | `false`
| disabled | `boolean` | If `true`, the node will not be selectable but still expandable. | `false`
| icon | `node` | The icon that should be displayed for the node. | `null`