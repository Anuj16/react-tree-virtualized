import classNames from 'classnames';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import shortid from 'shortid';
import ReactDOM from 'react-dom';

import TreeNode from './treeNode';
import nodeShape from './nodeShape';
const keys = {
    SPACEBAR : 32,
    ENTER : 13,
    RIGHTARROW : 39,
    LEFTARROW : 37,
    UPARROW : 38,
    DOWNARROW : 40
};


class Tree extends React.Component {
    static propTypes = {
        checkable: PropTypes.bool,
        showHiddenFiles: PropTypes.bool,
        childHeight: PropTypes.number,
        nodes: PropTypes.arrayOf(nodeShape).isRequired,
        checked: PropTypes.arrayOf(PropTypes.string),
        loading: PropTypes.arrayOf(PropTypes.string),
        disabled: PropTypes.bool,
        expandDisabled: PropTypes.bool,
        expanded: PropTypes.arrayOf(PropTypes.string),
        name: PropTypes.string,
        nameAsArray: PropTypes.bool,
        noCascade: PropTypes.bool,
        optimisticToggle: PropTypes.bool,
        showNodeIcon: PropTypes.bool,
        onCheck: PropTypes.func,
        onExpand: PropTypes.func,
    };

    static defaultProps = {
        checkable: true,
        showHiddenFiles: false,
        childHeight: 30,

        checked: [],
        loading: [],
        disabled: false,
        expandDisabled: false,
        expanded: [],
        name: undefined,
        nameAsArray: false,
        noCascade: false,
        optimisticToggle: true,
        showNodeIcon: true,
        onCheck: () => {},
        onExpand: () => {},
    };

    constructor(props) {
        super(props);

        this.id = `rvt-${shortid.generate()}`;
        this.nodes = {};

        this.flattenNodes(props.nodes, props.showHiddenFiles, props.expanded);
        this.unserializeLists({
            checked: props.checked,
            expanded: props.expanded,
            loading: props.loading,
        });

        this.onCheck = this.onCheck.bind(this);
        this.onExpand = this.onExpand.bind(this);

        // Virtualization related default values. These changes on componentDidMount and onScroll.
        this.state = {
            numberOfNodesToRender: 10,
            scrollTop: 0,
            startNodeIndex: 0,
            endNodeIndex: 9,
        }
    }

    componentDidMount = () => {
        const treeContainer = this.refs.insyncTreeContainer,
            numberOfNodesToRender = Math.floor(treeContainer.clientHeight / this.props.childHeight) + 2,
            startNodeIndex = 0,
            endNodeIndex = startNodeIndex + numberOfNodesToRender - 1;
            // treeContainerEle = document.getElementsByClassName("react-checkbox-tree");
            // document.getElementsByClassName("icDataTableWrpInr")[0].addEventListener('keydown', this.onKeyDown, false);
            // treeContainerEle[0].addEventListener('keyup', this.onKeyUp, false);
        

        this.setState({
            numberOfNodesToRender,
            startNodeIndex,
            endNodeIndex
        });
    }

    componentWillReceiveProps({ nodes, checked, expanded, loading, showHiddenFiles }) {
        if (!isEqual(this.props.nodes, nodes) || this.props.showHiddenFiles !== showHiddenFiles || !isEqual(this.props.expanded, expanded)) {
            this.nodes = {};
            this.flattenNodes(nodes, showHiddenFiles, expanded);
        }

        this.unserializeLists({ checked, expanded, loading });
    }
    onKeyDown(e){
        if (e.keyCode === keys.DOWNARROW || e.keyCode === keys.UPARROW || e.keyCode === keys.SPACEBAR) {
            e.preventDefault();
            
          }
    }
    onKeyUp(e) {
        this.currentEle = document.activeElement;
        if (e.keyCode === keys.DOWNARROW) {
          e.preventDefault();
          let next = this.currentEle.nextSibling;
          if (next && next.tagName === "DIV") {
            this.currentEle.nextSibling.focus();
          }
        }
        if (e.keyCode === keys.UPARROW) {
          e.preventDefault();
          let next = this.currentEle.previousSibling;
          if (next && next.tagName === "DIV") {
            this.currentEle.previousSibling.focus();
          }
        }
        if (e.keyCode === keys.SPACEBAR) {
          e.preventDefault();
          this.currentEle.getElementsByTagName("label")[0].click();
        }
        if (e.keyCode === keys.RIGHTARROW) {
          e.preventDefault();
          if(!this.currentEle.classList.contains('expanded-node')){
              this.currentEle.getElementsByTagName("button")[0].click();
              this.currentEle.setAttribute("aria-expanded","true");
          }
        }
        if (e.keyCode === keys.LEFTARROW) {
            e.preventDefault();
            if(this.currentEle.classList.contains('expanded-node')){
                this.currentEle.getElementsByTagName("button")[0].click();
                this.currentEle.setAttribute("aria-expanded","false");
            }
        }
    }
    onCheck(node) {
        const { noCascade, onCheck } = this.props;
        this.toggleChecked(node, node.checked, noCascade);
        onCheck(this.serializeList('checked'), node);
    }

    onExpand(node) {
        const { onExpand } = this.props;

        this.toggleNode('expanded', node, node.expanded);
        this.toggleNode('loading', node, node.expanded);
        onExpand(this.serializeList('expanded'), this.serializeList('loading'), node);
    }

    getCheckState(node, noCascade) {
        
        // If halfChecked key is true and there are no children, return 2 irrespective the number of children
        if( this.isChildrenEmpty(node) && node.halfChecked ) {
            return 2;
        }

        if (this.isChildrenEmpty(node) || noCascade) {
            return node.checked ? 1 : 0;
        }

        if (this.isEveryChildChecked(node)) {
            return 1;
        }

        if (this.isSomeChildChecked(node)) {
            return 2;
        }

        return 0;
    }

    getLoadingState = (node) => {
        if(node.loading) {
            return true;
        }

        return false;
    }

    toggleChecked(node, isChecked, noCascade) {
        if (this.isChildrenEmpty(node) ) {
            // Set the check status of a leaf node or an uncoupled parent if the node is not disabled
            if(!node.disabled) {
                this.toggleNode('checked', node, isChecked);
            }
        } else {
            this.toggleNode('checked', node, isChecked);
            // Percolate check status down to all children
            node.children.forEach((child) => {
                this.toggleChecked(child, isChecked);
            });
        }
    }

    toggleNode(key, node, toggleValue) {
        this.nodes[node.value][key] = toggleValue;
    }

    flattenNodes(nodes, showHiddenFiles, expanded, parentNodeValue='root') {
        if (!Array.isArray(nodes) || nodes.length === 0) {
            return;
        }

        nodes.forEach((node, index) => {
            this.nodes[node.value] = {};

            this.nodes[node.value]['parent'] = parentNodeValue

            // Copying each key of the node
            for(let key in node) {
                this.nodes[node.value][key] = node[key];            
            }

            this.flattenNodes(node.children, showHiddenFiles, expanded, node.value);
        });
    }

    unserializeLists(lists) {
        // Reset values to false
        Object.keys(this.nodes).forEach((value) => {
            Object.keys(lists).forEach((listKey) => {
                this.nodes[value][listKey] = false;
            });
        });

        // Unserialize values and set their nodes to true
        Object.keys(lists).forEach((listKey) => {
            lists[listKey].forEach((value) => {
                this.nodes[value][listKey] = true;
            });
        });
    }

    serializeList(key) {
        const list = [];

        Object.keys(this.nodes).forEach((value) => {
            if (this.nodes[value][key]) {
                list.push(value);
            }
        });

        return list;
    }

    isEveryChildChecked(node) {
        return node.children.every((child) => {
            if (!this.isChildrenEmpty(child)) {
                return this.isEveryChildChecked(child);
            }

            return this.nodes[child.value].checked;
        });
    }

    isSomeChildChecked(node) {
        return node.children.some((child) => {
            if (!this.isChildrenEmpty(child)) {
                return this.isSomeChildChecked(child);
            }

            return this.nodes[child.value].checked || this.nodes[child.value].halfChecked;
        });
    }

    renderTreeNodes(nodes) {
        const { showHiddenFiles, expandDisabled, noCascade, optimisticToggle, showNodeIcon } = this.props;
        let checkable = this.props.checkable;
        const treeNodes = nodes.map((node) => {
            const key = `${node.value}`;
            const checked = this.getCheckState(node, noCascade);
            const loading = this.getLoadingState(node);
            let nodeCheckable = checkable;
            let firstNodeIndex = (this.state.startNodeIndex > 0 ? this.state.startNodeIndex-1 : this.state.startNodeIndex);
            
            // We not use checkable property for nodes except the 'inSync Share' node inside selective sync listing.
            // Backend sends 'cehckable' as false for this node.
            if(node.hasOwnProperty('checkable')) {
                nodeCheckable = node.checkable;
            }

            return (
                <TreeNode
                    checkable={nodeCheckable}
                    showHiddenFiles={showHiddenFiles}
                    isLeaf={node.isLeaf}
                    key={key}
                    checked={checked}
                    evenNode={node.evenNode}
                    className={node.className}
                    disabled={node.disabled}
                    hidden={node.hidden}
                    loading={loading}
                    expandDisabled={expandDisabled}
                    expanded={node.expanded}
                    icon={node.icon}
                    tooltipText={node.tooltipText}
                    label={node.label}
                    optimisticToggle={optimisticToggle}
                    rawChildren={node.children}
                    showNodeIcon={showNodeIcon}
                    treeId={this.id}
                    value={node.value}
                    onCheck={this.onCheck}
                    onExpand={this.onExpand}
                    index={node.index}
                    level={node.level}
                    firstNodeIndex={firstNodeIndex}
                >
                </TreeNode>
            );
        });

        return treeNodes;
    }

    renderHiddenInput() {
        if (this.props.name === undefined) {
            return null;
        }

        if (this.props.nameAsArray) {
            return this.renderArrayHiddenInput();
        }

        return this.renderJoinedHiddenInput();
    }

    renderArrayHiddenInput() {
        return this.props.checked.map((value) => {
            const name = `${this.props.name}[]`;

            return <input key={value} name={name} type="hidden" value={value} />;
        });
    }

    renderJoinedHiddenInput() {
        const checked = this.props.checked.join(',');

        return <input name={this.props.name} type="hidden" value={checked} />;
    }

    getNodesToRender = (startNodeIndex, endNodeIndex, nodesArray) => {
        let nodesToRender = [];
        for(let i=0; i<nodesArray.length; i++) {
            if(startNodeIndex - 2 <= nodesArray[i].index && endNodeIndex >= nodesArray[i].index) {
                nodesToRender.push(nodesArray[i]);
            }
        }

        nodesToRender.sort(function(a, b) {
            return parseFloat(a.index) - parseFloat(b.index);
        });

        return nodesToRender;
    }

    onScroll = () => {
        if(Object.keys(this.nodes).length <= this.numberOfNodesToRender) {
            return;
        }
        const container = this.refs.insyncTreeContainer,
            containerDom = ReactDOM.findDOMNode(container),
            scrollTop = containerDom.scrollTop,
            startNodePosition = Math.ceil(scrollTop / this.props.childHeight),
            startNodeIndex = startNodePosition === 0 ? startNodePosition : startNodePosition - 1,
            endNodeIndex = startNodeIndex + this.state.numberOfNodesToRender - 1;

        this.setState({
            scrollTop,
            startNodeIndex,
            endNodeIndex
        });
    }

    isAnyParentCollapsed = (nodes, node) => {
        // If the parent's value is root it means there is no parent to this node.
        // We need to show the root node irrespective of the fact that it's expanded or collapsed.
        if(node.parent === 'root') {
            return false;
        }

        if(nodes[node.parent] && !nodes[node.parent].expanded) {
            return true;
        } else {
            return this.isAnyParentCollapsed(nodes, nodes[node.parent])
        }
    }

    getDisplaybleNodesArray = (nodes) => {
        let nodesArray = [];
        Object.keys(nodes).forEach((key) => {
            // If "showhiddenFiles" is true, display all the nodes except the ones whoose any of the parent is collapsed.
            // Else, dsiplay the nodes which are not hidden and whoose any of the parent is not collapsed.
            
            if(this.props.showHiddenFiles) {
                if(!this.isAnyParentCollapsed(nodes, nodes[key]) ) {
                    nodesArray.push(nodes[key]);
                }
            } else {
                if(!nodes[key].hidden && !this.isAnyParentCollapsed(nodes, nodes[key]) ) {
                    nodesArray.push(nodes[key]);
                }
            }
        });

        return nodesArray;
    }

    updateNodeMetaData = (nodesArray) => {
        let updatedNodesArray = nodesArray.map(function(node, index) {
            node.index = index;
            node.evenNode = ( index % 2 ) === 0;
            return node;
        });

        return updatedNodesArray;
    }

    isChildrenEmpty = (node) => {
        if(node.children === null) return true;

        if(Array.isArray(node.children) && node.children.length <=0) return true;

        return false;
    }

    render() {
        let nodesArray = this.getDisplaybleNodesArray(this.nodes);
        nodesArray = this.updateNodeMetaData(nodesArray);
        const totalNodes = nodesArray.length,
            startNodeIndex = this.state.startNodeIndex,
            endNodeIndex = this.state.endNodeIndex,
            childHeight = this.props.childHeight;
        
        let topDivHeight = 0,
            bottomDivHeight = 0;
        
            if(totalNodes <= this.state.numberOfNodesToRender) {
                topDivHeight = 0;
                bottomDivHeight = 0;
            } else {
                topDivHeight = startNodeIndex * childHeight;
                bottomDivHeight = ( totalNodes - startNodeIndex - this.state.numberOfNodesToRender ) * childHeight;
                if(bottomDivHeight < 0) {
                    bottomDivHeight = 0;
                }
            }
        

        const nodesToRender = this.getNodesToRender(startNodeIndex, endNodeIndex, nodesArray);

        const treeNodes = this.renderTreeNodes(nodesToRender);
        const className = classNames({
            'react-checkbox-tree': true,
            'static-tree': !this.props.checkable,
            'rvt-disabled': this.props.disabled,
        });

        return (
            <div className={className} role="tree" onScroll={() => this.onScroll()} ref="insyncTreeContainer">
                {this.renderHiddenInput()}
                <div style={{height: topDivHeight}} key="top"></div>
                {treeNodes}
                <div style={{height: bottomDivHeight}} key="bottom"></div>
            </div>
        );
    }
}

export default Tree;
