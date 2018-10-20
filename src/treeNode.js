import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import nodeShape from './nodeShape';
import loaderImage from './assets/loader.gif';

class TreeNode extends React.Component {
    static propTypes = {
        isLeaf: PropTypes.bool.isRequired,
        checked: PropTypes.number.isRequired,
        disabled: PropTypes.bool,
        loading: PropTypes.bool,
        expandDisabled: PropTypes.bool.isRequired,
        expanded: PropTypes.bool.isRequired,
        label: PropTypes.string.isRequired,
        optimisticToggle: PropTypes.bool.isRequired,
        showNodeIcon: PropTypes.bool.isRequired,
        treeId: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        onCheck: PropTypes.func.isRequired,
        onExpand: PropTypes.func.isRequired,

        children: PropTypes.node,
        className: PropTypes.string,
        icon: PropTypes.node,
        rawChildren: PropTypes.arrayOf(nodeShape),

        index: PropTypes.number,
        level: PropTypes.number.isRequired
    };

    static defaultProps = {
        children: null,
        className: null,
        icon: null,
        rawChildren: null,
        disabled: false,
        loading: false,
        index: null
    };

    constructor(props) {
        super(props);

        this.onCheck = this.onCheck.bind(this);
        this.onExpand = this.onExpand.bind(this);
    }

    onCheck() {
        let isChecked = false;

        // Toggle off state to checked
        if (this.props.checked === 0) {
            isChecked = true;
        }

        // Toggle partial state based on cascade model
        if (this.props.checked === 2) {
            isChecked = this.props.optimisticToggle;
        }

        this.props.onCheck({
            value: this.props.value,
            checked: isChecked,
            children: this.props.rawChildren,
        });
    }

    onExpand() {
        let isChecked = false;
        
        if(this.props.checked === 0) {
            isChecked = false;
        } else if (this.props.checked === 1) {
            isChecked = true;
        } else if(this.props.isChecked === 2) {
            isChecked = this.props.optimisticToggle;
        }

        const expanded = !this.props.expanded;
        
        let loading = false;
        if(expanded) {
            loading = true;
        }
        
        this.props.onExpand({
            value: this.props.value,
            checked: isChecked,
            expanded: expanded,
            loading: loading,
            halfChecked: (this.props.checked === 2)
        });
    }

    hasChildren() {
        return this.props.rawChildren !== null;
    }

    renderCollapseButton() {
        const { expandDisabled, isLeaf } = this.props;

        if (isLeaf) {
            return (
                <span className="rvt-collapse" aria-hidden="true">
                    <span className="rvt-icon" />
                </span>
            );
        }

        if(this.props.loading) {
            return (
                <span
                    aria-label="Loading"
                    className="rvt-collapse rvt-collapse-btn"
                    type="button"
                    aria-hidden="true"
                >
                    <img src={loaderImage} alt="loading" />
                </span>
            );
        }

        return (
            <button
                className="rvt-collapse rvt-collapse-btn"
                disabled={expandDisabled}
                type="button"
                onClick={this.onExpand}
                tabIndex="-1"
            >
                {this.renderCollapseIcon()}
            </button>
        );
    }

    renderCollapseIcon() {
        

        if (!this.props.expanded) {
            return <span className="rvt-icon rvt-icon-expand-close" />;
        }

        return <span className="rvt-icon rvt-icon-expand-open" />;
    }

    renderCheckboxIcon() {
        if (this.props.checked === 0) {
            return <span className="rvt-icon rvt-icon-uncheck" />;
        }

        if (this.props.checked === 1) {
            return <span className="rvt-icon rvt-icon-check" />;
        }

        return <span className="rvt-icon rvt-icon-half-check" />;
    }

    renderNodeIcon() {
        if (this.props.icon !== null) {
            return <img aria-hidden="true" src={this.props.icon} alt="icon" />;
        }

        if (!this.hasChildren()) {
            return <span className="rvt-icon rvt-icon-leaf" />;
        }

        if (!this.props.expanded) {
            return <span className="rvt-icon rvt-icon-parent-close" />;
        }

        return <span className="rvt-icon rvt-icon-parent-open" />;
    }

    renderChildren() {
        if (!this.props.expanded) {
            return null;
        }

        return this.props.children;
    }

    render() {
        const { checkable, evenNode, checked, className, disabled, treeId, label, showNodeIcon, value, tooltipText, expanded, index, level, firstNodeIndex, isLeaf } = this.props;
        const inputId = `${treeId}-${value}`;
        const nodeClass = classNames({
            'rvt-node': true,
            'rvt-node-parent': this.hasChildren(),
            'rvt-node-leaf': !this.hasChildren(),
            'expanded-node': expanded
        }, className);
        const outerSpanClass = classNames({
            'rvt-text': true,
            'selected-node': (checked === 1),
            'even-node': evenNode,
        });
        let labelText = isLeaf ? '': 'Folder'
        let blankSpacesArray = [];
        for (let i=0; i<level*8; i++) {
            blankSpacesArray.push(<span key={i}>&nbsp;</span>);
        }
        return (
            
            <div className={nodeClass} role="treeitem" aria-label={`${label} ${labelText}`} aria-level={level + 1} { ...(isLeaf ? {}: {'aria-expanded' : level === 0 ? 'true' : 'false'}) } data-nodevalue={value} tabIndex={firstNodeIndex === index ? 0 : -1}>
                <span aria-hidden="true" className={outerSpanClass} data-tip={tooltipText} data-effect="float">
                    {blankSpacesArray}
                    {this.renderCollapseButton()}
                    <label htmlFor={inputId} className={disabled ? 'disabled' : ''}>
                        {checkable && <input
                            checked={checked === 1}
                            disabled={disabled}
                            id={inputId}
                            type="checkbox"
                            tabIndex="-1"
                            onChange={this.onCheck}
                        />}
                        {checkable && <span className="rvt-checkbox">
                            {this.renderCheckboxIcon()}
                        </span>}
                        
                        {!checkable && <input
                            checked={checked === 1}
                            disabled={disabled}
                            id={inputId}
                            type="radio"
                            name="treeNodeRadio"
                            value={value}
                            onChange={this.onCheck}
                        />}
                        
                        {showNodeIcon ? (
                            <span className="rvt-node-icon">
                                {this.renderNodeIcon()}
                            </span>
                        ) : null}
                        <span className="rvt-title">
                            {label}
                        </span>
                    </label>
                </span>
                {this.renderChildren()}
            </div>
        );
    }
}

export default TreeNode;
